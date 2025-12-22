import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateTicketModal from '../../components/tickets/CreateTicketModal';
import TicketFiltersPanel from '../../components/tickets/TicketFiltersPanel';
import BulkActionBar from '../../components/tickets/BulkActionBar';
import SLAIndicator from '../../components/tickets/SLAIndicator';
import ActiveFilters from '../../components/tickets/ActiveFilters';
import FilterPresets from '../../components/tickets/FilterPresets';
import SavedFilterViews from '../../components/tickets/SavedFilterViews';
import TicketPreviewPanel from '../../components/tickets/TicketPreviewPanel';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('card');
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [activePreset, setActivePreset] = useState(null);
    const [savedViews, setSavedViews] = useState([]);
    const [previewTicket, setPreviewTicket] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        resolvedAt: '',
        resolutionDueBy: '',
        firstResponseDueBy: '',
        status: [],
        priorities: [],
        types: [],
        sources: [],
        tags: '',
        companies: [],
        contacts: [],
        company: [],
        country: [],
        category: ''
    });

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    // Load saved views from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ticketFilterViews');
        if (saved) {
            try {
                setSavedViews(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading saved views:', error);
            }
        }
    }, []);

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

            // Handle array filters
            if (filters.status && filters.status.length > 0) {
                params.status = filters.status.join(',');
            }
            if (filters.priorities && filters.priorities.length > 0) {
                params.priority = filters.priorities.join(',');
            }
            if (filters.types && filters.types.length > 0) {
                params.type = filters.types.join(',');
            }
            if (filters.sources && filters.sources.length > 0) {
                params.source = filters.sources.join(',');
            }
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
        setActivePreset(null); // Clear active preset when manually changing filters
    };

    const handleApplyPreset = (preset) => {
        // Clear all filters first
        const clearedFilters = {
            search: '',
            resolvedAt: '',
            resolutionDueBy: '',
            firstResponseDueBy: '',
            status: [],
            priorities: [],
            types: [],
            sources: [],
            tags: '',
            companies: [],
            contacts: [],
            company: [],
            country: [],
            category: ''
        };

        // Apply preset filters
        const newFilters = { ...clearedFilters, ...preset.filters };
        setFilters(newFilters);
        setActivePreset(preset.id);
    };

    const handleSaveView = (view) => {
        const updatedViews = [...savedViews, view];
        setSavedViews(updatedViews);
        localStorage.setItem('ticketFilterViews', JSON.stringify(updatedViews));
    };

    const handleApplyView = (view) => {
        setFilters(view.filters);
        setActivePreset(null); // Clear preset when applying saved view
    };

    const handleDeleteView = (viewId) => {
        const updatedViews = savedViews.filter(v => v.id !== viewId);
        setSavedViews(updatedViews);
        localStorage.setItem('ticketFilterViews', JSON.stringify(updatedViews));
    };

    const handleTicketClick = (ticket, event) => {
        // Don't open preview if clicking checkbox or link
        if (event.target.type === 'checkbox' || event.target.closest('a')) {
            return;
        }
        setPreviewTicket(ticket);
    };

    const handlePreviewUpdate = async (ticketId, updates) => {
        try {
            await api.put(`/tickets/${ticketId}`, updates);
            toast.success('Ticket updated successfully');
            fetchTickets();
            // Update preview ticket if it's still open
            if (previewTicket && previewTicket._id === ticketId) {
                const response = await api.get(`/tickets/${ticketId}`);
                setPreviewTicket(response.data.ticket);
            }
        } catch (error) {
            toast.error('Failed to update ticket');
        }
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
            status: [],
            priorities: [],
            types: [],
            sources: [],
            tags: '',
            companies: [],
            contacts: [],
            company: [],
            country: [],
            category: ''
        });
    };

    const handleRemoveFilter = (filterType, value) => {
        setFilters(prev => {
            if (Array.isArray(prev[filterType])) {
                return {
                    ...prev,
                    [filterType]: prev[filterType].filter(item => item !== value)
                };
            } else {
                return {
                    ...prev,
                    [filterType]: ''
                };
            }
        });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Bulk action handlers
    const handleTicketSelect = (ticketId) => {
        setSelectedTickets(prev =>
            prev.includes(ticketId)
                ? prev.filter(id => id !== ticketId)
                : [...prev, ticketId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTickets.length === tickets.length) {
            setSelectedTickets([]);
        } else {
            setSelectedTickets(tickets.map(t => t._id));
        }
    };

    const handleBulkAssign = async (assignType) => {
        try {
            const response = await api.post('/tickets/bulk-assign', {
                ticketIds: selectedTickets,
                assignType
            });
            toast.success(response.data.message);
            setSelectedTickets([]);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign tickets');
        }
    };

    const handleBulkStatusChange = async (status) => {
        try {
            const response = await api.post('/tickets/bulk-status', {
                ticketIds: selectedTickets,
                status
            });
            toast.success(response.data.message);
            setSelectedTickets([]);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleBulkPriorityChange = async (priority) => {
        try {
            const response = await api.post('/tickets/bulk-priority', {
                ticketIds: selectedTickets,
                priority
            });
            toast.success(response.data.message);
            setSelectedTickets([]);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update priority');
        }
    };

    const handleBulkAddTags = async (tags) => {
        try {
            await api.post('/tickets/bulk-tags', {
                ticketIds: selectedTickets,
                tags,
                action: 'add'
            });
            toast.success(`Tags added to ${selectedTickets.length} ticket(s)`);
            setSelectedTickets([]);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add tags');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedTickets.length} ticket(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.post('/tickets/bulk-delete', {
                ticketIds: selectedTickets
            });
            toast.success(`${selectedTickets.length} ticket(s) deleted`);
            setSelectedTickets([]);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete tickets');
        }
    };

    const handleBulkArchive = async () => {
        if (!window.confirm(`Archive ${selectedTickets.length} ticket(s)?`)) {
            return;
        }

        try {
            await api.post('/tickets/bulk-archive', {
                ticketIds: selectedTickets
            });
            toast.success(`${selectedTickets.length} ticket(s) archived`);
            setSelectedTickets([]);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to archive tickets');
        }
    };

    const handleClearSelection = () => {
        setSelectedTickets([]);
    };

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

                    {/* Filter Presets */}
                    <FilterPresets
                        onApplyPreset={handleApplyPreset}
                        activePreset={activePreset}
                    />

                    {/* Saved Filter Views */}
                    <SavedFilterViews
                        currentFilters={filters}
                        onApplyView={handleApplyView}
                        savedViews={savedViews}
                        onSaveView={handleSaveView}
                        onDeleteView={handleDeleteView}
                    />

                    {/* Active Filters */}
                    <ActiveFilters
                        filters={filters}
                        onRemoveFilter={handleRemoveFilter}
                        onClearAll={clearFilters}
                    />

                    {/* Controls Bar */}
                    <div className="bg-white border-b border-gray-200 px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="checkbox"
                                    checked={selectedTickets.length === tickets.length && tickets.length > 0}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                />
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
                                    <div
                                        key={ticket._id}
                                        onClick={(e) => handleTicketClick(ticket, e)}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedTickets.includes(ticket._id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleTicketSelect(ticket._id);
                                                }}
                                                className="w-4 h-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                            />

                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(index)} flex-shrink-0`}>
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {getInitials(ticket.requester)}
                                                </span>
                                            </div>

                                            {/* Ticket Content - Clickable */}
                                            <Link
                                                to={`/agent/tickets/${ticket._id}`}
                                                className="flex-1 min-w-0"
                                            >
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
                                                            {ticket.resolutionDue && (
                                                                <>
                                                                    <span>·</span>
                                                                    <SLAIndicator dueDate={ticket.resolutionDue} label="Resolution" />
                                                                </>
                                                            )}
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
                                            </Link>
                                        </div>
                                    </div>
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

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedTickets.length}
                onAssign={handleBulkAssign}
                onChangeStatus={handleBulkStatusChange}
                onChangePriority={handleBulkPriorityChange}
                onAddTags={handleBulkAddTags}
                onDelete={handleBulkDelete}
                onArchive={handleBulkArchive}
                onClear={handleClearSelection}
            />

            {/* Create Ticket Modal */}
            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTicketCreated={handleTicketCreated}
            />

            {/* Ticket Preview Panel */}
            {previewTicket && (
                <TicketPreviewPanel
                    ticket={previewTicket}
                    onClose={() => setPreviewTicket(null)}
                    onUpdate={handlePreviewUpdate}
                />
            )}
        </DashboardLayout>
    );
};

export default AgentDashboard;
