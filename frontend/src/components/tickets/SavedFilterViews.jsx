import { useState } from 'react';
import { Save, Star, X, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SavedFilterViews = ({ currentFilters, onApplyView, savedViews, onSaveView, onDeleteView }) => {
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [viewName, setViewName] = useState('');
    const [activeView, setActiveView] = useState(null);

    const handleSaveView = () => {
        if (!viewName.trim()) {
            toast.error('Please enter a view name');
            return;
        }

        const newView = {
            id: Date.now().toString(),
            name: viewName,
            filters: currentFilters,
            createdAt: new Date().toISOString()
        };

        onSaveView(newView);
        setViewName('');
        setShowSaveModal(false);
        toast.success(`View "${viewName}" saved!`);
    };

    const handleApplyView = (view) => {
        onApplyView(view);
        setActiveView(view.id);
    };

    const handleDeleteView = (viewId, viewName) => {
        if (window.confirm(`Delete view "${viewName}"?`)) {
            onDeleteView(viewId);
            if (activeView === viewId) {
                setActiveView(null);
            }
            toast.success('View deleted');
        }
    };

    const hasActiveFilters = () => {
        return Object.values(currentFilters).some(value => {
            if (Array.isArray(value)) return value.length > 0;
            return value !== '' && value !== null;
        });
    };

    return (
        <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Saved Views */}
                <div className="flex items-center space-x-2 flex-1 overflow-x-auto">
                    <span className="text-sm font-medium text-gray-700 flex-shrink-0">Saved Views:</span>

                    {savedViews.length === 0 ? (
                        <span className="text-sm text-gray-500 italic">No saved views yet</span>
                    ) : (
                        <div className="flex items-center space-x-2">
                            {savedViews.map((view) => (
                                <div
                                    key={view.id}
                                    className={`
                                        group flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm
                                        transition-all duration-200 flex-shrink-0
                                        ${activeView === view.id
                                            ? 'bg-primary text-white border-primary shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <button
                                        onClick={() => handleApplyView(view)}
                                        className="flex items-center space-x-1.5"
                                    >
                                        <Star className={`w-3.5 h-3.5 ${activeView === view.id ? 'fill-current' : ''}`} />
                                        <span className="font-medium">{view.name}</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteView(view.id, view.name)}
                                        className={`
                                            opacity-0 group-hover:opacity-100 transition-opacity
                                            ${activeView === view.id ? 'text-white hover:text-red-200' : 'text-gray-400 hover:text-red-600'}
                                        `}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save Current View Button */}
                <button
                    onClick={() => setShowSaveModal(true)}
                    disabled={!hasActiveFilters()}
                    className={`
                        flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-colors flex-shrink-0 ml-4
                        ${hasActiveFilters()
                            ? 'bg-teal-500 hover:bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    <Save className="w-4 h-4" />
                    <span>Save View</span>
                </button>
            </div>

            {/* Save View Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Save Filter View</h3>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                View Name
                            </label>
                            <input
                                type="text"
                                value={viewName}
                                onChange={(e) => setViewName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveView()}
                                placeholder="e.g., High Priority Open Tickets"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 mb-2">Current Filters:</p>
                            <div className="space-y-1 text-xs text-gray-600">
                                {currentFilters.status?.length > 0 && (
                                    <div>Status: {currentFilters.status.join(', ')}</div>
                                )}
                                {currentFilters.priorities?.length > 0 && (
                                    <div>Priority: {currentFilters.priorities.join(', ')}</div>
                                )}
                                {currentFilters.types?.length > 0 && (
                                    <div>Type: {currentFilters.types.join(', ')}</div>
                                )}
                                {currentFilters.sources?.length > 0 && (
                                    <div>Source: {currentFilters.sources.join(', ')}</div>
                                )}
                                {currentFilters.search && (
                                    <div>Search: "{currentFilters.search}"</div>
                                )}
                                {!hasActiveFilters() && (
                                    <div className="text-gray-400 italic">No filters applied</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveView}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                            >
                                Save View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedFilterViews;
