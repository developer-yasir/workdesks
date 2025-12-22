import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminCompany() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all users with admin roles
        const admins = await mongoose.connection.db.collection('users')
            .find({ role: { $in: ['super_admin', 'company_admin', 'manager'] } })
            .toArray();

        console.log('👥 Admin Users:');
        admins.forEach(admin => {
            console.log(`- ${admin.name} (${admin.role})`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  Company ID: ${admin.companyId}`);
            console.log('');
        });

        // Find all companies
        const companies = await mongoose.connection.db.collection('companies').find().toArray();
        console.log('\n🏢 Companies:');
        companies.forEach(company => {
            console.log(`- ${company.name}`);
            console.log(`  ID: ${company._id}`);
            console.log('');
        });

        // Find all tickets
        const tickets = await mongoose.connection.db.collection('tickets').find().toArray();
        console.log(`\n🎫 Total Tickets: ${tickets.length}`);
        console.log('Ticket Company IDs:');
        const uniqueCompanyIds = [...new Set(tickets.map(t => t.companyId?.toString()))];
        uniqueCompanyIds.forEach(id => {
            const count = tickets.filter(t => t.companyId?.toString() === id).length;
            console.log(`  ${id}: ${count} tickets`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkAdminCompany();
