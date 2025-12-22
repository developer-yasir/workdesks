import { useState } from 'react';
import MultiSelectFilter from '../common/MultiSelectFilter';

const TicketFiltersPanel = ({ filters, onFilterChange, onApply, onClear }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onApply(localFilters);
    };

    const handleClear = () => {
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
        setLocalFilters(clearedFilters);
        onClear();
    };

    const hasActiveFilters = Object.values(localFilters).some(v =>
        Array.isArray(v) ? v.length > 0 : v !== ''
    );

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">FILTERS</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClear}
                            className="text-xs text-primary hover:text-blue-700"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search fields"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={localFilters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                    />
                    <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                </div>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Resolved at */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Resolved at
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={localFilters.resolvedAt}
                        onChange={(e) => handleChange('resolvedAt', e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last7days">Last 7 days</option>
                        <option value="last30days">Last 30 days</option>
                    </select>
                </div>

                {/* Resolution due by */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Resolution due by
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={localFilters.resolutionDueBy}
                        onChange={(e) => handleChange('resolutionDueBy', e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="thisweek">This week</option>
                    </select>
                </div>

                {/* First response due by */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        First response due by
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={localFilters.firstResponseDueBy}
                        onChange={(e) => handleChange('firstResponseDueBy', e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                    </select>
                </div>

                {/* Status - Multi-Select */}
                <MultiSelectFilter
                    label="Status"
                    options={['Open', 'Pending', 'Resolved', 'Closed']}
                    selected={localFilters.status || []}
                    onChange={(value) => handleChange('status', value)}
                    placeholder="Any"
                />

                {/* Priorities - Multi-Select */}
                <MultiSelectFilter
                    label="Priorities"
                    options={['Low', 'Medium', 'High', 'Urgent']}
                    selected={localFilters.priorities || []}
                    onChange={(value) => handleChange('priorities', value)}
                    placeholder="Any"
                />

                {/* Types - Multi-Select */}
                <MultiSelectFilter
                    label="Types"
                    options={['Question', 'Incident', 'Problem', 'Feature Request']}
                    selected={localFilters.types || []}
                    onChange={(value) => handleChange('types', value)}
                    placeholder="Any"
                />

                {/* Sources - Multi-Select */}
                <MultiSelectFilter
                    label="Sources"
                    options={['Email', 'Portal', 'Phone', 'Chat', 'Feedback Widget']}
                    selected={localFilters.sources || []}
                    onChange={(value) => handleChange('sources', value)}
                    placeholder="Any"
                />

                {/* Tags */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Tags
                    </label>
                    <input
                        type="text"
                        placeholder="Any"
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={localFilters.tags}
                        onChange={(e) => handleChange('tags', e.target.value)}
                    />
                </div>

                {/* Companies Include */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Companies <span className="text-gray-500">Include</span>
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={Array.isArray(localFilters.companies) ? '' : localFilters.companies}
                        onChange={(e) => handleChange('companies', e.target.value)}
                    >
                        <option value="">Any</option>
                    </select>
                </div>

                {/* Contacts Include */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Contacts <span className="text-gray-500">Include</span>
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={Array.isArray(localFilters.contacts) ? '' : localFilters.contacts}
                        onChange={(e) => handleChange('contacts', e.target.value)}
                    >
                        <option value="">Any</option>
                    </select>
                </div>

                {/* Company Include */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Company <span className="text-gray-500">Include</span>
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={Array.isArray(localFilters.company) ? '' : localFilters.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                    >
                        <option value="">Any</option>
                    </select>
                </div>

                {/* Country Include */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Country <span className="text-gray-500">Include</span>
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={Array.isArray(localFilters.country) ? '' : localFilters.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                    >
                        <option value="">Any</option>
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Category
                    </label>
                    <select
                        className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={localFilters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="">Any</option>
                    </select>
                </div>
            </div>

            {/* Apply Button - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                    onClick={handleApply}
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded transition-colors"
                >
                    Apply
                </button>
            </div>
        </div>
    );
};

export default TicketFiltersPanel;
