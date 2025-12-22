import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { inspect } from 'util';
import Ticket from '../models/Ticket.js';
import Customer from '../models/Customer.js';
import Company from '../models/Company.js';
import emailService from './emailService.js';

class EmailReceiver {
    constructor() {
        this.isConnected = false;
        this.imap = null;
    }

    /**
     * Initialize IMAP connection
     */
    initializeImap() {
        if (!process.env.IMAP_USER || !process.env.IMAP_PASS) {
            console.log('⚠️  IMAP credentials not configured. Email receiving disabled.');
            return null;
        }

        return new Imap({
            user: process.env.IMAP_USER || process.env.EMAIL_USER,
            password: process.env.IMAP_PASS || process.env.EMAIL_PASS,
            host: process.env.IMAP_HOST || 'imap.gmail.com',
            port: parseInt(process.env.IMAP_PORT) || 993,
            tls: process.env.IMAP_TLS !== 'false',
            tlsOptions: { rejectUnauthorized: false }
        });
    }

    /**
     * Start email receiver service
     */
    start() {
        this.imap = this.initializeImap();

        if (!this.imap) {
            return;
        }

        console.log('📧 Starting email receiver service...');

        // Check emails every minute
        const interval = parseInt(process.env.IMAP_POLL_INTERVAL) || 60000;

        // Initial check
        this.checkEmails();

        // Set up polling
        setInterval(() => {
            this.checkEmails();
        }, interval);

        console.log(`✅ Email receiver polling every ${interval / 1000} seconds`);
    }

    /**
     * Check for new emails
     */
    async checkEmails() {
        if (!this.imap) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.imap.once('ready', () => {
                this.imap.openBox('INBOX', false, (err, box) => {
                    if (err) {
                        console.error('Error opening inbox:', err);
                        this.imap.end();
                        return reject(err);
                    }

                    // Search for unseen emails
                    this.imap.search(['UNSEEN'], (err, results) => {
                        if (err) {
                            console.error('Error searching emails:', err);
                            this.imap.end();
                            return reject(err);
                        }

                        if (!results || results.length === 0) {
                            this.imap.end();
                            return resolve();
                        }

                        console.log(`📬 Found ${results.length} new email(s)`);

                        const fetch = this.imap.fetch(results, { bodies: '' });

                        fetch.on('message', (msg, seqno) => {
                            msg.on('body', (stream, info) => {
                                simpleParser(stream, async (err, parsed) => {
                                    if (err) {
                                        console.error('Error parsing email:', err);
                                        return;
                                    }

                                    try {
                                        await this.processEmail(parsed, seqno);
                                    } catch (error) {
                                        console.error('Error processing email:', error);
                                    }
                                });
                            });

                            msg.once('attributes', (attrs) => {
                                // Mark as seen
                                this.imap.addFlags(seqno, ['\\Seen'], (err) => {
                                    if (err) console.error('Error marking as seen:', err);
                                });
                            });
                        });

                        fetch.once('error', (err) => {
                            console.error('Fetch error:', err);
                        });

                        fetch.once('end', () => {
                            this.imap.end();
                            resolve();
                        });
                    });
                });
            });

            this.imap.once('error', (err) => {
                console.error('IMAP error:', err);
                reject(err);
            });

            this.imap.once('end', () => {
                // Connection ended
            });

            this.imap.connect();
        });
    }

    /**
     * Process incoming email and create ticket
     */
    async processEmail(email, seqno) {
        try {
            console.log(`\n📨 Processing email #${seqno}`);
            console.log(`From: ${email.from.text}`);
            console.log(`Subject: ${email.subject}`);

            // Extract sender email and name
            const senderEmail = email.from.value[0].address;
            const senderName = email.from.value[0].name || senderEmail.split('@')[0];

            // Check if this is a reply to existing ticket
            const ticketNumber = this.extractTicketNumber(email.subject);

            if (ticketNumber) {
                await this.addReplyToTicket(ticketNumber, email, senderEmail);
            } else {
                await this.createTicketFromEmail(email, senderEmail, senderName);
            }

        } catch (error) {
            console.error('Error in processEmail:', error);
        }
    }

    /**
     * Extract ticket number from subject (e.g., [#TKT-123])
     */
    extractTicketNumber(subject) {
        const match = subject.match(/\[#(TKT-\d+)\]/);
        return match ? match[1] : null;
    }

    /**
     * Create new ticket from email
     */
    async createTicketFromEmail(email, senderEmail, senderName) {
        try {
            // Find or create customer
            let customer = await Customer.findOne({ email: senderEmail });

            if (!customer) {
                console.log(`Creating new customer: ${senderEmail}`);

                // Generate a random password for email-created customers
                const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-12);

                customer = await Customer.create({
                    name: senderName,
                    email: senderEmail,
                    password: randomPassword, // Random password - customer can reset via portal
                    isVerified: true
                });
            }

            // Get or create default company
            let company = await Company.findOne({ name: 'Default Company' });
            if (!company) {
                company = await Company.create({
                    name: 'Default Company',
                    slug: 'default-company',
                    subscription: { plan: 'basic' }
                });
            }

            // Extract email body (prefer text, fallback to HTML)
            let description = email.text || email.html || 'No content';

            // Clean up description (remove signatures, quoted text)
            description = this.cleanEmailBody(description);

            // Handle attachments
            const attachments = [];
            if (email.attachments && email.attachments.length > 0) {
                // TODO: Save attachments to disk
                console.log(`Email has ${email.attachments.length} attachment(s)`);
            }

            // Create ticket
            const ticket = await Ticket.create({
                requester: senderEmail,
                subject: email.subject || 'No Subject',
                description: description,
                type: 'Question',
                priority: 'Medium',
                customerId: customer._id,
                companyId: company._id,
                source: 'Email',
                attachments: attachments
            });

            console.log(`✅ Created ticket: ${ticket.ticketNumber}`);

            // Send confirmation email
            await emailService.sendTicketCreated(
                ticket,
                senderEmail,
                senderName
            );

            console.log(`✅ Sent confirmation email to ${senderEmail}`);

        } catch (error) {
            console.error('Error creating ticket from email:', error);
        }
    }

    /**
     * Add reply to existing ticket
     */
    async addReplyToTicket(ticketNumber, email, senderEmail) {
        try {
            const ticket = await Ticket.findOne({ ticketNumber });

            if (!ticket) {
                console.log(`Ticket ${ticketNumber} not found, creating new ticket instead`);
                const senderName = email.from.value[0].name || senderEmail.split('@')[0];
                await this.createTicketFromEmail(email, senderEmail, senderName);
                return;
            }

            // Extract reply content
            let replyContent = email.text || email.html || 'No content';
            replyContent = this.cleanEmailBody(replyContent);

            // Find customer
            const customer = await Customer.findOne({ email: senderEmail });

            // Add reply
            ticket.replies.push({
                userId: customer ? customer._id : null,
                content: replyContent,
                isCustomerReply: true,
                createdAt: new Date()
            });

            // Reopen if closed
            if (ticket.status === 'Closed') {
                ticket.status = 'Open';
            }

            await ticket.save();

            console.log(`✅ Added reply to ticket: ${ticketNumber}`);

            // Notify agent if assigned
            if (ticket.assignedTo) {
                // TODO: Notify agent
            }

        } catch (error) {
            console.error('Error adding reply to ticket:', error);
        }
    }

    /**
     * Clean email body (remove signatures, quoted text)
     */
    cleanEmailBody(text) {
        // Remove common email signatures
        text = text.split(/--\s*$/m)[0];
        text = text.split(/^On .* wrote:$/m)[0];
        text = text.split(/^From:.*$/m)[0];

        // Trim whitespace
        text = text.trim();

        // Limit length
        if (text.length > 5000) {
            text = text.substring(0, 5000) + '...';
        }

        return text;
    }
}

export default new EmailReceiver();
