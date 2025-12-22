import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Role-based menu items
    const getMenuItems = () => {
        switch (user?.role) {
            case 'super_admin':
                return [
                    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
                    { path: '/admin/tickets', label: 'All Tickets', icon: '🎫' },
                    { path: '/admin/companies', label: 'Companies', icon: '🏢' },
                    { path: '/admin/users', label: 'Users', icon: '👥' },
                    { path: '/admin/teams', label: 'Teams', icon: '👥' },
                    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
                    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
                ];
            case 'company_manager':
                return [
                    { path: '/manager/dashboard', label: 'Dashboard', icon: '📊' },
                    { path: '/manager/tickets', label: 'Team Tickets', icon: '🎫' },
                    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
                    { path: '/manager/reports', label: 'Reports', icon: '📋' },
                    { path: '/manager/team', label: 'Team Settings', icon: '👥' }
                ];
            case 'agent':
                return [
                    { path: '/agent/dashboard', label: 'My Tickets', icon: '🎫' },
                    { path: '/agent/canned', label: 'Canned Responses', icon: '💬' }
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-primary">WorkDesks</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {user?.role === 'super_admin' && 'Super Admin'}
                    {user?.role === 'company_manager' && 'Manager'}
                    {user?.role === 'agent' && 'Agent'}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                    ? 'bg-primary text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple rounded-full flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
