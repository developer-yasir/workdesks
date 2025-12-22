import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);

    const [generalSettings, setGeneralSettings] = useState({
        companyName: 'WorkDesks',
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'MM/DD/YYYY'
    });

    const [emailSettings, setEmailSettings] = useState({
        smtpHost: '',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: '',
        smtpPass: '',
        emailFrom: '',
        imapHost: '',
        imapPort: 993,
        imapTls: true,
        imapUser: '',
        imapPass: '',
        imapPollInterval: 60000
    });

    const [ticketSettings, setTicketSettings] = useState({
        defaultPriority: 'medium',
        autoAssignment: false,
        allowCustomerReply: true,
        requireApproval: false
    });

    const [securitySettings, setSecuritySettings] = useState({
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecialChars: false,
        sessionTimeout: 3600000,
        twoFactorEnabled: false
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailOnTicketCreated: true,
        emailOnTicketAssigned: true,
        emailOnTicketReply: true,
        emailOnTicketStatusChange: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.data;
            setSettings(data);

            if (data.general) setGeneralSettings(data.general);
            if (data.email) setEmailSettings(data.email);
            if (data.tickets) setTicketSettings(data.tickets);
            if (data.security) setSecuritySettings(data.security);
            if (data.notifications) setNotificationSettings(data.notifications);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = {
                general: generalSettings,
                email: emailSettings,
                tickets: ticketSettings,
                security: securitySettings,
                notifications: notificationSettings
            };

            await axios.put(
                'http://localhost:5000/api/admin/settings',
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Settings saved successfully');
            fetchSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        }
    };

    const handleTestEmail = async () => {
        const testEmail = prompt('Enter email address to send test email:');
        if (!testEmail) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/admin/settings/email/test',
                { testEmail },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Test email sent successfully');
        } catch (error) {
            console.error('Error sending test email:', error);
            toast.error('Failed to send test email');
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'email', label: 'Email', icon: '📧' },
        { id: 'tickets', label: 'Tickets', icon: '🎫' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' }
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
                </div>

                {/* Tabs */}
                <div className="card mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={generalSettings.companyName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                                        className="input max-w-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timezone
                                    </label>
                                    <select
                                        value={generalSettings.timezone}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                                        className="input max-w-md"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time</option>
                                        <option value="America/Chicago">Central Time</option>
                                        <option value="America/Denver">Mountain Time</option>
                                        <option value="America/Los_Angeles">Pacific Time</option>
                                        <option value="Asia/Karachi">Pakistan Time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Language
                                    </label>
                                    <select
                                        value={generalSettings.language}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                                        className="input max-w-md"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date Format
                                    </label>
                                    <select
                                        value={generalSettings.dateFormat}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                                        className="input max-w-md"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Email Settings */}
                        {activeTab === 'email' && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-800">
                                        Configure SMTP settings for outgoing emails and IMAP settings for incoming emails (email-to-ticket feature).
                                    </p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900">SMTP Configuration (Outgoing)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Host
                                        </label>
                                        <input
                                            type="text"
                                            value={emailSettings.smtpHost}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                                            className="input"
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Port
                                        </label>
                                        <input
                                            type="number"
                                            value={emailSettings.smtpPort}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP User
                                        </label>
                                        <input
                                            type="text"
                                            value={emailSettings.smtpUser}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Password
                                        </label>
                                        <input
                                            type="password"
                                            value={emailSettings.smtpPass}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpPass: e.target.value })}
                                            className="input"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            From Email
                                        </label>
                                        <input
                                            type="email"
                                            value={emailSettings.emailFrom}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, emailFrom: e.target.value })}
                                            className="input"
                                            placeholder="support@company.com"
                                        />
                                    </div>
                                </div>

                                <hr className="my-6" />

                                <h3 className="text-lg font-semibold text-gray-900">IMAP Configuration (Incoming)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            IMAP Host
                                        </label>
                                        <input
                                            type="text"
                                            value={emailSettings.imapHost}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, imapHost: e.target.value })}
                                            className="input"
                                            placeholder="imap.gmail.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            IMAP Port
                                        </label>
                                        <input
                                            type="number"
                                            value={emailSettings.imapPort}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, imapPort: parseInt(e.target.value) })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            IMAP User
                                        </label>
                                        <input
                                            type="text"
                                            value={emailSettings.imapUser}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, imapUser: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            IMAP Password
                                        </label>
                                        <input
                                            type="password"
                                            value={emailSettings.imapPass}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, imapPass: e.target.value })}
                                            className="input"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Poll Interval (ms)
                                        </label>
                                        <input
                                            type="number"
                                            value={emailSettings.imapPollInterval}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, imapPollInterval: parseInt(e.target.value) })}
                                            className="input"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleTestEmail}
                                        className="btn btn-secondary"
                                    >
                                        Send Test Email
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Ticket Settings */}
                        {activeTab === 'tickets' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Default Priority
                                    </label>
                                    <select
                                        value={ticketSettings.defaultPriority}
                                        onChange={(e) => setTicketSettings({ ...ticketSettings, defaultPriority: e.target.value })}
                                        className="input max-w-md"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="autoAssignment"
                                        checked={ticketSettings.autoAssignment}
                                        onChange={(e) => setTicketSettings({ ...ticketSettings, autoAssignment: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="autoAssignment" className="ml-2 block text-sm text-gray-900">
                                        Enable Auto-Assignment
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="allowCustomerReply"
                                        checked={ticketSettings.allowCustomerReply}
                                        onChange={(e) => setTicketSettings({ ...ticketSettings, allowCustomerReply: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="allowCustomerReply" className="ml-2 block text-sm text-gray-900">
                                        Allow Customer Reply
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="requireApproval"
                                        checked={ticketSettings.requireApproval}
                                        onChange={(e) => setTicketSettings({ ...ticketSettings, requireApproval: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-900">
                                        Require Approval for Ticket Resolution
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Password Length
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.passwordMinLength}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                                        className="input max-w-md"
                                        min="6"
                                        max="20"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="passwordRequireUppercase"
                                        checked={securitySettings.passwordRequireUppercase}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireUppercase: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="passwordRequireUppercase" className="ml-2 block text-sm text-gray-900">
                                        Require Uppercase Letters
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="passwordRequireNumbers"
                                        checked={securitySettings.passwordRequireNumbers}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireNumbers: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="passwordRequireNumbers" className="ml-2 block text-sm text-gray-900">
                                        Require Numbers
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="passwordRequireSpecialChars"
                                        checked={securitySettings.passwordRequireSpecialChars}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireSpecialChars: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="passwordRequireSpecialChars" className="ml-2 block text-sm text-gray-900">
                                        Require Special Characters
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Timeout (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.sessionTimeout / 60000}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) * 60000 })}
                                        className="input max-w-md"
                                        min="15"
                                        max="1440"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="twoFactorEnabled"
                                        checked={securitySettings.twoFactorEnabled}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="twoFactorEnabled" className="ml-2 block text-sm text-gray-900">
                                        Enable Two-Factor Authentication
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="emailOnTicketCreated"
                                        checked={notificationSettings.emailOnTicketCreated}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailOnTicketCreated: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="emailOnTicketCreated" className="ml-2 block text-sm text-gray-900">
                                        Send Email on Ticket Created
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="emailOnTicketAssigned"
                                        checked={notificationSettings.emailOnTicketAssigned}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailOnTicketAssigned: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="emailOnTicketAssigned" className="ml-2 block text-sm text-gray-900">
                                        Send Email on Ticket Assigned
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="emailOnTicketReply"
                                        checked={notificationSettings.emailOnTicketReply}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailOnTicketReply: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="emailOnTicketReply" className="ml-2 block text-sm text-gray-900">
                                        Send Email on Ticket Reply
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="emailOnTicketStatusChange"
                                        checked={notificationSettings.emailOnTicketStatusChange}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailOnTicketStatusChange: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="emailOnTicketStatusChange" className="ml-2 block text-sm text-gray-900">
                                        Send Email on Ticket Status Change
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-6 border-t border-gray-200 mt-8">
                            <button
                                onClick={handleSaveSettings}
                                className="btn btn-primary"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
