import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateTicketModal from '../../components/tickets/CreateTicketModal';
import TicketFiltersPanel from '../../components/tickets/TicketFiltersPanel';
import BulkActionBar from '../../components/tickets/BulkActionBar';
import api from '../../utils/api';

const AgentDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('card');
    const [filters, setFilters] = useState({
        search: '',
        resolvedAt: '',
        resolutionDueBy: '',
        firstResponseDueBy: '',
        status: '',
        priorities: '',
        types: '',
        sources: '',
        tags: '',
        companies: '',
        contacts: '',
        company: '',
        country: '',
        category: ''
    });

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchTickets();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [filters]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.priorities) params.priority = filters.priorities;
            if (filters.types) params.type = filters.types;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/tickets', { params });
            setTickets(response.data.tickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleTicketCreated = (newTicket) => {
        setTickets([newTicket, ...tickets]);
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

    const getStatusColor = (status) => {
        const colors = {
            Open: 'text-blue-600',
            Pending: 'text-yellow-600',
            Resolved: 'text-green-600',
            Closed: 'text-gray-600'
        };
        return colors[status] || 'text-gray-600';
    };

    const getInitials = (email) => {
        return email.charAt(0).toUpperCase();
    };

    const getAvatarColor = (index) => {
        const colors = ['bg-orange-200', 'bg-purple-200', 'bg-blue-200', 'bg-pink-200', 'bg-green-200'];
        return colors[index % colors.length];
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            resolvedAt: '',
            resolutionDueBy: '',
            firstResponseDueBy: '',
            status: '',
            priorities: '',
            types: '',
            sources: '',
            tags: '',
            companies: '',
            contacts: '',
            company: '',
            country: '',
            category: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <DashboardLayout>
            <div className="flex h-full bg-gray-50">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <div className="bg-white border-b border-gray-200 px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-lg font-semibold text-gray-900">New tickets</h1>
                                <span className="text-gray-500">›</span>
                                <span className="text-gray-600">{tickets.length}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                                    Get started
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-blue-700 flex items-center space-x-1"
                                >
                                    <span>📋</span>
                                    <span>New</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="bg-white border-b border-gray-200 px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Sort by:</span>
                                    <select className="text-sm border-0 focus:ring-0 text-gray-700 font-medium">
                                        <option>Date Created</option>
                                        <option>Last Updated</option>
                                        <option>Priority</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Layout:</span>
                                    <div className="flex border border-gray-300 rounded">
                                        <button
                                            onClick={() => setViewMode('card')}
                                            className={`px-3 py-1 text-sm ${viewMode === 'card' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                                        >
                                            Card view
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`px-3 py-1 text-sm border-l border-gray-300 ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                                        >
                                            Table
                                        </button>
                                    </div>
                                </div>
                                <button className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                                    ⬆ Export
                                </button>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span>1-{tickets.length} of {tickets.length}</span>
                                    <button className="p-1 hover:bg-gray-100 rounded">‹</button>
                                    <button className="p-1 hover:bg-gray-100 rounded">›</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="flex-1 overflow-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No tickets found</p>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="text-primary hover:underline mt-2">
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tickets.map((ticket, index) => (
                                    <Link
                                        key={ticket._id}
                                        to={`/agent/tickets/${ticket._id}`}
                                        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(index)} flex-shrink-0`}>
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {getInitials(ticket.requester)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></span>
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                {ticket.subject}
                                                            </h3>
                                                            <span className="text-xs text-gray-500">#{ticket.ticketNumber}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                                                            <div className="flex items-center space-x-1">
                                                                <span>💬</span>
                                                                <span>{ticket.requester}</span>
                                                            </div>
                                                            <span>·</span>
                                                            <span>Created: {getRelativeTime(ticket.createdAt)}</span>
                                                            <span>·</span>
                                                            <span>First response due in: 2 days</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <button className={`text-xs font-medium flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                                                            <span>▲</span>
                                                            <span>{ticket.status}</span>
                                                            <span>▼</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <span>👤</span>
                                                        <span>Social Support.../{ticket.assignedTo?.name || 'Unassigned'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Filters */}
                <TicketFiltersPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApply={(newFilters) => setFilters(newFilters)}
                    onClear={clearFilters}
                />
            </div>

            {/* Create Ticket Modal */}
            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTicketCreated={handleTicketCreated}
            />
        </DashboardLayout>
    );
};

export default AgentDashboard;
