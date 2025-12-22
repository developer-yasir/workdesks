import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, X, AlertCircle, Send } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const CustomerCreateTicket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        type: 'Question',
        priority: 'Medium'
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const { subject, description, type, priority } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }
        setFiles([...files, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!subject || !description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('customerToken');
            const formDataToSend = new FormData();

            formDataToSend.append('subject', subject);
            formDataToSend.append('description', description);
            formDataToSend.append('type', type);
            formDataToSend.append('priority', priority);

            files.forEach(file => {
                formDataToSend.append('attachments', file);
            });

            const response = await axios.post(
                'http://localhost:5000/api/customer/tickets',
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast.success('Ticket created successfully!');
            navigate(`/customer/tickets/${response.data.ticket._id}`);
        } catch (error) {
            console.error('Create ticket error:', error);
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomerLayout>
            <div className="max-w-5xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Submit a Ticket</h1>
                    <p className="text-gray-600 mt-2">Need help? Create a support ticket and our team will get back to you.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form - Left Side (2/3 width) */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 space-y-6">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter a brief summary of your issue"
                                        required
                                    />
                                </div>

                                {/* Type and Priority - Side by Side */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Type
                                        </label>
                                        <select
                                            name="type"
                                            value={type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                        >
                                            <option value="Question">Question</option>
                                            <option value="Incident">Incident</option>
                                            <option value="Problem">Problem</option>
                                            <option value="Feature Request">Feature Request</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={priority}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={description}
                                        onChange={handleChange}
                                        rows="8"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, or relevant information..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Be as detailed as possible to help us resolve your issue faster.</p>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Attachments
                                    </label>

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <Paperclip className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 mb-3">
                                            Drop files here or click to browse
                                        </p>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                            accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-block px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors font-medium text-sm"
                                        >
                                            Choose Files
                                        </label>
                                        <p className="text-xs text-gray-500 mt-3">
                                            Supported: Images, PDF, DOC, TXT, XLSX (Max 5 files, 10MB each)
                                        </p>
                                    </div>

                                    {/* File List */}
                                    {files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Paperclip className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {(file.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => navigate('/customer/dashboard')}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{loading ? 'Submitting...' : 'Submit Ticket'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Help Sidebar - Right Side (1/3 width) */}
                    <div className="lg:col-span-1">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 sticky top-6">
                            <div className="flex items-start space-x-3 mb-4">
                                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Tips for Better Support</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>Use a clear, descriptive subject line</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>Include error messages or screenshots</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>Describe steps to reproduce the issue</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>Mention your browser or device type</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-blue-200">
                                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Expected Response Time</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Low Priority:</span>
                                        <span className="font-medium text-gray-900">48 hours</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Medium:</span>
                                        <span className="font-medium text-gray-900">24 hours</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">High:</span>
                                        <span className="font-medium text-gray-900">8 hours</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Urgent:</span>
                                        <span className="font-medium text-blue-600">2 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default CustomerCreateTicket;
