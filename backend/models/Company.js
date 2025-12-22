import mongoose from 'mongoose';
import slugify from 'slugify';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a company name'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    domain: {
        type: String,
        trim: true,
        lowercase: true
    },
    logo: {
        type: String,
        default: ''
    },
    primaryColor: {
        type: String,
        default: '#3B82F6' // Default blue
    },
    settings: {
        timezone: {
            type: String,
            default: 'UTC'
        },
        businessHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '17:00' }
        },
        allowedDomains: [{
            type: String,
            lowercase: true
        }]
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'professional', 'enterprise'],
            default: 'basic'
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'cancelled'],
            default: 'active'
        },
        limits: {
            maxUsers: { type: Number, default: 10 },
            maxTicketsPerMonth: { type: Number, default: 1000 },
            maxTeams: { type: Number, default: 5 }
        },
        expiresAt: {
            type: Date
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        industry: String,
        size: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '500+']
        },
        country: String
    }
}, {
    timestamps: true
});

// Generate slug before saving
companySchema.pre('save', async function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

// Index for faster queries
companySchema.index({ slug: 1 });
companySchema.index({ domain: 1 });
companySchema.index({ isActive: 1 });

const Company = mongoose.model('Company', companySchema);

export default Company;
