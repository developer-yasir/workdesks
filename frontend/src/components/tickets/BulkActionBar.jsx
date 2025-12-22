import { useState } from 'react';
import { Tag, Trash2, Archive } from 'lucide-react';

const BulkActionBar = ({
    selectedCount,
    onAssign,
    onChangeStatus,
    onChangePriority,
    onAddTags,
    onDelete,
    onArchive,
    onClear
}) => {
    const [showAssignMenu, setShowAssignMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    const [showTagsInput, setShowTagsInput] = useState(false);
    const [tagInput, setTagInput] = useState('');

    if (selectedCount === 0) return null;

    const handleAddTags = () => {
        if (tagInput.trim()) {
            const tags = tagInput.split(',').map(t => t.trim()).filter(t => t);
            onAddTags(tags);
            setTagInput('');
            setShowTagsInput(false);
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center space-x-6 z-50">
            {/* Selected count */}
            <div className="flex items-center space-x-2">
                <span className="font-semibold">{selectedCount}</span>
                <span className="text-gray-300">selected</span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-700"></div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
                {/* Assign */}
                <div className="relative">
                    <button
                        onClick={() => setShowAssignMenu(!showAssignMenu)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                    >
                        Assign to...
                    </button>
                    {showAssignMenu && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-lg py-2 w-48">
                            <button
                                onClick={() => {
                                    onAssign('me');
                                    setShowAssignMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                            >
                                Assign to me
                            </button>
                            <button
                                onClick={() => {
                                    onAssign('team');
                                    setShowAssignMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                            >
                                Assign to team
                            </button>
                        </div>
                    )}
                </div>

                {/* Change Status */}
                <div className="relative">
                    <button
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                    >
                        Change status
                    </button>
                    {showStatusMenu && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-lg py-2 w-40">
                            {['Open', 'Pending', 'Resolved', 'Closed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        onChangeStatus(status);
                                        setShowStatusMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Change Priority */}
                <div className="relative">
                    <button
                        onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                    >
                        Change priority
                    </button>
                    {showPriorityMenu && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-lg py-2 w-40">
                            {['Low', 'Medium', 'High', 'Urgent'].map(priority => (
                                <button
                                    key={priority}
                                    onClick={() => {
                                        onChangePriority(priority);
                                        setShowPriorityMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Tags */}
                <div className="relative">
                    <button
                        onClick={() => setShowTagsInput(!showTagsInput)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                        <Tag className="w-4 h-4" />
                        <span>Add tags</span>
                    </button>
                    {showTagsInput && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-lg p-3 w-64">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTags()}
                                placeholder="Enter tags (comma separated)"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                                autoFocus
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setShowTagsInput(false);
                                        setTagInput('');
                                    }}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddTags}
                                    className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Archive */}
                <button
                    onClick={onArchive}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                >
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                </button>

                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-700"></div>

            {/* Clear selection */}
            <button
                onClick={onClear}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
                Clear selection
            </button>
        </div>
    );
};

export default BulkActionBar;
