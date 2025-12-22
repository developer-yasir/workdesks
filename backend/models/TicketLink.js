import mongoose from 'mongoose';

const ticketLinkSchema = new mongoose.Schema({
    parentTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    childTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    linkType: {
        type: String,
        enum: ['blocks', 'blocked-by', 'relates-to', 'duplicate', 'parent-child'],
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate links
ticketLinkSchema.index({ parentTicket: 1, childTicket: 1, linkType: 1 }, { unique: true });

// Prevent self-linking
ticketLinkSchema.pre('save', function (next) {
    if (this.parentTicket.equals(this.childTicket)) {
        next(new Error('A ticket cannot be linked to itself'));
    }
    next();
});

const TicketLink = mongoose.model('TicketLink', ticketLinkSchema);

export default TicketLink;
