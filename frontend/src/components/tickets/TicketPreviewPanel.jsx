import { useState } from 'react';
import { X, Clock, User, Tag, MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SLAIndicator from './SLAIndicator';

const TicketPreviewPanel = ({ ticket, onClose, onUpdate }) => {
    const [status, setStatus] = useState(ticket?.status || 'Open');
    const [priority, setPriority] = useState(ticket?.priority || 'Medium');
    const [note, setNote] = useState('');

    if (!ticket) return null;

    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus);
        if (onUpdate) {
            await onUpdate(ticket._id, { status: newStatus });
        }
    };

    const handlePriorityChange = async (newPriority) => {
        setPriority(newPriority);
        if (onUpdate) {
            await onUpdate(ticket._id, { priority: newPriority });
        }
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;
        if (onUpdate) {
            await onUpdate(ticket._id, { note: note.trim() });
            setNote('');
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
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {ticket.ticketNumber}
                        </h2>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(status)}`}>
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link
                            to={`/agent/tickets/${ticket._id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Open full ticket"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Subject */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {ticket.subject}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{ticket.requester}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* SLA Indicator */}
                    {ticket.resolutionDue && (
                        <SLAIndicator
                            dueDate={ticket.resolutionDue}
                            status={ticket.status}
                        />
                    )}

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                        <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Attachments */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                📎 Attachments ({ticket.attachments.length})
                            </h4>
                            <div className="space-y-2">
                                {ticket.attachments.map((attachment, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                                    >
                                        <span className="text-sm text-gray-700 truncate">
                                            {attachment.originalName || attachment.filename}
                                        </span>
                                        <a
                                            href={`http://localhost:5000/${attachment.path.replace(/\\/g, '/')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h4>

                        <div className="space-y-4">
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Priority
                                </label>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`} />
                                    <select
                                        value={priority}
                                        onChange={(e) => handlePriorityChange(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Add Note */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Add Quick Note
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Type a quick note..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    rows="3"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!note.trim()}
                                    className="mt-2 w-full px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {ticket.tags && ticket.tags.length > 0 && (
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {ticket.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                    >
                                        <Tag className="w-3 h-3 inline mr-1" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {ticket.replies && ticket.replies.length > 0 && (
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                <MessageSquare className="w-4 h-4 inline mr-1" />
                                Replies ({ticket.replies.length})
                            </h4>
                            <div className="space-y-3">
                                {ticket.replies.slice(0, 3).map((reply, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-900">
                                                {reply.userId?.name || 'Unknown'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(reply.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {reply.content.replace(/<[^>]*>/g, '')}
                                        </p>
                                    </div>
                                ))}
                                {ticket.replies.length > 3 && (
                                    <Link
                                        to={`/agent/tickets/${ticket._id}`}
                                        className="block text-sm text-primary hover:underline text-center"
                                    >
                                        View all {ticket.replies.length} replies
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default TicketPreviewPanel;
