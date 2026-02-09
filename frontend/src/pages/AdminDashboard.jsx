import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FiHome, FiList, FiMap, FiBarChart2, FiUsers, FiSettings,
    FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp
} from 'react-icons/fi';
import IssueMap from '../components/issues/IssueMap';
import { adminAPI, analyticsAPI, issuesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [issues, setIssues] = useState([]);
    const [mapIssues, setMapIssues] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        loadData();
    }, [isAdmin, statusFilter]);

    const loadData = async () => {
        try {
            const [statsRes, issuesRes, mapRes, categoryRes] = await Promise.all([
                analyticsAPI.getOverview(),
                adminAPI.getIssues({ limit: 20, status: statusFilter || undefined }),
                issuesAPI.getMapIssues({}),
                analyticsAPI.getByCategory()
            ]);

            setStats(statsRes.data.stats);
            setIssues(issuesRes.data.issues);
            setMapIssues(mapRes.data.issues);
            setCategoryStats(categoryRes.data.stats);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            await adminAPI.updateStatus(issueId, newStatus);
            loadData();
            setSelectedIssue(null);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCategory = (cat) => {
        return cat?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="skeleton" style={{ height: '300px', marginBottom: '24px' }}></div>
                    <div className="skeleton" style={{ height: '400px' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ padding: '20px 0' }}>
            <div className="container">
                <div className="dashboard-grid">
                    {/* Sidebar */}
                    <div className="dashboard-sidebar">
                        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Admin Panel</h3>
                        <nav className="sidebar-nav">
                            <button
                                className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <FiHome /> Overview
                            </button>
                            <button
                                className={`sidebar-link ${activeTab === 'issues' ? 'active' : ''}`}
                                onClick={() => setActiveTab('issues')}
                            >
                                <FiList /> Manage Issues
                            </button>
                            <button
                                className={`sidebar-link ${activeTab === 'map' ? 'active' : ''}`}
                                onClick={() => setActiveTab('map')}
                            >
                                <FiMap /> Map View
                            </button>
                            <button
                                className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analytics')}
                            >
                                <FiBarChart2 /> Analytics
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="dashboard-content">
                        {activeTab === 'overview' && (
                            <>
                                <h2 style={{ marginBottom: '24px' }}>Dashboard Overview</h2>

                                {/* Stats Grid */}
                                <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'rgba(33, 150, 243, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FiList style={{ fontSize: '1.5rem', color: 'var(--primary)' }} />
                                            </div>
                                            <div>
                                                <div className="stat-value" style={{ fontSize: '2rem' }}>{stats?.totalIssues || 0}</div>
                                                <div className="stat-label">Total Issues</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 152, 0, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FiClock style={{ fontSize: '1.5rem', color: 'var(--secondary)' }} />
                                            </div>
                                            <div>
                                                <div className="stat-value" style={{ fontSize: '2rem' }}>{stats?.byStatus?.reported || 0}</div>
                                                <div className="stat-label">Pending</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'rgba(76, 175, 80, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FiCheckCircle style={{ fontSize: '1.5rem', color: 'var(--status-resolved)' }} />
                                            </div>
                                            <div>
                                                <div className="stat-value" style={{ fontSize: '2rem' }}>{stats?.byStatus?.resolved || 0}</div>
                                                <div className="stat-label">Resolved</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'rgba(156, 39, 176, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FiTrendingUp style={{ fontSize: '1.5rem', color: '#9C27B0' }} />
                                            </div>
                                            <div>
                                                <div className="stat-value" style={{ fontSize: '2rem' }}>{stats?.resolutionRate || 0}%</div>
                                                <div className="stat-label">Resolution Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Issues */}
                                <h3 style={{ marginBottom: '16px' }}>Recent Issues</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {issues.slice(0, 5).map(issue => (
                                                <tr key={issue._id}>
                                                    <td>
                                                        <Link to={`/issues/${issue._id}`} style={{ fontWeight: '500' }}>
                                                            {issue.title.substring(0, 40)}...
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <span className="category-badge">{formatCategory(issue.category)}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${issue.status}`}>
                                                            {issue.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(issue.createdAt)}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => setSelectedIssue(issue)}
                                                        >
                                                            Update
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'issues' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <h2>Manage Issues</h2>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['', 'reported', 'verified', 'in_progress', 'resolved'].map(status => (
                                            <button
                                                key={status}
                                                className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
                                                onClick={() => setStatusFilter(status)}
                                            >
                                                {status ? status.replace('_', ' ') : 'All'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Reporter</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Upvotes</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {issues.map(issue => (
                                                <tr key={issue._id}>
                                                    <td>
                                                        <Link to={`/issues/${issue._id}`} style={{ fontWeight: '500' }}>
                                                            {issue.title.substring(0, 35)}...
                                                        </Link>
                                                    </td>
                                                    <td>{issue.reporter?.name || 'Anonymous'}</td>
                                                    <td>
                                                        <span className="category-badge">{formatCategory(issue.category)}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${issue.status}`}>
                                                            {issue.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>{issue.upvoteCount || 0}</td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(issue.createdAt)}</td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => setSelectedIssue(issue)}
                                                            >
                                                                Update Status
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'map' && (
                            <>
                                <h2 style={{ marginBottom: '24px' }}>Map View</h2>
                                <IssueMap
                                    issues={mapIssues}
                                    height="500px"
                                    onIssueClick={(issue) => navigate(`/issues/${issue._id}`)}
                                />
                            </>
                        )}

                        {activeTab === 'analytics' && (
                            <>
                                <h2 style={{ marginBottom: '24px' }}>Analytics</h2>

                                <div className="grid grid-2" style={{ marginBottom: '32px' }}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h3 style={{ marginBottom: '20px' }}>Issues by Category</h3>
                                            {categoryStats.map((stat, index) => (
                                                <div key={stat._id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px 0',
                                                    borderBottom: index < categoryStats.length - 1 ? '1px solid var(--border-color)' : 'none'
                                                }}>
                                                    <span style={{ textTransform: 'capitalize' }}>{stat._id?.replace(/_/g, ' ')}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ fontWeight: '600' }}>{stat.count}</span>
                                                        <span style={{ color: 'var(--status-resolved)', fontSize: '0.85rem' }}>
                                                            {stat.resolved} resolved
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="card-body">
                                            <h3 style={{ marginBottom: '20px' }}>Status Distribution</h3>
                                            {['reported', 'verified', 'in_progress', 'resolved'].map(status => {
                                                const count = stats?.byStatus?.[status === 'in_progress' ? 'inProgress' : status] || 0;
                                                const percentage = stats?.totalIssues > 0
                                                    ? ((count / stats.totalIssues) * 100).toFixed(1)
                                                    : 0;

                                                return (
                                                    <div key={status} style={{ marginBottom: '16px' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginBottom: '6px'
                                                        }}>
                                                            <span style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                                                            <span>{count} ({percentage}%)</span>
                                                        </div>
                                                        <div style={{
                                                            height: '8px',
                                                            background: 'var(--glass-bg)',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${percentage}%`,
                                                                height: '100%',
                                                                background: `var(--status-${status})`,
                                                                borderRadius: '4px'
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-body">
                                        <h3 style={{ marginBottom: '16px' }}>This Week's Performance</h3>
                                        <div style={{ display: 'flex', gap: '40px' }}>
                                            <div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                    {stats?.issuesLastWeek || 0}
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)' }}>New issues reported</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--status-resolved)' }}>
                                                    {stats?.resolvedLastWeek || 0}
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)' }}>Issues resolved</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {selectedIssue && (
                <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Update Issue Status</h3>
                            <button className="modal-close" onClick={() => setSelectedIssue(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '16px' }}><strong>{selectedIssue.title}</strong></p>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                Current status: <span className={`badge badge-${selectedIssue.status}`}>
                                    {selectedIssue.status.replace('_', ' ')}
                                </span>
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['verified', 'in_progress', 'resolved', 'rejected'].map(status => (
                                    <button
                                        key={status}
                                        className="btn btn-outline"
                                        onClick={() => handleStatusChange(selectedIssue._id, status)}
                                        disabled={selectedIssue.status === status}
                                    >
                                        Mark as {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
