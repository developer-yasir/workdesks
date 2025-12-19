import DashboardLayout from '../../components/layout/DashboardLayout';

const UsersPage = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <button className="btn btn-primary">+ Add User</button>
                </div>

                <div className="card p-6">
                    <p className="text-gray-600">User management interface coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UsersPage;
