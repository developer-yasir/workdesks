import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const testUserCreation = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected!');

        // Define a simple user schema with password hashing
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String,
            role: String
        });

        // Add pre-save hook
        userSchema.pre('save', async function (next) {
            if (!this.isModified('password')) return next();
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        });

        const TestUser = mongoose.model('TestUser', userSchema);

        // Clear any existing test users
        await TestUser.deleteMany({});

        console.log('Creating user...');
        const user = await TestUser.create({
            name: 'Test Admin',
            email: 'testadmin@test.com',
            password: 'test123',
            role: 'super_admin'
        });

        console.log('✅ User created successfully!', user);

        await TestUser.deleteMany({});
        await mongoose.connection.close();

        console.log('✅ Test passed! User model works correctly.');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

testUserCreation();
