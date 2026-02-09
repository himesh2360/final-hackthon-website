import { useState } from 'react';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
    'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CATEGORIES = [
    { value: 'roads', label: 'Pothole', count: 12 },
    { value: 'water', label: 'Water Supply', count: 8 },
    { value: 'electricity', label: 'Electricity', count: 5 },
    { value: 'garbage', label: 'Garbage', count: 15 },
    { value: 'streetlights', label: 'Street Lights', count: 7 },
    { value: 'pollution', label: 'Pollution', count: 4 },
    { value: 'drainage', label: 'Drainage', count: 6 }
];

const LeftSidebar = ({ filters, onFilterChange }) => {
    const [search, setSearch] = useState('');
    const [showAllStates, setShowAllStates] = useState(false);
    const [sectionsOpen, setSectionsOpen] = useState({
        sort: true,
        status: true,
        states: true,
        category: true
    });

    const toggleSection = (section) => {
        setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const displayedStates = showAllStates ? INDIAN_STATES : INDIAN_STATES.slice(0, 7);

    const statusFilters = [
        { value: 'reported', label: 'Reported', count: filters.statusCounts?.reported || 0 },
        { value: 'in_progress', label: 'In Progress', count: filters.statusCounts?.in_progress || 0 },
        { value: 'resolved', label: 'Resolved', count: filters.statusCounts?.resolved || 0 }
    ];

    return (
        <aside className="sidebar-left">
            {/* Search */}
            <div className="sidebar-search">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Search issues..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Sort By */}
            <div className="sidebar-section">
                <div className="sidebar-section-header" onClick={() => toggleSection('sort')}>
                    <span className="sidebar-section-title">Sort By</span>
                    {sectionsOpen.sort ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
                {sectionsOpen.sort && (
                    <select
                        className="sidebar-select"
                        value={filters.sort || 'newest'}
                        onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="most_upvoted">Most Upvoted</option>
                        <option value="trending">Trending</option>
                    </select>
                )}
            </div>

            {/* Status */}
            <div className="sidebar-section">
                <div className="sidebar-section-header" onClick={() => toggleSection('status')}>
                    <span className="sidebar-section-title">Status</span>
                    {sectionsOpen.status ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
                {sectionsOpen.status && (
                    <div>
                        {statusFilters.map(status => (
                            <div
                                key={status.value}
                                className={`filter-option ${filters.status === status.value ? 'active' : ''}`}
                                onClick={() => onFilterChange({
                                    ...filters,
                                    status: filters.status === status.value ? '' : status.value
                                })}
                            >
                                <div className="filter-option-left">
                                    <div className="filter-checkbox">
                                        {filters.status === status.value && '✓'}
                                    </div>
                                    <span>{status.label}</span>
                                </div>
                                <span className="filter-count">{status.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* States */}
            <div className="sidebar-section">
                <div className="sidebar-section-header" onClick={() => toggleSection('states')}>
                    <span className="sidebar-section-title">States</span>
                    {sectionsOpen.states ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
                {sectionsOpen.states && (
                    <div>
                        {displayedStates.map(state => (
                            <div
                                key={state}
                                className={`filter-option ${filters.state === state ? 'active' : ''}`}
                                onClick={() => onFilterChange({
                                    ...filters,
                                    state: filters.state === state ? '' : state
                                })}
                            >
                                <div className="filter-option-left">
                                    <div className="filter-checkbox">
                                        {filters.state === state && '✓'}
                                    </div>
                                    <span>{state}</span>
                                </div>
                            </div>
                        ))}
                        <div
                            className="see-more-btn"
                            onClick={() => setShowAllStates(!showAllStates)}
                        >
                            {showAllStates ? '▲ See less' : '▼ See more'}
                        </div>
                    </div>
                )}
            </div>

            {/* Category */}
            <div className="sidebar-section">
                <div className="sidebar-section-header" onClick={() => toggleSection('category')}>
                    <span className="sidebar-section-title">Category</span>
                    {sectionsOpen.category ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
                {sectionsOpen.category && (
                    <div>
                        {CATEGORIES.map(cat => (
                            <div
                                key={cat.value}
                                className={`filter-option ${filters.category === cat.value ? 'active' : ''}`}
                                onClick={() => onFilterChange({
                                    ...filters,
                                    category: filters.category === cat.value ? '' : cat.value
                                })}
                            >
                                <div className="filter-option-left">
                                    <div className="filter-checkbox">
                                        {filters.category === cat.value && '✓'}
                                    </div>
                                    <span>{cat.label}</span>
                                </div>
                                <span className="filter-count">{cat.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default LeftSidebar;
