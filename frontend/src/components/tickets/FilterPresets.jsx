import { Filter, Clock, AlertCircle, Users, MessageSquare } from 'lucide-react';

const FilterPresets = ({ onApplyPreset, activePreset }) => {
    const presets = [
        {
            id: 'my-open',
            label: 'My Open Tickets',
            icon: Filter,
            filters: {
                status: ['Open'],
                assignedToMe: true
            },
            color: 'blue'
        },
        {
            id: 'unassigned',
            label: 'Unassigned',
            icon: Users,
            filters: {
                assignedTo: 'unassigned'
            },
            color: 'gray'
        },
        {
            id: 'overdue',
            label: 'Overdue',
            icon: Clock,
            filters: {
                overdue: true
            },
            color: 'red'
        },
        {
            id: 'high-priority',
            label: 'High Priority',
            icon: AlertCircle,
            filters: {
                priorities: ['High', 'Urgent']
            },
            color: 'orange'
        },
        {
            id: 'pending',
            label: 'Pending Response',
            icon: MessageSquare,
            filters: {
                status: ['Pending']
            },
            color: 'yellow'
        }
    ];

    const getColorClasses = (color, isActive) => {
        const colors = {
            blue: isActive
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50',
            gray: isActive
                ? 'bg-gray-100 text-gray-700 border-gray-300'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
            red: isActive
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-white text-red-600 border-red-200 hover:bg-red-50',
            orange: isActive
                ? 'bg-orange-100 text-orange-700 border-orange-300'
                : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50',
            yellow: isActive
                ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-2 overflow-x-auto">
                <span className="text-sm font-medium text-gray-700 flex-shrink-0">Quick Filters:</span>
                {presets.map((preset) => {
                    const Icon = preset.icon;
                    const isActive = activePreset === preset.id;

                    return (
                        <button
                            key={preset.id}
                            onClick={() => onApplyPreset(preset)}
                            className={`
                                flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium
                                transition-all duration-200 flex-shrink-0
                                ${getColorClasses(preset.color, isActive)}
                                ${isActive ? 'shadow-sm' : ''}
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{preset.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterPresets;
