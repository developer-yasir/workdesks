import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminDashboard = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-gray-900">12</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Teams</h3>
                        <p className="text-3xl font-bold text-primary">3</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Total Tickets</h3>
                        <p className="text-3xl font-bold text-purple">156</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Active Agents</h3>
                        <p className="text-3xl font-bold text-green-600">8</p>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
                    <p className="text-gray-600">Admin dashboard features coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
