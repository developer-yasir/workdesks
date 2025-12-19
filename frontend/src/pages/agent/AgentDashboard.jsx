import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateTicketModal from '../../components/tickets/CreateTicketModal';
import TicketFilters from '../../components/tickets/TicketFilters';
import api from '../../utils/api';

const AgentDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        type: '',
        search: ''
    });

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.type) params.type = filters.type;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/tickets', { params });
            setTickets(response.data.tickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleTicketCreated = (newTicket) => {
        setTickets([newTicket, ...tickets]);
    };

    const getStatusBadge = (status) => {
        const badges = {
            Open: 'badge badge-open',
            Pending: 'badge badge-pending',
            Resolved: 'badge badge-resolved',
            Closed: 'badge badge-closed'
        };
        return badges[status] || 'badge';
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            Low: 'badge badge-low',
            Medium: 'badge badge-medium',
            High: 'badge badge-high',
            Urgent: 'badge badge-urgent'
        };
        return badges[priority] || 'badge';
    };

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        pending: tickets.filter(t => t.status === 'Pending').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
                        <p className="text-gray-600 mt-1">Manage and respond to your assigned tickets</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <span className="text-xl">+</span>
                        <span>Create Ticket</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Tickets</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🎫</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Open</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.open}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📬</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⏳</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Resolved</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <TicketFilters onFilterChange={handleFilterChange} />

                {/* Tickets Table */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600">No tickets found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ticket
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    to={`/agent/tickets/${ticket._id}`}
                                                    className="text-primary font-medium hover:underline"
                                                >
                                                    {ticket.ticketNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                                                <div className="text-sm text-gray-500">{ticket.requester}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(ticket.status)}>{ticket.status}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getPriorityBadge(ticket.priority)}>{ticket.priority}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(ticket.updatedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create Ticket Modal */}
                <CreateTicketModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onTicketCreated={handleTicketCreated}
                />
            </div>
        </DashboardLayout>
    );
};

export default AgentDashboard;
