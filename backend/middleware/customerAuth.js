import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';

// Protect customer routes
export const protectCustomer = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please login.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token is for customer
        if (decoded.type !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Customer access only.'
            });
        }

        // Get customer from token
        const customer = await Customer.findById(decoded.id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (!customer.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Attach customer to request
        req.customer = customer;
        next();
    } catch (error) {
        console.error('Customer auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
