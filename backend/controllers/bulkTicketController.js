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

        const result = await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            { status }
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
