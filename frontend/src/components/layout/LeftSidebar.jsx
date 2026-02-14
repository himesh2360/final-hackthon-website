// import { useState, useEffect, memo } from 'react';
// import { FiSearch, FiChevronUp, FiChevronDown, FiFilter, FiX } from 'react-icons/fi';

// const INDIAN_STATES = [
//     'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
//     'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
//     'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
//     'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
//     'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
//     'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
// ];

// const CATEGORIES = [
//     { value: 'roads', label: 'Pothole' },
//     { value: 'water', label: 'Water Supply' },
//     { value: 'electricity', label: 'Electricity' },
//     { value: 'garbage', label: 'Garbage' },
//     { value: 'streetlights', label: 'Street Lights' },
//     { value: 'pollution', label: 'Pollution' },
//     { value: 'drainage', label: 'Drainage' }
// ];

// const LeftSidebar = memo(({ filters, onFilterChange }) => {
//     // Local state to prevent instant re-renders of the parent
//     const [localFilters, setLocalFilters] = useState(filters);
//     const [search, setSearch] = useState('');
//     const [showAllStates, setShowAllStates] = useState(false);
//     const [sectionsOpen, setSectionsOpen] = useState({
//         sort: true,
//         status: true,
//         states: true,
//         category: true
//     });

//     // Update local state when props change (e.g. on mount or clear)
//     useEffect(() => {
//         setLocalFilters(filters);
//     }, [filters]);

//     const toggleSection = (section) => {
//         setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
//     };

//     const handleLocalFilterUpdate = (key, value) => {
//         setLocalFilters(prev => ({
//             ...prev,
//             [key]: prev[key] === value ? '' : value
//         }));
//     };

//     const handleApplyFilters = () => {
//         onFilterChange({ ...localFilters, search });
//     };

//     const handleClearFilters = () => {
//         const cleared = {
//             status: '',
//             category: '',
//             state: '',
//             sort: 'newest'
//         };
//         setLocalFilters(cleared);
//         setSearch('');
//         onFilterChange(cleared);
//     };

//     const displayedStates = showAllStates ? INDIAN_STATES : INDIAN_STATES.slice(0, 7);

//     const statusFilters = [
//         { value: 'reported', label: 'Reported' },
//         { value: 'in_progress', label: 'In Progress' },
//         { value: 'resolved', label: 'Resolved' }
//     ];

//     return (
//         <aside className="sidebar-left">
//             {/* Filter Actions */}
//             <div className="sidebar-actions" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
//                 <button
//                     className="btn btn-primary btn-sm"
//                     style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
//                     onClick={handleApplyFilters}
//                 >
//                     <FiFilter size={14} /> Apply
//                 </button>
//                 <button
//                     className="btn btn-outline btn-sm"
//                     style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
//                     onClick={handleClearFilters}
//                 >
//                     <FiX size={14} /> Clear
//                 </button>
//             </div>

//             {/* Search */}
//             <div className="sidebar-search">
//                 <FiSearch />
//                 <input
//                     type="text"
//                     placeholder="Search issues..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
//                 />
//             </div>

//             {/* Sort By */}
//             <div className="sidebar-section">
//                 <div className="sidebar-section-header" onClick={() => toggleSection('sort')}>
//                     <span className="sidebar-section-title">Sort By</span>
//                     {sectionsOpen.sort ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//                 </div>
//                 {sectionsOpen.sort && (
//                     <select
//                         className="sidebar-select"
//                         value={localFilters.sort || 'newest'}
//                         onChange={(e) => setLocalFilters({ ...localFilters, sort: e.target.value })}
//                     >
//                         <option value="newest">Newest First</option>
//                         <option value="oldest">Oldest First</option>
//                         <option value="most_upvoted">Most Upvoted</option>
//                         <option value="trending">Trending</option>
//                     </select>
//                 )}
//             </div>

//             {/* Status */}
//             <div className="sidebar-section">
//                 <div className="sidebar-section-header" onClick={() => toggleSection('status')}>
//                     <span className="sidebar-section-title">Status</span>
//                     {sectionsOpen.status ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//                 </div>
//                 {sectionsOpen.status && (
//                     <div>
//                         {statusFilters.map(status => (
//                             <div
//                                 key={status.value}
//                                 className={`filter-option ${localFilters.status === status.value ? 'active' : ''}`}
//                                 onClick={() => handleLocalFilterUpdate('status', status.value)}
//                             >
//                                 <div className="filter-option-left">
//                                     <div className="filter-checkbox">
//                                         {localFilters.status === status.value && '✓'}
//                                     </div>
//                                     <span>{status.label}</span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* States */}
//             <div className="sidebar-section">
//                 <div className="sidebar-section-header" onClick={() => toggleSection('states')}>
//                     <span className="sidebar-section-title">States</span>
//                     {sectionsOpen.states ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//                 </div>
//                 {sectionsOpen.states && (
//                     <div>
//                         {displayedStates.map(state => (
//                             <div
//                                 key={state}
//                                 className={`filter-option ${localFilters.state === state ? 'active' : ''}`}
//                                 onClick={() => handleLocalFilterUpdate('state', state)}
//                             >
//                                 <div className="filter-option-left">
//                                     <div className="filter-checkbox">
//                                         {localFilters.state === state && '✓'}
//                                     </div>
//                                     <span>{state}</span>
//                                 </div>
//                             </div>
//                         ))}
//                         <div
//                             className="see-more-btn"
//                             onClick={() => setShowAllStates(!showAllStates)}
//                         >
//                             {showAllStates ? '▲ See less' : '▼ See more'}
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Category */}
//             <div className="sidebar-section">
//                 <div className="sidebar-section-header" onClick={() => toggleSection('category')}>
//                     <span className="sidebar-section-title">Category</span>
//                     {sectionsOpen.category ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//                 </div>
//                 {sectionsOpen.category && (
//                     <div>
//                         {CATEGORIES.map(cat => (
//                             <div
//                                 key={cat.value}
//                                 className={`filter-option ${localFilters.category === cat.value ? 'active' : ''}`}
//                                 onClick={() => handleLocalFilterUpdate('category', cat.value)}
//                             >
//                                 <div className="filter-option-left">
//                                     <div className="filter-checkbox">
//                                         {localFilters.category === cat.value && '✓'}
//                                     </div>
//                                     <span>{cat.label}</span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </aside>
//     );
// });

// export default LeftSidebar;

import { useState, useEffect, memo } from 'react';
import { FiSearch, FiChevronUp, FiChevronDown, FiFilter, FiX } from 'react-icons/fi';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
    'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CATEGORIES = [
    { value: 'roads', label: 'Pothole' },
    { value: 'water', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'streetlights', label: 'Street Lights' },
    { value: 'pollution', label: 'Pollution' },
    { value: 'drainage', label: 'Drainage' }
];

const DEFAULT_FILTERS = {
    search: '',
    status: '',
    category: '',
    state: '',
    sort: 'newest'
};

const LeftSidebar = memo(({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters || DEFAULT_FILTERS);
    const [showAllStates, setShowAllStates] = useState(false);
    const [sectionsOpen, setSectionsOpen] = useState({
        sort: true,
        status: true,
        states: true,
        category: true
    });

    // Sync with parent filters
    useEffect(() => {
        setLocalFilters(filters || DEFAULT_FILTERS);
    }, [filters]);

    const toggleSection = (section) => {
        setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleLocalFilterUpdate = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: prev[key] === value ? '' : value
        }));
    };

    const handleApplyFilters = () => {
        onFilterChange(localFilters);
    };

    const handleClearFilters = () => {
        setLocalFilters(DEFAULT_FILTERS);
        onFilterChange(DEFAULT_FILTERS);
    };

    const displayedStates = showAllStates ? INDIAN_STATES : INDIAN_STATES.slice(0, 7);

    const statusFilters = [
        { value: 'reported', label: 'Reported' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' }
    ];

    return (
        <aside className="sidebar-left">
            {/* Filter Actions */}
            <div className="sidebar-actions" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={handleApplyFilters}
                >
                    <FiFilter size={14} /> Apply
                </button>
                <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={handleClearFilters}
                >
                    <FiX size={14} /> Clear
                </button>
            </div>

            {/* Search */}
            <div className="sidebar-search">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Search issues..."
                    value={localFilters.search}
                    onChange={(e) =>
                        setLocalFilters({ ...localFilters, search: e.target.value })
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                />
            </div>

            {/* Sort */}
            <div className="sidebar-section">
                <div className="sidebar-section-header" onClick={() => toggleSection('sort')}>
                    <span className="sidebar-section-title">Sort By</span>
                    {sectionsOpen.sort ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
                {sectionsOpen.sort && (
                    <select
                        className="sidebar-select"
                        value={localFilters.sort}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, sort: e.target.value })
                        }
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
                                className={`filter-option ${localFilters.status === status.value ? 'active' : ''}`}
                                onClick={() => handleLocalFilterUpdate('status', status.value)}
                            >
                                <div className="filter-option-left">
                                    <div className="filter-checkbox">
                                        {localFilters.status === status.value && '✓'}
                                    </div>
                                    <span>{status.label}</span>
                                </div>
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
                                className={`filter-option ${localFilters.state === state ? 'active' : ''}`}
                                onClick={() => handleLocalFilterUpdate('state', state)}
                            >
                                <div className="filter-option-left">
                                    <div className="filter-checkbox">
                                        {localFilters.state === state && '✓'}
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
                                className={`filter-option ${localFilters.category === cat.value ? 'active' : ''}`}
                                onClick={() => handleLocalFilterUpdate('category', cat.value)}
                            >
                                <div className="filter-option-left">
                                    <div className="filter-checkbox">
                                        {localFilters.category === cat.value && '✓'}
                                    </div>
                                    <span>{cat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
});

export default LeftSidebar;
