import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AgentDashboard from './pages/agent/AgentDashboard';
import TicketDetailPage from './pages/agent/TicketDetailPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CompanyAdminDashboard from './pages/company-admin/CompanyAdminDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import CompanyManagement from './pages/admin/CompanyManagement';
import UsersPage from './pages/admin/UsersPage';
import AdminTickets from './pages/admin/AdminTickets';
import TeamsPage from './pages/admin/TeamsPage';
import SettingsPage from './pages/admin/SettingsPage';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerCreateTicket from './pages/customer/CustomerCreateTicket';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Customer Protected Route
const CustomerProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('customerToken');

    if (!token) {
        return <Navigate to="/customer/login" replace />;
    }

    return children;
};

// Dashboard Redirect based on role
const DashboardRedirect = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'super_admin':
            return <Navigate to="/admin/dashboard" replace />;
        case 'company_admin':
            return <Navigate to="/company-admin/dashboard" replace />;
        case 'company_manager':
            return <Navigate to="/manager/dashboard" replace />;
        case 'agent':
            return <Navigate to="/agent/dashboard" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Customer Public Routes */}
                    <Route path="/customer/register" element={<CustomerRegister />} />
                    <Route path="/customer/login" element={<CustomerLogin />} />

                    {/* Customer Protected Routes */}
                    <Route
                        path="/customer/dashboard"
                        element={
                            <CustomerProtectedRoute>
                                <CustomerDashboard />
                            </CustomerProtectedRoute>
                        }
                    />
                    <Route
                        path="/customer/tickets/new"
                        element={
                            <CustomerProtectedRoute>
                                <CustomerCreateTicket />
                            </CustomerProtectedRoute>
                        }
                    />

                    {/* Dashboard Redirect */}
                    <Route path="/" element={<DashboardRedirect />} />
                    <Route path="/dashboard" element={<DashboardRedirect />} />

                    {/* Agent Routes */}
                    <Route
                        path="/agent/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['agent']}>
                                <AgentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agent/tickets/:id"
                        element={
                            <ProtectedRoute allowedRoles={['agent']}>
                                <TicketDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Manager Routes */}
                    <Route
                        path="/manager/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['company_manager']}>
                                <ManagerDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/tickets"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin', 'company_admin', 'company_manager']}>
                                <AdminTickets />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <UsersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin', 'company_admin', 'company_manager']}>
                                <AnalyticsDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/companies"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <CompanyManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/teams"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <TeamsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/settings"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <SettingsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Unauthorized */}
                    <Route
                        path="/unauthorized"
                        element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
                                    <p className="text-gray-600">You don't have permission to access this page.</p>
                                </div>
                            </div>
                        }
                    />

                    {/* 404 */}
                    <Route
                        path="*"
                        element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                                    <p className="text-gray-600">Page not found.</p>
                                </div>
                            </div>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
