import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkTicketDetails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all tickets with details
        const tickets = await mongoose.connection.db.collection('tickets')
            .find()
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        console.log('🎫 All Tickets Details:\n');
        tickets.forEach((ticket, i) => {
            console.log(`${i + 1}. ${ticket.ticketNumber}`);
            console.log(`   Subject: ${ticket.subject}`);
            console.log(`   Source: ${ticket.source}`);
            console.log(`   Company ID: ${ticket.companyId}`);
            console.log(`   Customer ID: ${ticket.customerId}`);
            console.log(`   Assigned To: ${ticket.assignedTo || 'Unassigned'}`);
            console.log(`   Created: ${ticket.createdAt}`);
            console.log('');
        });

        // Check companies
        const companies = await mongoose.connection.db.collection('companies').find().toArray();
        console.log('\n🏢 Companies:');
        companies.forEach(company => {
            console.log(`- ${company.name} (ID: ${company._id})`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTicketDetails();
