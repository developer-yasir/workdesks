import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

const TicketDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [isPrivateNote, setIsPrivateNote] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editedProperties, setEditedProperties] = useState({});

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const response = await api.get(`/tickets/${id}`);
            setTicket(response.data.ticket);
            setEditedProperties({
                status: response.data.ticket.status,
                priority: response.data.ticket.priority,
                type: response.data.ticket.type
            });
        } catch (error) {
            console.error('Error fetching ticket:', error);
            toast.error('Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/tickets/${id}/reply`, {
                content: replyContent,
                isPrivateNote
            });
            toast.success(isPrivateNote ? 'Private note added' : 'Reply sent successfully');
            setReplyContent('');
            setIsPrivateNote(false);
            fetchTicket();
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateProperties = async () => {
        try {
            await api.put(`/tickets/${id}`, editedProperties);
            toast.success('Ticket updated successfully');
            fetchTicket();
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast.error('Failed to update ticket');
        }
    };

    const handleClose = async () => {
        try {
            await api.put(`/tickets/${id}`, { status: 'Closed' });
            toast.success('Ticket closed');
            navigate('/agent/dashboard');
        } catch (error) {
            toast.error('Failed to close ticket');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!ticket) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-gray-600">Ticket not found</p>
                </div>
            </DashboardLayout>
        );
    }

    const isOverdue = new Date(ticket.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000);

    return (
        <DashboardLayout>
            <div className="flex h-full bg-gray-50">
                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    {/* Breadcrumb */}
                    <div className="bg-white border-b px-6 py-3">
                        <button
                            onClick={() => navigate('/agent/dashboard')}
                            className="text-sm text-primary hover:underline"
                        >
                            All unresolved tickets
                        </button>
                        <span className="text-gray-500 mx-2">›</span>
                        <span className="text-sm text-gray-700">{ticket.ticketNumber}</span>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white border-b px-6 py-3 flex items-center space-x-2">
                        <button
                            onClick={() => setIsPrivateNote(false)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1"
                        >
                            <span>↩</span>
                            <span>Reply</span>
                        </button>
                        <button
                            onClick={() => setIsPrivateNote(true)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1"
                        >
                            <span>📝</span>
                            <span>Add note</span>
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
                            <span>➡</span>
                            <span>Forward</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1"
                        >
                            <span>✓</span>
                            <span>Close</span>
                        </button>
                        <div className="flex-1"></div>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                            <span>⋮</span>
                        </button>
                    </div>

                    {/* Ticket Content */}
                    <div className="p-6">
                        {/* Status Badge */}
                        {isOverdue && (
                            <div className="mb-4">
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded">
                                    Overdue
                                </span>
                            </div>
                        )}

                        {/* Ticket Subject */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{ticket.subject}</h1>

                        {/* Original Message */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                            <div className="flex items-start space-x-4 mb-4">
                                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-gray-700">
                                        {ticket.requester.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {ticket.requester.split('@')[0]} - Sharaf DG
                                            </p>
                                            <p className="text-sm text-gray-500">reported via email</p>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(ticket.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Email Headers */}
                                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                                        <div>
                                            <span className="font-medium">To:</span> Support_innovent
                                        </div>
                                        <div>
                                            <span className="font-medium">Cc:</span> {ticket.requester}
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    <div className="prose max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: ticket.description }} />
                                    </div>

                                    {/* Attachments */}
                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                📎 Attachments ({ticket.attachments.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {ticket.attachments.map((attachment, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                            <div className="flex-shrink-0">
                                                                {attachment.mimetype?.startsWith('image/') ? (
                                                                    <span className="text-2xl">🖼️</span>
                                                                ) : attachment.mimetype?.includes('pdf') ? (
                                                                    <span className="text-2xl">📄</span>
                                                                ) : (
                                                                    <span className="text-2xl">📎</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {attachment.originalName || attachment.filename}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={`http://localhost:5000/${attachment.path.replace(/\\/g, '/')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary-dark border border-primary rounded hover:bg-blue-50 transition-colors"
                                                        >
                                                            Download
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        {ticket.replies && ticket.replies.map((reply, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-lg border p-6 mb-4 ${reply.isPrivateNote ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200'
                                    }`}
                            >
                                {reply.isPrivateNote && (
                                    <div className="mb-2 text-sm font-medium text-yellow-800">🔒 Private Note</div>
                                )}
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold">
                                            {reply.userId?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{reply.userId?.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(reply.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="prose max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: reply.content }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Reply Form */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {isPrivateNote ? 'Add Private Note' : 'Reply to Ticket'}
                            </h3>
                            <form onSubmit={handleReply}>
                                <ReactQuill
                                    value={replyContent}
                                    onChange={setReplyContent}
                                    placeholder={isPrivateNote ? "Add a private note..." : "Type your reply here..."}
                                    className="bg-white mb-4"
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['link'],
                                            ['clean']
                                        ]
                                    }}
                                />
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={isPrivateNote}
                                            onChange={(e) => setIsPrivateNote(e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-gray-700">Private Note (internal only)</span>
                                    </label>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Sending...' : (isPrivateNote ? 'Add Note' : 'Send Reply')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
                    <div className="p-6">
                        {/* Status Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{editedProperties.status}</h3>
                                <button className="text-sm text-primary hover:underline">Edit</button>
                            </div>
                            <div className="text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <span className="text-red-600">●</span>
                                    <span className="font-medium">RESOLUTION DUE</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    by {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Properties */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">PROPERTIES</h4>

                            {/* Tags */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Tags</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                                    placeholder="Add tags..."
                                />
                            </div>

                            {/* Type */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    value={editedProperties.type}
                                    onChange={(e) => setEditedProperties({ ...editedProperties, type: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Question">Question</option>
                                    <option value="Incident">Incident</option>
                                    <option value="Problem">Problem</option>
                                    <option value="Feature Request">Feature Request</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Status *</label>
                                <select
                                    value={editedProperties.status}
                                    onChange={(e) => setEditedProperties({ ...editedProperties, status: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={editedProperties.priority}
                                    onChange={(e) => setEditedProperties({ ...editedProperties, priority: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            {/* Group */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Group</label>
                                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary">
                                    <option>Customer Support</option>
                                    <option>Technical Support</option>
                                    <option>Sales</option>
                                </select>
                            </div>

                            {/* Agent */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Agent</label>
                                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary">
                                    <option>{ticket.assignedTo?.name || 'Unassigned'}</option>
                                </select>
                            </div>
                        </div>

                        {/* Update Button */}
                        <button
                            onClick={handleUpdateProperties}
                            className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded transition-colors"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TicketDetailPage;
