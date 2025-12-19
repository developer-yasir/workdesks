import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true
    },
    requester: {
        type: String,
        required: [true, 'Please provide requester email'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    type: {
        type: String,
        enum: ['Question', 'Incident', 'Problem', 'Feature Request'],
        default: 'Question'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'Pending', 'Resolved', 'Closed'],
        default: 'Open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    replies: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        isPrivateNote: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolvedAt: {
        type: Date,
        default: null
    },
    closedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Auto-generate ticket number before saving
ticketSchema.pre('save', async function () {
    if (!this.ticketNumber) {
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
    }
});

// Indexes for faster queries
ticketSchema.index({ status: 1, assignedTo: 1 });
ticketSchema.index({ teamId: 1, status: 1 });
ticketSchema.index({ ticketNumber: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
