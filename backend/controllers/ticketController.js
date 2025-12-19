import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
    try {
        console.log('=== CREATE TICKET DEBUG ===');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        console.log('req.user:', req.user);

        const { requester, subject, description, type, priority, tags } = req.body;

        // Validate required fields
        if (!requester || !subject || !description) {
            return res.status(400).json({
                message: 'Missing required fields',
                missing: {
                    requester: !requester,
                    subject: !subject,
                    description: !description
                }
            });
        }

        // Handle file attachments if present
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        })) : [];

        console.log('Creating ticket with data:', {
            requester,
            subject,
            description,
            type,
            priority,
            attachments: attachments.length
        });

        const ticketData = {
            requester,
            subject,
            description,
            type: type || 'Question',
            priority: priority || 'Medium',
            tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
            attachments
        };

        // Auto-assign to agent if created by agent
        if (req.user.role === 'agent') {
            ticketData.assignedTo = req.user._id;
            ticketData.teamId = req.user.teamId;
        }

        const ticket = await Ticket.create(ticketData);

        console.log('Ticket created successfully:', ticket._id);

        res.status(201).json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('=== CREATE TICKET ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
        res.status(500).json({
            message: 'Error creating ticket',
            error: error.message,
            details: error.errors || {}
        });
    }
};

// @desc    Get tickets (role-based filtering)
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
    try {
        const { role, _id, teamId } = req.user;
        const { status, priority, type, search, assignedTo, page = 1, limit = 20 } = req.query;

        let query = {};

        // Role-based filtering
        if (role === 'agent') {
            // Agents see only their assigned tickets
            query.assignedTo = _id;
        } else if (role === 'company_manager') {
            // Managers see all tickets in their team
            if (teamId) {
                query.teamId = teamId;
            }
        }
        // Company admins and super admins see all tickets (no filter)

        // Apply additional filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (type) query.type = type;
        if (assignedTo && (role === 'super_admin' || role === 'company_admin' || role === 'company_manager')) {
            query.assignedTo = assignedTo;
        }

        // Search functionality
        if (search) {
            query.$or = [
                { ticketNumber: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { requester: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const tickets = await Ticket.find(query)
            .populate('assignedTo', 'name email')
            .populate('teamId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Ticket.countDocuments(query);

        res.json({
            success: true,
            tickets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('assignedTo', 'name email role')
            .populate('teamId', 'name description')
            .populate('replies.userId', 'name email role');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check access permissions
        const { role, _id, teamId } = req.user;

        if (role === 'agent') {
            // Handle both populated and non-populated assignedTo
            const assignedToId = ticket.assignedTo?._id || ticket.assignedTo;
            if (!assignedToId || assignedToId.toString() !== _id.toString()) {
                return res.status(403).json({ message: 'Access denied to this ticket' });
            }
        }

        if (role === 'company_manager') {
            const ticketTeamId = ticket.teamId?._id || ticket.teamId;
            if (!ticketTeamId || ticketTeamId.toString() !== teamId?.toString()) {
                return res.status(403).json({ message: 'Access denied to this ticket' });
            }
        }

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ message: 'Error fetching ticket', error: error.message });
    }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res) => {
    try {
        const { status, priority, tags, type } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Update allowed fields
        if (status) {
            ticket.status = status;
            if (status === 'Resolved') ticket.resolvedAt = new Date();
            if (status === 'Closed') ticket.closedAt = new Date();
        }
        if (priority) ticket.priority = priority;
        if (tags) ticket.tags = tags;
        if (type) ticket.type = type;

        await ticket.save();

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ message: 'Error updating ticket', error: error.message });
    }
};

// @desc    Assign ticket to agent
// @route   POST /api/tickets/:id/assign
// @access  Private (Manager/Admin only)
export const assignTicket = async (req, res) => {
    try {
        const { agentId, teamId } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify agent exists and is active
        if (agentId) {
            const agent = await User.findById(agentId);
            if (!agent || !agent.isActive) {
                return res.status(400).json({ message: 'Invalid or inactive agent' });
            }
            ticket.assignedTo = agentId;
        }

        if (teamId) {
            ticket.teamId = teamId;
        }

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('assignedTo', 'name email')
            .populate('teamId', 'name');

        res.json({
            success: true,
            ticket: updatedTicket
        });
    } catch (error) {
        console.error('Assign ticket error:', error);
        res.status(500).json({ message: 'Error assigning ticket', error: error.message });
    }
};

// @desc    Add reply to ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
export const addReply = async (req, res) => {
    try {
        const { content, isPrivateNote = false } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Reply content is required' });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.replies.push({
            userId: req.user._id,
            content,
            isPrivateNote
        });

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('replies.userId', 'name email role');

        res.json({
            success: true,
            ticket: updatedTicket
        });
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({ message: 'Error adding reply', error: error.message });
    }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin only)
export const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        await ticket.deleteOne();

        res.json({
            success: true,
            message: 'Ticket deleted successfully'
        });
    } catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({ message: 'Error deleting ticket', error: error.message });
    }
};
