import Team from '../models/Team.js';
import User from '../models/User.js';

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Admin only)
export const createTeam = async (req, res) => {
    try {
        const { name, description, managerId } = req.body;

        // Verify manager exists and has correct role
        const manager = await User.findById(managerId);
        if (!manager || manager.role !== 'company_manager') {
            return res.status(400).json({ message: 'Invalid manager ID or user is not a manager' });
        }

        const team = await Team.create({
            name,
            description,
            managerId,
            agents: []
        });

        // Update manager's teamId
        manager.teamId = team._id;
        await manager.save();

        res.status(201).json({
            success: true,
            team
        });
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ message: 'Error creating team', error: error.message });
    }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('managerId', 'name email')
            .populate('agents', 'name email');

        res.json({
            success: true,
            teams
        });
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
export const getTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('managerId', 'name email')
            .populate('agents', 'name email role');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json({
            success: true,
            team
        });
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ message: 'Error fetching team', error: error.message });
    }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin/Manager)
export const updateTeam = async (req, res) => {
    try {
        const { name, description, managerId } = req.body;

        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (name) team.name = name;
        if (description) team.description = description;
        if (managerId) {
            const manager = await User.findById(managerId);
            if (!manager || manager.role !== 'company_manager') {
                return res.status(400).json({ message: 'Invalid manager ID' });
            }
            team.managerId = managerId;
        }

        await team.save();

        const updatedTeam = await Team.findById(team._id)
            .populate('managerId', 'name email')
            .populate('agents', 'name email');

        res.json({
            success: true,
            team: updatedTeam
        });
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ message: 'Error updating team', error: error.message });
    }
};

// @desc    Add agent to team
// @route   POST /api/teams/:id/agents
// @access  Private (Admin/Manager)
export const addAgentToTeam = async (req, res) => {
    try {
        const { agentId } = req.body;

        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const agent = await User.findById(agentId);
        if (!agent || agent.role !== 'agent') {
            return res.status(400).json({ message: 'Invalid agent ID or user is not an agent' });
        }

        // Check if agent is already in team
        if (team.agents.includes(agentId)) {
            return res.status(400).json({ message: 'Agent is already in this team' });
        }

        team.agents.push(agentId);
        await team.save();

        // Update agent's teamId
        agent.teamId = team._id;
        await agent.save();

        const updatedTeam = await Team.findById(team._id)
            .populate('agents', 'name email');

        res.json({
            success: true,
            team: updatedTeam
        });
    } catch (error) {
        console.error('Add agent error:', error);
        res.status(500).json({ message: 'Error adding agent to team', error: error.message });
    }
};

// @desc    Remove agent from team
// @route   DELETE /api/teams/:id/agents/:agentId
// @access  Private (Admin/Manager)
export const removeAgentFromTeam = async (req, res) => {
    try {
        const { id, agentId } = req.params;

        const team = await Team.findById(id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        team.agents = team.agents.filter(agent => agent.toString() !== agentId);
        await team.save();

        // Update agent's teamId
        const agent = await User.findById(agentId);
        if (agent) {
            agent.teamId = null;
            await agent.save();
        }

        res.json({
            success: true,
            message: 'Agent removed from team successfully'
        });
    } catch (error) {
        console.error('Remove agent error:', error);
        res.status(500).json({ message: 'Error removing agent from team', error: error.message });
    }
};
