import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const response = await api.get(`/tickets/${id}`);
            setTicket(response.data.ticket);
        } catch (error) {
            console.error('Error fetching ticket:', error);
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
            setReplyContent('');
            setIsPrivateNote(false);
            fetchTicket(); // Refresh ticket data
        } catch (error) {
            console.error('Error adding reply:', error);
            alert('Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            await api.put(`/tickets/${id}`, { status: newStatus });
            fetchTicket();
        } catch (error) {
            console.error('Error updating status:', error);
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

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary hover:underline mb-4 flex items-center"
                    >
                        ← Back to tickets
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
                            <p className="text-gray-600 mt-1">{ticket.subject}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => updateStatus('Resolved')}
                                className="btn btn-primary"
                                disabled={ticket.status === 'Resolved'}
                            >
                                Mark as Resolved
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Original Message */}
                        <div className="card p-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold">{ticket.requester.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{ticket.requester}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(ticket.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700">{ticket.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        {ticket.replies && ticket.replies.map((reply, index) => (
                            <div
                                key={index}
                                className={`card p-6 ${reply.isPrivateNote ? 'bg-yellow-50 border-yellow-200' : ''}`}
                            >
                                {reply.isPrivateNote && (
                                    <div className="mb-2 text-sm font-medium text-yellow-800">🔒 Private Note</div>
                                )}
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-purple rounded-full flex items-center justify-center text-white">
                                        <span className="text-sm font-bold">
                                            {reply.userId?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{reply.userId?.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(reply.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="prose max-w-none">
                                            <p className="text-gray-700">{reply.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Reply Form */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Reply</h3>
                            <form onSubmit={handleReply}>
                                <textarea
                                    className="input min-h-[120px]"
                                    placeholder="Type your reply here..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    required
                                />
                                <div className="flex items-center justify-between mt-4">
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
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Sending...' : 'Send Reply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ticket Properties */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-600">Status</label>
                                    <p className="font-medium">{ticket.status}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Priority</label>
                                    <p className="font-medium">{ticket.priority}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Type</label>
                                    <p className="font-medium">{ticket.type}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Created</label>
                                    <p className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Last Updated</label>
                                    <p className="text-sm">{new Date(ticket.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Requester Info */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requester</h3>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="font-bold">{ticket.requester.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{ticket.requester}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TicketDetailPage;
