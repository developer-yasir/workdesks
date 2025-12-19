import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const simpleSeed = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Define User schema inline
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String,
            role: { type: String, default: 'agent' },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        // Add password hashing
        userSchema.pre('save', async function (next) {
            if (!this.isModified('password')) return next();
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        });

        const User = mongoose.model('User', userSchema);

        console.log('Clearing users...');
        await User.deleteMany({});

        console.log('Creating admin...');
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@workdesks.com',
            password: 'admin123',
            role: 'super_admin'
        });
        console.log('✅ Admin created:', admin.email);

        console.log('Creating company admin...');
        const companyAdmin = await User.create({
            name: 'Company Admin',
            email: 'companyadmin@workdesks.com',
            password: 'admin123',
            role: 'company_admin'
        });
        console.log('✅ Company Admin created:', companyAdmin.email);

        console.log('Creating manager...');
        const manager = await User.create({
            name: 'Team Manager',
            email: 'manager@workdesks.com',
            password: 'manager123',
            role: 'company_manager'
        });
        console.log('✅ Manager created:', manager.email);

        console.log('Creating agent...');
        const agent = await User.create({
            name: 'Agent One',
            email: 'agent1@workdesks.com',
            password: 'agent123',
            role: 'agent'
        });
        console.log('✅ Agent created:', agent.email);

        await mongoose.connection.close();

        console.log('\n🎉 SUCCESS! All users created!');
        console.log('\nYou can now login with:');
        console.log('Super Admin: admin@workdesks.com / admin123');
        console.log('Company Admin: companyadmin@workdesks.com / admin123');
        console.log('Manager: manager@workdesks.com / manager123');
        console.log('Agent: agent1@workdesks.com / agent123');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

simpleSeed();
