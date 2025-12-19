import mongoose from 'mongoose';

const cannedResponseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please provide content']
    },
    category: {
        type: String,
        enum: ['Greeting', 'Closing', 'Technical', 'Billing', 'General'],
        default: 'General'
    },
    isGlobal: {
        type: Boolean,
        default: false
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
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const CannedResponse = mongoose.model('CannedResponse', cannedResponseSchema);

export default CannedResponse;
