import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import TransformationCard from '../common/TransformationCard';
import GlassmorphismReportCard from '../common/GlassmorphismReportCard';

const RightSidebar = ({ stats }) => {
    const trendingLocations = [
        { name: 'Gandhi Nagar', count: 12 },
        { name: 'Civil Lines', count: 8 },
        { name: 'Market Area', count: 5 }
    ];

    const resolvedCount = stats?.byStatus?.resolved || 1240;

    return (
        <aside className="sidebar-right">
            {/* Premium Glassmorphism Report Card */}
            <div className="animate-fade-in-up">
                <GlassmorphismReportCard />
            </div>

            {/* Trending Nearby Widget - Enhanced */}
            <div className="widget widget-trending animate-fade-in-up stagger-2" style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: '20px'
            }}>
                <div className="widget-trending-header">
                    <div className="widget-trending-title">
                        <span style={{ fontSize: '1.1rem' }}>📈</span>
                        <span style={{ fontWeight: '700' }}>Trending Nearby</span>
                    </div>
                    <div className="pulse-dot" style={{
                        width: '8px',
                        height: '8px',
                        background: '#10B981',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }}></div>
                </div>

                {trendingLocations.map((location, index) => (
                    <div
                        key={index}
                        className="trending-item"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: index < trendingLocations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <div className="trending-location" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiMapPin size={14} style={{ color: '#60A5FA' }} />
                            <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{location.name}</span>
                        </div>
                        <span style={{
                            color: '#F59E0B',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: 'rgba(245, 158, 11, 0.1)',
                            padding: '4px 10px',
                            borderRadius: '20px'
                        }}>
                            {location.count} active
                        </span>
                    </div>
                ))}

                <Link to="/map" className="view-heatmap" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '14px',
                    color: '#60A5FA',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                }}>
                    View Live Heatmap <FiArrowRight size={14} />
                </Link>
            </div>

            {/* Your Voice Matters Widget - Enhanced */}
            <div className="widget widget-voice animate-fade-in-up stagger-3" style={{
                background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(6, 95, 70, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '20px',
                textAlign: 'center',
                padding: '24px'
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    margin: '0 auto 14px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiCheckCircle size={28} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
                    Your Voice Matters
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    <span style={{
                        color: '#10B981',
                        fontSize: '1.4rem',
                        fontWeight: '800',
                        display: 'block',
                        marginBottom: '4px'
                    }}>
                        {resolvedCount}+
                    </span>
                    issues resolved this month by citizens like you.
                </p>
            </div>

            {/* Premium Transformation Card - BEFORE/AFTER */}
            <div className="animate-fade-in-up stagger-4">
                <TransformationCard />
            </div>
        </aside>
    );
};

export default RightSidebar;

