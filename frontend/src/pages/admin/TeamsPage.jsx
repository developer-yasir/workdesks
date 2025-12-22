import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [companies, setCompanies] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: '',
        companyId: ''
    });

    useEffect(() => {
        fetchTeams();
        fetchUsers();
        fetchCompanies();
    }, []);

    const fetchTeams = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/teams', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeams(response.data.teams || []);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error('Failed to fetch teams');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/companies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(response.data.companies || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleAddTeam = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/teams',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Team created successfully');
            setShowAddModal(false);
            resetForm();
            fetchTeams();
        } catch (error) {
            console.error('Error creating team:', error);
            toast.error(error.response?.data?.message || 'Failed to create team');
        }
    };

    const handleEditTeam = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/teams/${selectedTeam._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Team updated successfully');
            setShowEditModal(false);
            resetForm();
            fetchTeams();
        } catch (error) {
            console.error('Error updating team:', error);
            toast.error(error.response?.data?.message || 'Failed to update team');
        }
    };

    const handleAddMember = async (agentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/teams/${selectedTeam._id}/agents`,
                { agentId },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Member added successfully');
            fetchTeams();
        } catch (error) {
            console.error('Error adding member:', error);
            toast.error(error.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (agentId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/teams/${selectedTeam._id}/agents/${agentId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Member removed successfully');
            fetchTeams();
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Failed to remove member');
        }
    };

    const openEditModal = (team) => {
        setSelectedTeam(team);
        setFormData({
            name: team.name,
            description: team.description || '',
            managerId: team.managerId?._id || '',
            companyId: team.companyId?._id || ''
        });
        setShowEditModal(true);
    };

    const openMembersModal = (team) => {
        setSelectedTeam(team);
        setShowMembersModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            managerId: '',
            companyId: ''
        });
        setSelectedTeam(null);
    };

    const getAvailableAgents = () => {
        if (!selectedTeam) return [];
        const teamMemberIds = selectedTeam.agents?.map(a => a._id) || [];
        return users.filter(u => u.role === 'agent' && !teamMemberIds.includes(u._id));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                        <p className="text-gray-600 mt-1">Manage teams and team members</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <span>+</span>
                        Create Team
                    </button>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div key={team._id} className="card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{team.description || 'No description'}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${team.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {team.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Manager</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {team.managerId?.name || 'No manager assigned'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Team Members</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {team.agents?.length || 0} agents
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openMembersModal(team)}
                                    className="btn btn-secondary flex-1 text-sm"
                                >
                                    Manage Members
                                </button>
                                <button
                                    onClick={() => openEditModal(team)}
                                    className="btn btn-primary flex-1 text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {teams.length === 0 && (
                    <div className="card p-12 text-center">
                        <p className="text-gray-500">No teams found. Create your first team to get started.</p>
                    </div>
                )}

                {/* Add Team Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Team</h2>
                            <form onSubmit={handleAddTeam}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Team Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input"
                                            rows="3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Team Manager *
                                        </label>
                                        <select
                                            required
                                            value={formData.managerId}
                                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                            className="input"
                                        >
                                            <option value="">Select Manager</option>
                                            {users.filter(u => u.role === 'company_manager').map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Create Team
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Team Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Team</h2>
                            <form onSubmit={handleEditTeam}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Team Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input"
                                            rows="3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Team Manager *
                                        </label>
                                        <select
                                            required
                                            value={formData.managerId}
                                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                            className="input"
                                        >
                                            <option value="">Select Manager</option>
                                            {users.filter(u => u.role === 'company_manager').map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Update Team
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            resetForm();
                                        }}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Members Management Modal */}
                {showMembersModal && selectedTeam && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Manage Team Members - {selectedTeam.name}
                            </h2>

                            {/* Current Members */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Members</h3>
                                {selectedTeam.agents && selectedTeam.agents.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedTeam.agents.map((agent) => (
                                            <div key={agent._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{agent.name}</p>
                                                    <p className="text-sm text-gray-500">{agent.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMember(agent._id)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No members in this team yet.</p>
                                )}
                            </div>

                            {/* Available Agents */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Agents</h3>
                                {getAvailableAgents().length > 0 ? (
                                    <div className="space-y-2">
                                        {getAvailableAgents().map((agent) => (
                                            <div key={agent._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{agent.name}</p>
                                                    <p className="text-sm text-gray-500">{agent.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAddMember(agent._id)}
                                                    className="text-primary hover:text-primary-dark text-sm font-medium"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No available agents to add.</p>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setShowMembersModal(false);
                                    setSelectedTeam(null);
                                }}
                                className="btn btn-secondary w-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeamsPage;
