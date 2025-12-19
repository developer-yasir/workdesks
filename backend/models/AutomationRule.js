import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a rule name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    trigger: {
        event: {
            type: String,
            enum: ['ticket_created', 'ticket_updated', 'ticket_assigned', 'ticket_replied'],
            required: true
        },
        conditions: [{
            field: String, // e.g., 'priority', 'type', 'subject'
            operator: String, // e.g., 'equals', 'contains', 'greater_than'
            value: mongoose.Schema.Types.Mixed
        }]
    },
    actions: [{
        type: {
            type: String,
            enum: ['assign_to_team', 'assign_to_agent', 'set_priority', 'set_status', 'add_tag', 'send_notification'],
            required: true
        },
        value: mongoose.Schema.Types.Mixed
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    scope: {
        type: String,
        enum: ['global', 'team'],
        default: 'global'
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema);

export default AutomationRule;
