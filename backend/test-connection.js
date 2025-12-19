import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const simpleTest = async () => {
    try {
        console.log('Attempting to connect to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB!');

        // Create a simple test collection
        const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));

        const doc = await TestModel.create({ name: 'test' });
        console.log('✅ Document created:', doc);

        await TestModel.deleteOne({ _id: doc._id });
        console.log('✅ Document deleted');

        await mongoose.connection.close();
        console.log('✅ Connection closed');

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

simpleTest();
