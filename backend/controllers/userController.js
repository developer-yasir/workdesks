import User from '../models/User.js';
import Team from '../models/Team.js';

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, teamId } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            teamId: teamId || null
        });

        res.status(201).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Manager)
export const getUsers = async (req, res) => {
    try {
        const { role, teamId } = req.user;
        let query = {};

        // Managers can only see users in their team
        if (role === 'company_manager' && teamId) {
            query.teamId = teamId;
        }

        const users = await User.find(query)
            .select('-password')
            .populate('teamId', 'name');

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('teamId', 'name description');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin/Manager)
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, teamId, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role && req.user.role === 'super_admin') user.role = role; // Only admin can change roles
        if (teamId !== undefined) user.teamId = teamId;
        if (isActive !== undefined && req.user.role === 'super_admin') user.isActive = isActive;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select('-password')
            .populate('teamId', 'name');

        res.json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// @desc    Deactivate user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ message: 'Error deactivating user', error: error.message });
    }
};
