import { useState } from 'react';
import Modal from 'react-modal';
import api from '../../utils/api';

// Set app element for accessibility
Modal.setAppElement('#root');

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
    const [formData, setFormData] = useState({
        requester: '',
        subject: '',
        description: '',
        type: 'Question',
        priority: 'Medium'
    });
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setAttachments(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('requester', formData.requester);
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('priority', formData.priority);

            // Append files
            attachments.forEach((file) => {
                formDataToSend.append('attachments', file);
            });

            const response = await api.post('/tickets', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form
            setFormData({
                requester: '',
                subject: '',
                description: '',
                type: 'Question',
                priority: 'Medium'
            });
            setAttachments([]);

            // Notify parent and close
            if (onTicketCreated) {
                onTicketCreated(response.data.ticket);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '0',
            border: 'none',
            borderRadius: '12px'
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel="Create Ticket"
        >
            <div className="bg-white rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Requester Email */}
                        <div>
                            <label htmlFor="requester" className="label">
                                Requester Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="requester"
                                name="requester"
                                className="input"
                                value={formData.requester}
                                onChange={handleChange}
                                required
                                placeholder="customer@example.com"
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="label">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                className="input"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                placeholder="Brief description of the issue"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="label">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="input min-h-[120px]"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Detailed description of the issue..."
                            />
                        </div>

                        {/* Type and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="label">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    className="input"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="Question">Question</option>
                                    <option value="Incident">Incident</option>
                                    <option value="Problem">Problem</option>
                                    <option value="Feature Request">Feature Request</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className="label">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    className="input"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        {/* File Attachments */}
                        <div>
                            <label htmlFor="attachments" className="label">
                                Attachments (optional)
                            </label>
                            <input
                                type="file"
                                id="attachments"
                                multiple
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-blue-700
                  cursor-pointer"
                            />
                            {attachments.length > 0 && (
                                <p className="text-sm text-gray-600 mt-2">
                                    {attachments.length} file(s) selected
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateTicketModal;
