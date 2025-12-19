import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a team name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please assign a manager to the team']
    },
    agents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
