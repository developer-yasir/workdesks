import User from '../models/User.js';
import Company from '../models/Company.js';


// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Super Admin)
export const getAllUsers = async (req, res) => {
    try {
        const { search, role, company, status, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        if (company) {
            query.companyId = company;
        }

        if (status) {
            query.isActive = status === 'active';
        }

        // Execute query with pagination
        const users = await User.find(query)
            .populate('companyId', 'name')
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (Super Admin)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, companyId, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            companyId,
            phone,
            isActive: true
        });

        // Remove password from response
        user.password = undefined;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Super Admin)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, companyId, phone, isActive } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (companyId) user.companyId = companyId;
        if (phone) user.phone = phone;
        if (typeof isActive !== 'undefined') user.isActive = isActive;

        await user.save();

        // Remove password from response
        user.password = undefined;

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete by setting isActive to false
        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Super Admin)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: user.isActive }
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling user status',
            error: error.message
        });
    }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Super Admin)
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                usersByRole
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user statistics',
            error: error.message
        });
    }
};
