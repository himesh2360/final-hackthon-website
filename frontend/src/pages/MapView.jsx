import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IssueMap from '../components/issues/IssueMap';
import { issuesAPI } from '../services/api';

const STATUS_FILTERS = [
    { value: '', label: 'All Issues', emoji: '📋' },
    { value: 'reported', label: 'Reported', emoji: '🔴', color: '#EF4444' },
    { value: 'verified', label: 'Verified', emoji: '✓', color: '#3B82F6' },
    { value: 'in_progress', label: 'In Progress', emoji: '🔧', color: '#F59E0B' },
    { value: 'resolved', label: 'Resolved', emoji: '✅', color: '#10B981' }
];

// Custom map cursor style
const mapCursorStyle = {
    cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 24 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23EF4444'/%3E%3Cstop offset='100%25' stop-color='%23DC2626'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23g)' stroke='%23fff' stroke-width='1.5' d='M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z'/%3E%3Ccircle cx='12' cy='12' r='4' fill='%23fff'/%3E%3C/svg%3E") 12 32, crosshair`
};

const MapView = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadIssues();
    }, [filter]);

    const loadIssues = async () => {
        try {
            const params = {};
            if (filter) params.status = filter;

            const response = await issuesAPI.getMapIssues(params);
            setIssues(response.data.issues);
        } catch (error) {
            console.error('Error loading map issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIssueClick = (issue) => {
        navigate(`/issues/${issue._id}`);
    };

    return (
        <div style={{
            height: 'calc(100vh - 72px)',
            marginTop: '72px',
            position: 'relative',
            ...mapCursorStyle
        }}>
            {/* Filter Controls */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 1000,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                animation: 'slideInLeft 0.5s ease forwards',
                minWidth: '200px'
            }}>
                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--text-muted)',
                    marginBottom: '8px'
                }}>
                    Filter by Status
                </div>
                {STATUS_FILTERS.map(s => (
                    <button
                        key={s.value}
                        onClick={() => setFilter(s.value)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: filter === s.value
                                ? s.color ? `${s.color}18` : 'rgba(37, 99, 235, 0.12)'
                                : 'transparent',
                            color: filter === s.value
                                ? s.color || 'var(--primary-light)'
                                : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                        }}
                    >
                        <span style={{ fontSize: '0.9rem' }}>{s.emoji}</span>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Issue Count */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 22px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--glass-border)',
                animation: 'fadeInUp 0.5s ease forwards'
            }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-light)' }}>
                    {issues.length}
                </span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.9rem' }}>
                    issues on map
                </span>
            </div>

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '100px',
                left: '20px',
                zIndex: 1000,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--glass-border)',
                animation: 'slideInLeft 0.5s ease 0.2s forwards',
                opacity: 0
            }}>
                <div style={{ fontWeight: '700', marginBottom: '14px', fontSize: '0.85rem' }}>
                    Legend
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {STATUS_FILTERS.slice(1).map(s => (
                        <div key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: s.color,
                                boxShadow: `0 0 8px ${s.color}50`
                            }}></div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hint for cursor */}
            <div style={{
                position: 'absolute',
                bottom: '100px',
                right: '20px',
                zIndex: 1000,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 18px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--glass-border)',
                animation: 'fadeInUp 0.5s ease 0.3s forwards',
                opacity: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
            }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                Click on markers to view details
            </div>

            {loading ? (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)'
                }}>
                    <div className="spinner"></div>
                </div>
            ) : (
                <IssueMap
                    issues={issues}
                    height="100%"
                    zoom={5}
                    onIssueClick={handleIssueClick}
                    useLightTiles={true}
                    showIndiaOnly={true}
                />
            )}
        </div>
    );
};

export default MapView;
