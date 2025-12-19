import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);

        // Return user data without password
        const userData = user.toJSON();

        res.json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('teamId', 'name description');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Logout user (optional - mainly for token blacklisting if implemented)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    // Since we're using JWT, logout is handled client-side by removing the token
    // This endpoint is here for future token blacklisting implementation
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
