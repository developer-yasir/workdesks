import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import customerAuthRoutes from './routes/customerAuth.js';
import customerTicketRoutes from './routes/customerTickets.js';
import ticketRoutes from './routes/tickets.js';
import userRoutes from './routes/users.js';
import teamRoutes from './routes/teams.js';
import analyticsRoutes from './routes/analytics.js';
import companyRoutes from './routes/companies.js';
import adminUserRoutes from './routes/adminUsers.js';
import settingsRoutes from './routes/settings.js';

// Import services
import emailReceiver from './services/emailReceiver.js';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Start email receiver service (polls for incoming emails)
emailReceiver.start();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/customer', customerAuthRoutes);
app.use('/api/customer/tickets', customerTicketRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'WorkDesks API - Role-Based Ticketing System',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tickets: '/api/tickets',
            users: '/api/users',
            teams: '/api/teams',
            analytics: '/api/analytics',
            companies: '/api/companies'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
