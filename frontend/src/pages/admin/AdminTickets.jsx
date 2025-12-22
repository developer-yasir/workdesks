import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: ''
    });

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(
                `http://localhost:5000/api/tickets?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setTickets(response.data.tickets || []);
        } catch (error) {
            console.error('Fetch tickets error:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Open': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Resolved': 'bg-green-100 text-green-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-gray-100 text-gray-800',
            'Medium': 'bg-blue-100 text-blue-800',
            'High': 'bg-orange-100 text-orange-800',
            'Urgent': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Loading tickets...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">All Tickets</h1>
                <p className="text-gray-600 mt-2">Manage and view all support tickets</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No tickets found</p>
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
                                        Source
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tickets.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {ticket.ticketNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{ticket.subject}</div>
                                            <div className="text-sm text-gray-500">{ticket.requester}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{ticket.source || 'Portal'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                to={`/agent/tickets/${ticket._id}`}
                                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="mt-4 text-sm text-gray-600">
                Showing {tickets.length} ticket(s)
            </div>
        </div>
    );
};

export default AdminTickets;
