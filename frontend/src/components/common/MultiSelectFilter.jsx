import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const MultiSelectFilter = ({ label, options, selected = [], onChange, placeholder = "Any" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (value) => {
        const newSelected = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    const selectedCount = selected.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {label}
            </label>

            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
                <span className={selectedCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    {selectedCount > 0 ? `${selectedCount} selected` : placeholder}
                </span>
                <div className="flex items-center space-x-1">
                    {selectedCount > 0 && (
                        <div
                            onClick={handleClear}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                        >
                            <X className="w-3 h-3 text-gray-600" />
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
                    ) : (
                        <div className="py-1">
                            {options.map((option) => {
                                const value = typeof option === 'string' ? option : option.value;
                                const label = typeof option === 'string' ? option : option.label;
                                const isSelected = selected.includes(value);

                                return (
                                    <label
                                        key={value}
                                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggle(value)}
                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectFilter;
