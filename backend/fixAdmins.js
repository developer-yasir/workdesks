import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdminCompany() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find Default Company
        const company = await mongoose.connection.db.collection('companies').findOne({ name: 'Default Company' });

        if (!company) {
            console.log('❌ Default Company not found!');
            await mongoose.disconnect();
            return;
        }

        console.log(`📍 Default Company ID: ${company._id}\n`);

        // Update all admin users to have Default Company
        const result = await mongoose.connection.db.collection('users').updateMany(
            {
                role: { $in: ['super_admin', 'company_admin', 'manager', 'agent'] }
            },
            {
                $set: { companyId: company._id }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} user(s)`);
        console.log(`   - Set companyId to: ${company._id}\n`);

        // Verify the update
        const updatedUsers = await mongoose.connection.db.collection('users')
            .find({ companyId: company._id })
            .toArray();

        console.log(`👥 Users now with Default Company: ${updatedUsers.length}`);
        updatedUsers.forEach((user, i) => {
            console.log(`   ${i + 1}. ${user.name} (${user.role}) - ${user.email}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Done! All users updated.');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixAdminCompany();
