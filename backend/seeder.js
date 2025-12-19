import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Team from './models/Team.js';
import Ticket from './models/Ticket.js';
import CannedResponse from './models/CannedResponse.js';
import connectDB from './config/db.js';

dotenv.config();

// Sample data
const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Team.deleteMany();
        await Ticket.deleteMany();
        await CannedResponse.deleteMany();

        console.log('📦 Database cleared');

        // Create users
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@workdesks.com',
            password: 'admin123',
            role: 'super_admin'
        });

        const manager = await User.create({
            name: 'Team Manager',
            email: 'manager@workdesks.com',
            password: 'manager123',
            role: 'company_manager'
        });

        const agent1 = await User.create({
            name: 'Agent One',
            email: 'agent1@workdesks.com',
            password: 'agent123',
            role: 'agent'
        });

        const agent2 = await User.create({
            name: 'Agent Two',
            email: 'agent2@workdesks.com',
            password: 'agent123',
            role: 'agent'
        });

        console.log('✅ Users created');

        // Create team
        const team = await Team.create({
            name: 'Support Team',
            description: 'Main customer support team',
            managerId: manager._id,
            agents: [agent1._id, agent2._id]
        });

        // Update users with team
        manager.teamId = team._id;
        await manager.save();

        agent1.teamId = team._id;
        await agent1.save();

        agent2.teamId = team._id;
        await agent2.save();

        console.log('✅ Team created');

        // Create sample tickets
        const ticket1 = await Ticket.create({
            requester: 'customer@example.com',
            subject: 'Cannot login to account',
            description: 'I am unable to login to my account. Getting error message.',
            type: 'Incident',
            priority: 'High',
            status: 'Open',
            teamId: team._id,
            assignedTo: agent1._id
        });

        const ticket2 = await Ticket.create({
            requester: 'user@example.com',
            subject: 'Feature request: Dark mode',
            description: 'Would love to have a dark mode option in the application.',
            type: 'Feature Request',
            priority: 'Low',
            status: 'Open',
            teamId: team._id
        });

        const ticket3 = await Ticket.create({
            requester: 'support@example.com',
            subject: 'Billing inquiry',
            description: 'Question about my recent invoice.',
            type: 'Question',
            priority: 'Medium',
            status: 'Pending',
            teamId: team._id,
            assignedTo: agent2._id
        });

        console.log('✅ Sample tickets created');

        // Create canned responses
        await CannedResponse.create({
            title: 'Welcome Greeting',
            content: 'Thank you for contacting WorkDesks support. We\'re here to help!',
            category: 'Greeting',
            isGlobal: true,
            createdBy: admin._id
        });

        await CannedResponse.create({
            title: 'Closing - Resolved',
            content: 'Your issue has been resolved. If you have any other questions, feel free to reach out!',
            category: 'Closing',
            isGlobal: true,
            createdBy: admin._id
        });

        await CannedResponse.create({
            title: 'Technical - Password Reset',
            content: 'To reset your password, please click on "Forgot Password" on the login page and follow the instructions.',
            category: 'Technical',
            isGlobal: true,
            createdBy: admin._id
        });

        console.log('✅ Canned responses created');

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('Login credentials:');
        console.log('Super Admin: admin@workdesks.com / admin123');
        console.log('Manager: manager@workdesks.com / manager123');
        console.log('Agent: agent1@workdesks.com / agent123\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
