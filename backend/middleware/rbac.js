import { hasPermission, hasRole } from '../utils/permissions.js';

// Middleware to check if user has required role
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!hasRole(req.user.role, allowedRoles)) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Middleware to check if user has specific permission
export const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                message: 'Access denied. You do not have the required permission.',
                requiredPermission: permission,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Middleware to check if user can access specific ticket
export const canAccessTicket = async (req, res, next) => {
    const { user } = req;
    const ticket = req.ticket; // Assume ticket is loaded in previous middleware

    if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
    }

    // Super admin can access all tickets
    if (user.role === 'super_admin') {
        return next();
    }

    // Company manager can access tickets in their team
    if (user.role === 'company_manager') {
        if (ticket.teamId && ticket.teamId.toString() === user.teamId?.toString()) {
            return next();
        }
    }

    // Agent can access tickets assigned to them
    if (user.role === 'agent') {
        if (ticket.assignedTo && ticket.assignedTo.toString() === user._id.toString()) {
            return next();
        }
    }

    return res.status(403).json({ message: 'Access denied to this ticket' });
};
