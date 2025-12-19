import express from 'express';
import {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    assignTicket,
    addReply,
    deleteTicket
} from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Ticket CRUD
router.route('/')
    .get(getTickets)
    .post(upload.array('attachments', 5), createTicket); // Allow up to 5 file attachments

router.route('/:id')
    .get(getTicket)
    .put(updateTicket)
    .delete(requireRole(['super_admin', 'company_admin']), deleteTicket);

// Ticket actions
router.post('/:id/assign', requireRole(['super_admin', 'company_admin', 'company_manager']), assignTicket);
router.post('/:id/reply', addReply);

export default router;
