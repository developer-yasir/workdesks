import DashboardLayout from '../../components/layout/DashboardLayout';

const ManagerDashboard = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Manager Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Team Tickets</h3>
                        <p className="text-3xl font-bold text-gray-900">24</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Unassigned</h3>
                        <p className="text-3xl font-bold text-orange-600">5</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm text-gray-600 mb-2">Avg Response Time</h3>
                        <p className="text-3xl font-bold text-green-600">2.5h</p>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Performance</h2>
                    <p className="text-gray-600">Manager dashboard features coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerDashboard;
