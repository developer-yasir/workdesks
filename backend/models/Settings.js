import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    // General Settings
    general: {
        companyName: {
            type: String,
            default: 'WorkDesks'
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        language: {
            type: String,
            default: 'en'
        },
        dateFormat: {
            type: String,
            default: 'MM/DD/YYYY'
        }
    },

    // Email Settings
    email: {
        smtpHost: String,
        smtpPort: Number,
        smtpSecure: Boolean,
        smtpUser: String,
        smtpPass: String,
        emailFrom: String,
        imapHost: String,
        imapPort: Number,
        imapTls: Boolean,
        imapUser: String,
        imapPass: String,
        imapPollInterval: {
            type: Number,
            default: 60000
        }
    },

    // Ticket Settings
    tickets: {
        defaultPriority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        autoAssignment: {
            type: Boolean,
            default: false
        },
        allowCustomerReply: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        }
    },

    // Security Settings
    security: {
        passwordMinLength: {
            type: Number,
            default: 8
        },
        passwordRequireUppercase: {
            type: Boolean,
            default: true
        },
        passwordRequireNumbers: {
            type: Boolean,
            default: true
        },
        passwordRequireSpecialChars: {
            type: Boolean,
            default: false
        },
        sessionTimeout: {
            type: Number,
            default: 3600000 // 1 hour in milliseconds
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        }
    },

    // Notification Settings
    notifications: {
        emailOnTicketCreated: {
            type: Boolean,
            default: true
        },
        emailOnTicketAssigned: {
            type: Boolean,
            default: true
        },
        emailOnTicketReply: {
            type: Boolean,
            default: true
        },
        emailOnTicketStatusChange: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Settings', settingsSchema);

