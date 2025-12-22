import Ticket from '../models/Ticket.js';

// @desc    Bulk assign tickets
// @route   POST /api/tickets/bulk-assign
// @access  Private
export const bulkAssign = async (req, res) => {
    try {
        const { ticketIds, assignType } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return res.status(400).json({ message: 'No tickets selected' });
        }

        const assignedTo = assignType === 'me' ? req.user._id : null;
        const updateData = { assignedTo };

        if (req.user.teamId) {
            updateData.teamId = req.user.teamId;
        }

        const result = await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            updateData
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} ticket(s) assigned successfully`
        });
    } catch (error) {
        console.error('Bulk assign error:', error);
        res.status(500).json({ message: 'Bulk assign failed', error: error.message });
    }
};

// @desc    Bulk change ticket status
// @route   POST /api/tickets/bulk-status
// @access  Private
export const bulkStatusChange = async (req, res) => {
    try {
        const { ticketIds, status } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return res.status(400).json({ message: 'No tickets selected' });
        }

        if (!['Open', 'Pending', 'Resolved', 'Closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Prepare update data with timestamps
        const updateData = { status };
        if (status === 'Resolved') {
            updateData.resolvedAt = new Date();
        } else if (status === 'Closed') {
            updateData.closedAt = new Date();
        }

        const result = await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            updateData
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} ticket(s) status updated to ${status}`
        });
    } catch (error) {
        console.error('Bulk status change error:', error);
        res.status(500).json({ message: 'Bulk status change failed', error: error.message });
    }
};

// @desc    Bulk change ticket priority
// @route   POST /api/tickets/bulk-priority
// @access  Private
export const bulkPriorityChange = async (req, res) => {
    try {
        const { ticketIds, priority } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return res.status(400).json({ message: 'No tickets selected' });
        }

        if (!['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority' });
        }

        const result = await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            { priority }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} ticket(s) priority updated to ${priority}`
        });
    } catch (error) {
        console.error('Bulk priority change error:', error);
        res.status(500).json({ message: 'Bulk priority change failed', error: error.message });
    }
};

// @desc    Bulk delete tickets
// @route   POST /api/tickets/bulk-delete
// @access  Private (Admin/Manager only)
export const bulkDelete = async (req, res) => {
    try {
        const { ticketIds } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return res.status(400).json({ message: 'No tickets selected' });
        }

        // Check user role - only admins and managers can bulk delete
        const { role } = req.user;
        if (!['super_admin', 'company_admin', 'company_manager'].includes(role)) {
            return res.status(403).json({ message: 'Insufficient permissions to delete tickets' });
        }

        const result = await Ticket.deleteMany(
            { _id: { $in: ticketIds } }
        );

        res.json({
            success: true,
            message: `${result.deletedCount} ticket(s) deleted successfully`
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ message: 'Bulk delete failed', error: error.message });
    }
};

// @desc    Bulk add/remove tags
// @route   POST /api/tickets/bulk-tags
// @access  Private
export const bulkTags = async (req, res) => {
    try {
        const { ticketIds, tags, action } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return res.status(400).json({ message: 'No tickets selected' });
        }

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return res.status(400).json({ message: 'No tags provided' });
        }

        if (!['add', 'remove'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action. Use "add" or "remove"' });
        }

        const updateOperation = action === 'add'
            ? { $addToSet: { tags: { $each: tags } } }
            : { $pull: { tags: { $in: tags } } };

        const result = await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            updateOperation
        );

        res.json({
            success: true,
            message: `Tags ${action === 'add' ? 'added to' : 'removed from'} ${result.modifiedCount} ticket(s)`
        });
    } catch (error) {
        console.error('Bulk tags error:', error);
        res.status(500).json({ message: 'Bulk tags operation failed', error: error.message });
    }
};

// @desc    Bulk archive tickets
// @route   POST /api/tickets/bulk-archive
// @access  Private
export const bulkArchive = async (req, res) => {
    try {
        const { ticketIds } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return res.status(400).json({ message: 'No tickets selected' });
        }

        const result = await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            {
                status: 'Closed',
                isArchived: true,
                archivedAt: new Date(),
                archivedBy: req.user._id
            }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} ticket(s) archived successfully`
        });
    } catch (error) {
        console.error('Bulk archive error:', error);
        res.status(500).json({ message: 'Bulk archive failed', error: error.message });
    }
};
