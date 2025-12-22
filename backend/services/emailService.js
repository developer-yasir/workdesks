import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
    constructor() {
        // Create transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready');
        } catch (error) {
            console.error('❌ Email service error:', error.message);
        }
    }

    /**
     * Load and compile email template
     */
    loadTemplate(templateName) {
        try {
            const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
            const templateContent = fs.readFileSync(templatePath, 'utf-8');
            return handlebars.compile(templateContent);
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Send email
     */
    async send({ to, subject, html, attachments = [] }) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'WorkDesks Support <noreply@workdesks.com>',
                to,
                subject,
                html,
                attachments
            });

            console.log('✅ Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send ticket created notification to customer
     */
    async sendTicketCreated(ticket, customerEmail, customerName) {
        try {
            const template = this.loadTemplate('ticket-created');
            const html = template({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                description: ticket.description,
                priority: ticket.priority,
                status: ticket.status,
                customerName: customerName,
                ticketUrl: `${process.env.APP_URL || 'http://localhost:5173'}/customer/tickets/${ticket._id}`,
                companyName: 'WorkDesks'
            });

            return await this.send({
                to: customerEmail,
                subject: `Ticket Created: ${ticket.ticketNumber} - ${ticket.subject}`,
                html
            });
        } catch (error) {
            console.error('Error sending ticket created email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send ticket assigned notification to agent
     */
    async sendTicketAssigned(ticket, agentEmail, agentName) {
        try {
            const template = this.loadTemplate('ticket-assigned');
            const html = template({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                priority: ticket.priority,
                agentName: agentName,
                ticketUrl: `${process.env.APP_URL || 'http://localhost:5173'}/agent/tickets/${ticket._id}`,
                companyName: 'WorkDesks'
            });

            return await this.send({
                to: agentEmail,
                subject: `Ticket Assigned: ${ticket.ticketNumber}`,
                html
            });
        } catch (error) {
            console.error('Error sending ticket assigned email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send new reply notification
     */
    async sendTicketReply(ticket, replyContent, recipientEmail, recipientName, isCustomer = true) {
        try {
            const template = this.loadTemplate('ticket-reply');
            const html = template({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                replyContent: replyContent,
                recipientName: recipientName,
                ticketUrl: isCustomer
                    ? `${process.env.APP_URL || 'http://localhost:5173'}/customer/tickets/${ticket._id}`
                    : `${process.env.APP_URL || 'http://localhost:5173'}/agent/tickets/${ticket._id}`,
                companyName: 'WorkDesks'
            });

            return await this.send({
                to: recipientEmail,
                subject: `New Reply: ${ticket.ticketNumber}`,
                html
            });
        } catch (error) {
            console.error('Error sending reply email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send status changed notification
     */
    async sendStatusChanged(ticket, oldStatus, newStatus, customerEmail, customerName) {
        try {
            const template = this.loadTemplate('ticket-status-changed');
            const html = template({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                oldStatus: oldStatus,
                newStatus: newStatus,
                customerName: customerName,
                ticketUrl: `${process.env.APP_URL || 'http://localhost:5173'}/customer/tickets/${ticket._id}`,
                companyName: 'WorkDesks'
            });

            return await this.send({
                to: customerEmail,
                subject: `Ticket Status Updated: ${ticket.ticketNumber}`,
                html
            });
        } catch (error) {
            console.error('Error sending status changed email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send ticket resolved notification
     */
    async sendTicketResolved(ticket, customerEmail, customerName) {
        try {
            const template = this.loadTemplate('ticket-resolved');
            const html = template({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                customerName: customerName,
                ticketUrl: `${process.env.APP_URL || 'http://localhost:5173'}/customer/tickets/${ticket._id}`,
                companyName: 'WorkDesks'
            });

            return await this.send({
                to: customerEmail,
                subject: `Ticket Resolved: ${ticket.ticketNumber}`,
                html
            });
        } catch (error) {
            console.error('Error sending resolved email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send ticket closed notification
     */
    async sendTicketClosed(ticket, customerEmail, customerName) {
        try {
            const template = this.loadTemplate('ticket-closed');
            const html = template({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                customerName: customerName,
                companyName: 'WorkDesks'
            });

            return await this.send({
                to: customerEmail,
                subject: `Ticket Closed: ${ticket.ticketNumber}`,
                html
            });
        } catch (error) {
            console.error('Error sending closed email:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new EmailService();
