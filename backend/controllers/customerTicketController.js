import Ticket from '../models/Ticket.js';
import Company from '../models/Company.js';
import emailService from '../services/emailService.js';

// @desc    Get customer's tickets
// @route   GET /api/customer/tickets
// @access  Private (Customer)
export const getCustomerTickets = async (req, res) => {
    try {
        const { status, search } = req.query;

        // Build query
        const query = { customerId: req.customer._id };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { ticketNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        console.error('Get customer tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get tickets',
            error: error.message
        });
    }
};

// @desc    Create new ticket (customer)
// @route   POST /api/customer/tickets
// @access  Private (Customer)
export const createCustomerTicket = async (req, res) => {
    try {
        const { subject, description, type, priority } = req.body;

        if (!subject || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide subject and description'
            });
        }

        // Handle file attachments
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        })) : [];

        // Get or create default company for customer
        let company = await Company.findOne({ name: 'Customer Portal' });
        if (!company) {
            company = await Company.create({
                name: 'Customer Portal',
                slug: 'customer-portal',
                subscription: { plan: 'basic' }
            });
        }

        // Create ticket
        const ticket = await Ticket.create({
            requester: req.customer.email,
            subject,
            description,
            type: type || 'Question',
            priority: priority || 'Medium',
            customerId: req.customer._id,
            companyId: company._id,
            source: 'Portal',
            attachments
        });

        // Send email notification to customer
        await emailService.sendTicketCreated(
            ticket,
            req.customer.email,
            req.customer.name
        );

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticket
        });
    } catch (error) {
        console.error('Create customer ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create ticket',
            error: error.message
        });
    }
};

// @desc    Get single ticket details (customer)
// @route   GET /api/customer/tickets/:id
// @access  Private (Customer)
export const getCustomerTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('replies.userId', 'name email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Verify ticket belongs to customer
        if (ticket.customerId.toString() !== req.customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Get customer ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ticket',
            error: error.message
        });
    }
};

// @desc    Add reply to ticket (customer)
// @route   POST /api/customer/tickets/:id/reply
// @access  Private (Customer)
export const addCustomerReply = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide reply content'
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Verify ticket belongs to customer
        if (ticket.customerId.toString() !== req.customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Handle file attachments
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        })) : [];

        // Add reply (we'll use a special marker for customer replies)
        ticket.replies.push({
            userId: req.customer._id,
            content,
            isCustomerReply: true,
            attachments,
            createdAt: new Date()
        });

        // Update ticket status if closed
        if (ticket.status === 'Closed') {
            ticket.status = 'Open';
        }

        await ticket.save();

        res.json({
            success: true,
            message: 'Reply added successfully',
            ticket
        });
    } catch (error) {
        console.error('Add customer reply error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reply',
            error: error.message
        });
    }
};

// @desc    Close ticket (customer)
// @route   POST /api/customer/tickets/:id/close
// @access  Private (Customer)
export const closeCustomerTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Verify ticket belongs to customer
        if (ticket.customerId.toString() !== req.customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        ticket.status = 'Closed';
        ticket.closedAt = new Date();
        await ticket.save();

        res.json({
            success: true,
            message: 'Ticket closed successfully',
            ticket
        });
    } catch (error) {
        console.error('Close customer ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to close ticket',
            error: error.message
        });
    }
};

// @desc    Reopen ticket (customer)
// @route   POST /api/customer/tickets/:id/reopen
// @access  Private (Customer)
export const reopenCustomerTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Verify ticket belongs to customer
        if (ticket.customerId.toString() !== req.customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        ticket.status = 'Open';
        ticket.closedAt = null;
        await ticket.save();

        res.json({
            success: true,
            message: 'Ticket reopened successfully',
            ticket
        });
    } catch (error) {
        console.error('Reopen customer ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reopen ticket',
            error: error.message
        });
    }
};
