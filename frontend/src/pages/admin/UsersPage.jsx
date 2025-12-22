import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [stats, setStats] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'agent',
        companyId: '',
        phone: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchCompanies();
        fetchStats();
    }, [searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);

            const response = await axios.get(
                `http://localhost:5000/api/admin/users?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
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

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/users/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/admin/users',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('User created successfully');
            setShowAddModal(false);
            resetForm();
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/admin/users/${selectedUser._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('User updated successfully');
            setShowEditModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/admin/users/${userId}/status`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('User status updated');
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/admin/users/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('User deleted successfully');
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            companyId: user.companyId?._id || '',
            phone: user.phone || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'agent',
            companyId: '',
            phone: ''
        });
        setSelectedUser(null);
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            super_admin: 'bg-purple-100 text-purple-800',
            company_admin: 'bg-blue-100 text-blue-800',
            company_manager: 'bg-green-100 text-green-800',
            agent: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
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
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">Manage system users and permissions</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <span>+</span>
                        Add User
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="card p-6">
                            <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                        <div className="card p-6">
                            <h3 className="text-sm text-gray-600 mb-2">Active Users</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                        </div>
                        <div className="card p-6">
                            <h3 className="text-sm text-gray-600 mb-2">Inactive Users</h3>
                            <p className="text-3xl font-bold text-red-600">{stats.inactiveUsers}</p>
                        </div>
                        <div className="card p-6">
                            <h3 className="text-sm text-gray-600 mb-2">Roles</h3>
                            <p className="text-3xl font-bold text-primary">{stats.usersByRole?.length || 0}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">All Roles</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="company_admin">Company Admin</option>
                                <option value="company_manager">Manager</option>
                                <option value="agent">Agent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.companyId?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(user._id)}
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h2>
                            <form onSubmit={handleAddUser}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
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
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role *
                                        </label>
                                        <select
                                            required
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="input"
                                        >
                                            <option value="agent">Agent</option>
                                            <option value="company_manager">Manager</option>
                                            <option value="company_admin">Company Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company *
                                        </label>
                                        <select
                                            required
                                            value={formData.companyId}
                                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                            className="input"
                                        >
                                            <option value="">Select Company</option>
                                            {companies.map((company) => (
                                                <option key={company._id} value={company._id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Create User
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

                {/* Edit User Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h2>
                            <form onSubmit={handleEditUser}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
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
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password (leave blank to keep current)
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role *
                                        </label>
                                        <select
                                            required
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="input"
                                        >
                                            <option value="agent">Agent</option>
                                            <option value="company_manager">Manager</option>
                                            <option value="company_admin">Company Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company *
                                        </label>
                                        <select
                                            required
                                            value={formData.companyId}
                                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                            className="input"
                                        >
                                            <option value="">Select Company</option>
                                            {companies.map((company) => (
                                                <option key={company._id} value={company._id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Update User
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
            </div>
        </DashboardLayout>
    );
};

export default UsersPage;
