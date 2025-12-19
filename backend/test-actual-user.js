import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const testActualUserModel = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Connected!');

        console.log('Clearing existing users...');
        await User.deleteMany({});
        console.log('✅ Users cleared');

        console.log('Creating user with actual User model...');
        const user = await User.create({
            name: 'Test Admin',
            email: 'testadmin@workdesks.com',
            password: 'admin123',
            role: 'super_admin'
        });

        console.log('✅ User created successfully!');
        console.log('User ID:', user._id);
        console.log('User name:', user.name);
        console.log('User email:', user.email);
        console.log('User role:', user.role);

        await User.deleteMany({});
        await mongoose.connection.close();

        console.log('\n✅ SUCCESS! User model works correctly!');
        console.log('The seeder should work now. Try running: npm run seed');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ FAILED!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
        console.error('\nFull error:');
        console.error(error);
        process.exit(1);
    }
};

testActualUserModel();
