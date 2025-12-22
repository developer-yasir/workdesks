import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixTickets() {
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

        console.log(`📍 Found Default Company: ${company._id}\n`);

        // Update all tickets with undefined or null companyId
        const result = await mongoose.connection.db.collection('tickets').updateMany(
            {
                $or: [
                    { companyId: { $exists: false } },
                    { companyId: null },
                    { companyId: undefined }
                ]
            },
            {
                $set: {
                    companyId: company._id,
                    source: 'Email' // Also fix the source field
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} ticket(s)`);
        console.log(`   - Set companyId to: ${company._id}`);
        console.log(`   - Set source to: Email\n`);

        // Verify the update
        const updatedTickets = await mongoose.connection.db.collection('tickets')
            .find({ companyId: company._id })
            .toArray();

        console.log(`📊 Tickets now with Default Company: ${updatedTickets.length}`);
        updatedTickets.forEach((ticket, i) => {
            console.log(`   ${i + 1}. ${ticket.ticketNumber} - ${ticket.subject}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Done! All tickets updated.');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixTickets();
