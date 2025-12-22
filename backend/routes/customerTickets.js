import express from 'express';
import {
    getCustomerTickets,
    createCustomerTicket,
    getCustomerTicket,
    addCustomerReply,
    closeCustomerTicket,
    reopenCustomerTicket
} from '../controllers/customerTicketController.js';
import { protectCustomer } from '../middleware/customerAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected (customer only)
router.use(protectCustomer);

// Ticket routes
router.route('/')
    .get(getCustomerTickets)
    .post(upload.array('attachments', 5), createCustomerTicket);

router.get('/:id', getCustomerTicket);
router.post('/:id/reply', upload.array('attachments', 3), addCustomerReply);
router.post('/:id/close', closeCustomerTicket);
router.post('/:id/reopen', reopenCustomerTicket);

export default router;
