import { useState } from 'react';

const TicketFilters = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        type: '',
        search: ''
    });

    const handleChange = (e) => {
        const newFilters = {
            ...filters,
            [e.target.name]: e.target.value
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            status: '',
            priority: '',
            type: '',
            search: ''
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="card p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                    <label htmlFor="search" className="label">
                        Search
                    </label>
                    <input
                        type="text"
                        id="search"
                        name="search"
                        className="input"
                        placeholder="Search by ticket #, subject, or requester..."
                        value={filters.search}
                        onChange={handleChange}
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label htmlFor="status" className="label">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        className="input"
                        value={filters.status}
                        onChange={handleChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>

                {/* Priority Filter */}
                <div>
                    <label htmlFor="priority" className="label">
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        className="input"
                        value={filters.priority}
                        onChange={handleChange}
                    >
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>

                {/* Type Filter */}
                <div>
                    <label htmlFor="type" className="label">
                        Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        className="input"
                        value={filters.type}
                        onChange={handleChange}
                    >
                        <option value="">All Types</option>
                        <option value="Question">Question</option>
                        <option value="Incident">Incident</option>
                        <option value="Problem">Problem</option>
                        <option value="Feature Request">Feature Request</option>
                    </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <div className="md:col-span-3 flex items-end">
                        <button
                            onClick={handleClear}
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketFilters;
