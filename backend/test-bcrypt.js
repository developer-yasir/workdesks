import bcrypt from 'bcryptjs';

const testBcrypt = async () => {
    try {
        console.log('Testing bcrypt...');
        const password = 'test123';

        console.log('Generating salt...');
        const salt = await bcrypt.genSalt(10);
        console.log('✅ Salt generated:', salt);

        console.log('Hashing password...');
        const hash = await bcrypt.hash(password, salt);
        console.log('✅ Password hashed:', hash);

        console.log('Comparing password...');
        const isMatch = await bcrypt.compare(password, hash);
        console.log('✅ Password match:', isMatch);

        console.log('✅ Bcrypt works correctly!');
    } catch (error) {
        console.error('❌ Bcrypt error:', error.message);
        console.error('Stack:', error.stack);
    }
};

testBcrypt();
