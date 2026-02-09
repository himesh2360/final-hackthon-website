import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiPlus, FiMapPin, FiGrid, FiList } from 'react-icons/fi';
import IssueCard from '../components/issues/IssueCard';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';
import { issuesAPI, upvotesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { value: '', label: 'All' },
    { value: 'roads', label: '🛣️ Roads' },
    { value: 'water', label: '💧 Water' },
    { value: 'electricity', label: '⚡ Electric' },
    { value: 'garbage', label: '🗑️ Garbage' },
    { value: 'streetlights', label: '💡 Lights' },
    { value: 'pollution', label: '💨 Pollution' }
];

const STATUSES = [
    { value: '', label: 'All Status', emoji: '📋' },
    { value: 'reported', label: 'Reported', emoji: '🔴' },
    { value: 'in_progress', label: 'In Progress', emoji: '🔧' },
    { value: 'resolved', label: 'Resolved', emoji: '✅' }
];

const Issues = () => {
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        state: searchParams.get('state') || '',
        sort: 'newest',
        statusCounts: { reported: 12, in_progress: 8, resolved: 45 }
    });

    useEffect(() => {
        loadIssues();
    }, [page, category, status, filters]);

    const loadIssues = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (category) params.category = category;
            if (status) params.status = status;
            if (search) params.search = search;
            if (filters.state) params.state = filters.state;

            const response = await issuesAPI.getAll(params);
            setIssues(response.data.issues);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Error loading issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadIssues();
    };

    const handleUpvote = async (issueId) => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        try {
            const response = await upvotesAPI.toggle(issueId);
            setIssues(prev => prev.map(issue =>
                issue._id === issueId
                    ? { ...issue, upvoteCount: response.data.upvoteCount, hasUpvoted: response.data.upvoted }
                    : issue
            ));
        } catch (error) {
            console.error('Error toggling upvote:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    return (
        <div className="main-layout">
            {/* Left Sidebar */}
            <LeftSidebar filters={filters} onFilterChange={handleFilterChange} />

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <div className="section-header animate-fade-in-up" style={{ marginBottom: '24px' }}>
                    <div>
                        <h1 className="section-title" style={{ marginBottom: '4px' }}>All Issues</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {filters.state ? `Showing issues in ${filters.state}` : 'Browse civic issues in your community'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to="/map" className="btn btn-secondary btn-sm">
                            <FiMapPin /> Map
                        </Link>
                        <Link to="/report" className="btn btn-primary btn-sm">
                            <FiPlus /> Report
                        </Link>
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="card animate-fade-in-up stagger-1" style={{ marginBottom: '24px' }}>
                    <div className="card-body" style={{ padding: '16px' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                                <FiSearch style={{
                                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search issues..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ paddingLeft: '42px', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {STATUSES.map(s => (
                                    <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => { setStatus(s.value); setPage(1); }}
                                        className={`filter-chip ${status === s.value ? 'active' : ''}`}
                                    >
                                        {s.emoji} {s.label}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`btn btn-ghost btn-sm ${viewMode === 'grid' ? 'active' : ''}`}
                                    style={{ padding: '8px' }}
                                >
                                    <FiGrid />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`btn btn-ghost btn-sm ${viewMode === 'list' ? 'active' : ''}`}
                                    style={{ padding: '8px' }}
                                >
                                    <FiList />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Issues Grid */}
                {loading ? (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-3' : 'grid-2'}`}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card">
                                <div className="skeleton" style={{ height: '160px' }}></div>
                                <div className="card-body">
                                    <div className="skeleton" style={{ height: '20px', marginBottom: '8px' }}></div>
                                    <div className="skeleton" style={{ height: '50px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : issues.length === 0 ? (
                    <div className="empty-state animate-fade-in-up">
                        <div className="empty-icon">📋</div>
                        <h3 className="empty-title">No issues found</h3>
                        <p className="empty-text">Try adjusting your filters or report a new issue</p>
                        <Link to="/report" className="btn btn-primary">
                            <FiPlus /> Report Issue
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={`grid ${viewMode === 'grid' ? 'grid-3' : 'grid-2'}`}>
                            {issues.map((issue, index) => (
                                <div key={issue._id} className={`animate-fade-in-up stagger-${(index % 6) + 1}`}>
                                    <IssueCard issue={issue} onUpvote={handleUpvote} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '40px' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>

                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Right Sidebar */}
            <RightSidebar />
        </div>
    );
};

export default Issues;
