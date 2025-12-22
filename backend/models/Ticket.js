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
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Ticket must belong to a company']
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null // Set when ticket is created by a customer via portal
    },
    clientCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        default: null // If set, this is an inter-company ticket
    },
    isInternal: {
        type: Boolean,
        default: true // false for inter-company tickets
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
    },
    watchers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    escalatedAt: {
        type: Date,
        default: null
    },
    escalatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    escalationReason: {
        type: String,
        default: ''
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketTemplate',
        default: null
    },
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // SLA Tracking
    firstResponseDue: {
        type: Date,
        default: null
    },
    resolutionDue: {
        type: Date,
        default: null
    },
    slaBreached: {
        type: Boolean,
        default: false
    },
    firstResponseAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// SLA calculation helper function
const calculateSLADates = (priority, createdAt) => {
    const created = new Date(createdAt);
    const slaConfig = {
        Urgent: { firstResponse: 2, resolution: 8 },
        High: { firstResponse: 4, resolution: 24 },
        Medium: { firstResponse: 8, resolution: 48 },
        Low: { firstResponse: 24, resolution: 120 }
    };

    const config = slaConfig[priority] || slaConfig.Medium;

    return {
        firstResponseDue: new Date(created.getTime() + config.firstResponse * 60 * 60 * 1000),
        resolutionDue: new Date(created.getTime() + config.resolution * 60 * 60 * 1000)
    };
};

// Auto-generate ticket number and calculate SLA before saving
ticketSchema.pre('save', async function () {
    if (!this.ticketNumber) {
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
    }

    // Calculate SLA dates for new tickets
    if (this.isNew) {
        const slaDates = calculateSLADates(this.priority, this.createdAt || new Date());
        this.firstResponseDue = slaDates.firstResponseDue;
        this.resolutionDue = slaDates.resolutionDue;
    }

    // Check for SLA breach
    const now = new Date();
    if (!this.firstResponseAt && this.firstResponseDue && now > this.firstResponseDue) {
        this.slaBreached = true;
    }
    if (this.status !== 'Resolved' && this.status !== 'Closed' && this.resolutionDue && now > this.resolutionDue) {
        this.slaBreached = true;
    }
});

// Indexes for faster queries
ticketSchema.index({ status: 1, assignedTo: 1 });
ticketSchema.index({ teamId: 1, status: 1 });
ticketSchema.index({ ticketNumber: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
