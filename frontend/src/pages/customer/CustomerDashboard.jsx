import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        open: 0,
        pending: 0,
        resolved: 0,
        total: 0
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('customerToken');
            const response = await axios.get('http://localhost:5000/api/customer/tickets', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const ticketsData = response.data.tickets;
            setTickets(ticketsData);

            // Calculate stats
            const stats = {
                open: ticketsData.filter(t => t.status === 'Open').length,
                pending: ticketsData.filter(t => t.status === 'Pending').length,
                resolved: ticketsData.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
                total: ticketsData.length
            };
            setStats(stats);
        } catch (error) {
            console.error('Fetch tickets error:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            Open: 'bg-blue-100 text-blue-700',
            Pending: 'bg-yellow-100 text-yellow-700',
            Resolved: 'bg-green-100 text-green-700',
            Closed: 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            Low: 'bg-green-500',
            Medium: 'bg-yellow-500',
            High: 'bg-orange-500',
            Urgent: 'bg-red-500'
        };
        return colors[priority] || 'bg-gray-400';
    };

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome back! 👋
                    </h1>
                    <p className="text-gray-600">
                        Here's an overview of your support tickets
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Open Tickets</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.open}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/customer/tickets/new"
                            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create New Ticket</span>
                        </Link>
                        <Link
                            to="/customer/tickets?status=Open"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            View Open Tickets
                        </Link>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
                            <Link to="/customer/tickets" className="text-primary hover:underline text-sm">
                                View All
                            </Link>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-12">
                                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">No tickets yet</p>
                                <Link
                                    to="/customer/tickets/new"
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Create Your First Ticket</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tickets.slice(0, 5).map((ticket) => (
                                    <Link
                                        key={ticket._id}
                                        to={`/customer/tickets/${ticket._id}`}
                                        className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-sm font-medium text-gray-500">
                                                        {ticket.ticketNumber}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                                                </div>
                                                <h3 className="font-medium text-gray-900 mb-1">
                                                    {ticket.subject}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Created {new Date(ticket.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default CustomerDashboard;
