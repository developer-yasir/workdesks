import { X } from 'lucide-react';

const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
    const getActiveFilters = () => {
        const active = [];

        // Status filters
        if (filters.status && filters.status.length > 0) {
            filters.status.forEach(status => {
                active.push({ type: 'status', value: status, label: `Status: ${status}` });
            });
        }

        // Priority filters
        if (filters.priorities && filters.priorities.length > 0) {
            filters.priorities.forEach(priority => {
                active.push({ type: 'priorities', value: priority, label: `Priority: ${priority}` });
            });
        }

        // Type filters
        if (filters.types && filters.types.length > 0) {
            filters.types.forEach(type => {
                active.push({ type: 'types', value: type, label: `Type: ${type}` });
            });
        }

        // Source filters
        if (filters.sources && filters.sources.length > 0) {
            filters.sources.forEach(source => {
                active.push({ type: 'sources', value: source, label: `Source: ${source}` });
            });
        }

        // Search filter
        if (filters.search) {
            active.push({ type: 'search', value: filters.search, label: `Search: "${filters.search}"` });
        }

        // Date filters
        if (filters.resolvedAt) {
            active.push({ type: 'resolvedAt', value: filters.resolvedAt, label: `Resolved: ${filters.resolvedAt}` });
        }

        if (filters.resolutionDueBy) {
            active.push({ type: 'resolutionDueBy', value: filters.resolutionDueBy, label: `Due: ${filters.resolutionDueBy}` });
        }

        return active;
    };

    const activeFilters = getActiveFilters();

    if (activeFilters.length === 0) return null;

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {activeFilters.map((filter, index) => (
                        <span
                            key={`${filter.type}-${filter.value}-${index}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                            {filter.label}
                            <button
                                onClick={() => onRemoveFilter(filter.type, filter.value)}
                                className="ml-1.5 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <button
                    onClick={onClearAll}
                    className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    Clear all
                </button>
            </div>
        </div>
    );
};

export default ActiveFilters;
