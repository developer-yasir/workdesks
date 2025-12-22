import mongoose from 'mongoose';

const companyRelationshipSchema = new mongoose.Schema({
    providerCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    clientCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    relationshipType: {
        type: String,
        enum: ['provider-client', 'partner', 'subsidiary'],
        default: 'provider-client'
    },
    slaAgreement: {
        responseTime: {
            urgent: { type: Number, default: 2 }, // hours
            high: { type: Number, default: 4 },
            medium: { type: Number, default: 8 },
            low: { type: Number, default: 24 }
        },
        resolutionTime: {
            urgent: { type: Number, default: 8 },
            high: { type: Number, default: 24 },
            medium: { type: Number, default: 48 },
            low: { type: Number, default: 120 }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure unique relationship between two companies
companyRelationshipSchema.index({ providerCompany: 1, clientCompany: 1 }, { unique: true });

// Prevent self-relationship
companyRelationshipSchema.pre('save', function (next) {
    if (this.providerCompany.equals(this.clientCompany)) {
        next(new Error('A company cannot have a relationship with itself'));
    }
    next();
});

const CompanyRelationship = mongoose.model('CompanyRelationship', companyRelationshipSchema);

export default CompanyRelationship;
