import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Direct MongoDB insertion without Mongoose models
const directSeed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected!');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Clear existing users
        console.log('Clearing users...');
        await usersCollection.deleteMany({});

        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const hashedManagerPassword = await bcrypt.hash('manager123', salt);
        const hashedAgentPassword = await bcrypt.hash('agent123', salt);

        // Insert users directly
        console.log('Inserting users...');
        const result = await usersCollection.insertMany([
            {
                name: 'Super Admin',
                email: 'admin@workdesks.com',
                password: hashedPassword,
                role: 'super_admin',
                isActive: true,
                permissions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Company Admin',
                email: 'companyadmin@workdesks.com',
                password: hashedPassword,
                role: 'company_admin',
                isActive: true,
                permissions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Team Manager',
                email: 'manager@workdesks.com',
                password: hashedManagerPassword,
                role: 'company_manager',
                isActive: true,
                permissions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Agent One',
                email: 'agent1@workdesks.com',
                password: hashedAgentPassword,
                role: 'agent',
                isActive: true,
                permissions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        console.log(`✅ Inserted ${result.insertedCount} users!`);

        await mongoose.connection.close();

        console.log('\n🎉 SUCCESS! Users created directly in MongoDB!');
        console.log('\nLogin credentials:');
        console.log('Super Admin: admin@workdesks.com / admin123');
        console.log('Company Admin: companyadmin@workdesks.com / admin123');
        console.log('Manager: manager@workdesks.com / manager123');
        console.log('Agent: agent1@workdesks.com / agent123');
        console.log('\nYou can now login to the application!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

directSeed();
