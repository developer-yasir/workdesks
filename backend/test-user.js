import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const test = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected!');

        console.log('Creating test user...');
        const user = await User.create({
            name: 'Test User',
            email: 'test@test.com',
            password: 'test123',
            role: 'agent'
        });
        console.log('User created:', user);

        await User.deleteOne({ _id: user._id });
        console.log('Test user deleted');

        process.exit(0);
    } catch (error) {
        console.error('FULL ERROR:', error);
        console.error('ERROR MESSAGE:', error.message);
        console.error('ERROR STACK:', error.stack);
        process.exit(1);
    }
};

test();
