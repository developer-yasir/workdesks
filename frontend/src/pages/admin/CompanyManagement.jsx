import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        primaryColor: '#3B82F6',
        subscription: {
            plan: 'basic',
            limits: {
                maxUsers: 10,
                maxTicketsPerMonth: 1000,
                maxTeams: 5
            }
        }
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await api.get('/companies');
            setCompanies(response.data.companies);
        } catch (error) {
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCompany) {
                await api.put(`/companies/${editingCompany._id}`, formData);
                toast.success('Company updated successfully');
            } else {
                await api.post('/companies', formData);
                toast.success('Company created successfully');
            }
            setIsModalOpen(false);
            setEditingCompany(null);
            resetForm();
            fetchCompanies();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (company) => {
        setEditingCompany(company);
        setFormData({
            name: company.name,
            domain: company.domain || '',
            primaryColor: company.primaryColor,
            subscription: company.subscription
        });
        setIsModalOpen(true);
    };

    const handleDeactivate = async (companyId) => {
        if (!confirm('Are you sure you want to deactivate this company?')) return;

        try {
            await api.delete(`/companies/${companyId}`);
            toast.success('Company deactivated');
            fetchCompanies();
        } catch (error) {
            toast.error('Failed to deactivate company');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            domain: '',
            primaryColor: '#3B82F6',
            subscription: {
                plan: 'basic',
                limits: {
                    maxUsers: 10,
                    maxTicketsPerMonth: 1000,
                    maxTeams: 5
                }
            }
        });
    };

    const getPlanBadge = (plan) => {
        const badges = {
            free: 'bg-gray-100 text-gray-800',
            basic: 'bg-blue-100 text-blue-800',
            professional: 'bg-purple-100 text-purple-800',
            enterprise: 'bg-green-100 text-green-800'
        };
        return badges[plan] || badges.basic;
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
                        <p className="text-gray-600 mt-1">Manage all companies in the system</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingCompany(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Add Company
                    </button>
                </div>

                {/* Companies Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company) => (
                            <div key={company._id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                                            style={{ backgroundColor: company.primaryColor }}
                                        >
                                            {company.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{company.name}</h3>
                                            <p className="text-sm text-gray-500">{company.domain || 'No domain'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadge(company.subscription.plan)}`}>
                                        {company.subscription.plan}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Users:</span>
                                        <span className="font-medium">{company.stats?.users || 0} / {company.subscription.limits.maxUsers}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Tickets:</span>
                                        <span className="font-medium">{company.stats?.tickets || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`font-medium ${company.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                            {company.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(company)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeactivate(company._id)}
                                        className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 text-sm font-medium"
                                    >
                                        Deactivate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {editingCompany ? 'Edit Company' : 'Add New Company'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Domain
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                        placeholder="example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Primary Color
                                    </label>
                                    <input
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subscription Plan
                                    </label>
                                    <select
                                        value={formData.subscription.plan}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            subscription: { ...formData.subscription, plan: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="free">Free</option>
                                        <option value="basic">Basic</option>
                                        <option value="professional">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        {editingCompany ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingCompany(null);
                                            resetForm();
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
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

export default CompanyManagement;
