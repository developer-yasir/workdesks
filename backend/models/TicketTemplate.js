import mongoose from 'mongoose';

const ticketTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Template must belong to a company']
    },
    defaultSubject: {
        type: String,
        trim: true,
        default: ''
    },
    defaultDescription: {
        type: String,
        default: ''
    },
    defaultPriority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    defaultType: {
        type: String,
        enum: ['Question', 'Incident', 'Problem', 'Feature Request', 'Refund'],
        default: 'Question'
    },
    defaultAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    defaultTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    defaultTags: [{
        type: String,
        trim: true
    }],
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
ticketTemplateSchema.index({ companyId: 1, isActive: 1 });
ticketTemplateSchema.index({ name: 1, companyId: 1 });

const TicketTemplate = mongoose.model('TicketTemplate', ticketTemplateSchema);

export default TicketTemplate;
