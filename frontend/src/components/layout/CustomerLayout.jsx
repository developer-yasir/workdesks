import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Ticket } from 'lucide-react';

const CustomerLayout = ({ children }) => {
    const navigate = useNavigate();
    const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        navigate('/customer/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/customer/dashboard" className="flex items-center space-x-2">
                            <Ticket className="w-8 h-8 text-primary" />
                            <span className="text-xl font-bold text-gray-900">WorkDesks</span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link
                                to="/customer/dashboard"
                                className="text-gray-700 hover:text-primary font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/customer/tickets"
                                className="text-gray-700 hover:text-primary font-medium transition-colors"
                            >
                                My Tickets
                            </Link>
                            <Link
                                to="/customer/tickets/new"
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                New Ticket
                            </Link>
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/customer/profile"
                                className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span className="hidden sm:inline font-medium">{customerData.name}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-600 text-sm">
                        © 2025 WorkDesks. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default CustomerLayout;
