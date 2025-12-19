import DashboardLayout from '../../components/layout/DashboardLayout';

const CompanyAdminDashboard = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Company Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Total Tickets</h3>
                        <p className="text-3xl font-bold text-gray-900">156</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">All Teams</h3>
                        <p className="text-3xl font-bold text-primary">5</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-purple">24</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Open Tickets</h3>
                        <p className="text-3xl font-bold text-orange-600">42</p>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Overview</h2>
                    <p className="text-gray-600">Company admin dashboard features coming soon...</p>
                    <p className="text-sm text-gray-500 mt-2">
                        As a Company Admin, you have access to all tickets, can manage all teams, create users, and view comprehensive reports.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyAdminDashboard;
