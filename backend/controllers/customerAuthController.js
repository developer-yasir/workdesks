import Customer from '../models/Customer.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id, type: 'customer' }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new customer
// @route   POST /api/auth/customer/register
// @access  Public
export const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, phone, company } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create customer
        const customer = await Customer.create({
            name,
            email,
            password,
            phone,
            company
        });

        // Generate token
        const token = generateToken(customer._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                role: customer.role
            }
        });
    } catch (error) {
        console.error('Customer registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// @desc    Login customer
// @route   POST /api/auth/customer/login
// @access  Public
export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find customer and include password
        const customer = await Customer.findOne({ email }).select('+password');

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!customer.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await customer.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        customer.lastLogin = new Date();
        await customer.save();

        // Generate token
        const token = generateToken(customer._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                role: customer.role
            }
        });
    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// @desc    Get customer profile
// @route   GET /api/auth/customer/profile
// @access  Private (Customer)
export const getCustomerProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                role: customer.role,
                isVerified: customer.isVerified,
                preferences: customer.preferences,
                createdAt: customer.createdAt
            }
        });
    } catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

// @desc    Update customer profile
// @route   PUT /api/auth/customer/profile
// @access  Private (Customer)
export const updateCustomerProfile = async (req, res) => {
    try {
        const { name, phone, company, preferences } = req.body;

        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Update fields
        if (name) customer.name = name;
        if (phone !== undefined) customer.phone = phone;
        if (company !== undefined) customer.company = company;
        if (preferences) customer.preferences = { ...customer.preferences, ...preferences };

        await customer.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                preferences: customer.preferences
            }
        });
    } catch (error) {
        console.error('Update customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// @desc    Change customer password
// @route   PUT /api/auth/customer/password
// @access  Private (Customer)
export const changeCustomerPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters'
            });
        }

        const customer = await Customer.findById(req.customer._id).select('+password');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Verify current password
        const isPasswordValid = await customer.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        customer.password = newPassword;
        await customer.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};
