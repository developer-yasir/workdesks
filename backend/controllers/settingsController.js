import Settings from '../models/Settings.js';

// @desc    Get all settings
// @route   GET /api/admin/settings
// @access  Private (Super Admin)
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({});
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
};

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private (Super Admin)
export const updateSettings = async (req, res) => {
    try {
        const { general, email, tickets, security, notifications } = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({});
        }

        // Update sections
        if (general) {
            settings.general = { ...settings.general, ...general };
        }

        if (email) {
            settings.email = { ...settings.email, ...email };
        }

        if (tickets) {
            settings.tickets = { ...settings.tickets, ...tickets };
        }

        if (security) {
            settings.security = { ...settings.security, ...security };
        }

        if (notifications) {
            settings.notifications = { ...settings.notifications, ...notifications };
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
};

// @desc    Get email configuration
// @route   GET /api/admin/settings/email
// @access  Private (Super Admin)
export const getEmailConfig = async (req, res) => {
    try {
        const settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }

        // Don't send passwords in response
        const emailConfig = { ...settings.email.toObject() };
        if (emailConfig.smtpPass) emailConfig.smtpPass = '********';
        if (emailConfig.imapPass) emailConfig.imapPass = '********';

        res.status(200).json({
            success: true,
            data: emailConfig
        });
    } catch (error) {
        console.error('Get email config error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching email configuration',
            error: error.message
        });
    }
};

// @desc    Update email configuration
// @route   PUT /api/admin/settings/email
// @access  Private (Super Admin)
export const updateEmailConfig = async (req, res) => {
    try {
        const emailConfig = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({});
        }

        settings.email = { ...settings.email, ...emailConfig };
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Email configuration updated successfully'
        });
    } catch (error) {
        console.error('Update email config error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating email configuration',
            error: error.message
        });
    }
};

// @desc    Test email configuration
// @route   POST /api/admin/settings/email/test
// @access  Private (Super Admin)
export const testEmailConfig = async (req, res) => {
    try {
        const { testEmail } = req.body;
        const emailService = await import('../services/emailService.js');

        // Send test email
        await emailService.sendEmail({
            to: testEmail,
            subject: 'Test Email - WorkDesks',
            text: 'This is a test email from WorkDesks. If you received this, your email configuration is working correctly.',
            html: '<p>This is a test email from <strong>WorkDesks</strong>.</p><p>If you received this, your email configuration is working correctly.</p>'
        });

        res.status(200).json({
            success: true,
            message: 'Test email sent successfully'
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending test email',
            error: error.message
        });
    }
};
