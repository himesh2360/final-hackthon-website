import { useState, useEffect } from 'react';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';

const TransformationCard = () => {
    const [isTransformed, setIsTransformed] = useState(false);

    // Auto-transform cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransformed(prev => !prev);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <style>{`
                /* ===== TRANSFORMATION CARD - OPTIMIZED ===== */
                @keyframes heartbeat {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }

                .transformation-card {
                    position: relative;
                    border-radius: 18px;
                    padding: 24px;
                    overflow: hidden;
                    cursor: pointer;
                    min-height: 160px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition: background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
                }

                .transformation-card.before {
                    background: linear-gradient(145deg, rgba(185, 28, 28, 0.2), rgba(127, 29, 29, 0.12));
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.1);
                }

                .transformation-card.after {
                    background: linear-gradient(145deg, rgba(16, 185, 129, 0.18), rgba(6, 95, 70, 0.12));
                    border: 1px solid rgba(16, 185, 129, 0.35);
                    box-shadow: 0 4px 25px rgba(16, 185, 129, 0.15);
                }

                .transformation-card:hover {
                    transform: translateY(-2px);
                }

                .heartbeat-line {
                    position: absolute;
                    bottom: 15px;
                    left: 10%; width: 80%; height: 25px;
                    opacity: 0.4;
                    animation: heartbeat 2s ease-in-out infinite;
                    transition: opacity 0.5s ease;
                }

                .transformation-card.after .heartbeat-line { opacity: 0; }

                .transformation-icon {
                    width: 56px; height: 56px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 14px;
                    transition: background 0.5s ease, box-shadow 0.5s ease;
                }

                .transformation-icon.before {
                    background: rgba(239, 68, 68, 0.15);
                    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
                }

                .transformation-icon.after {
                    background: rgba(16, 185, 129, 0.15);
                    box-shadow: 0 0 25px rgba(16, 185, 129, 0.25);
                }

                .transformation-badge {
                    display: inline-block;
                    padding: 5px 16px;
                    border-radius: 50px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    margin-bottom: 8px;
                    color: white;
                    transition: background 0.5s ease, box-shadow 0.5s ease;
                }

                .transformation-badge.before {
                    background: linear-gradient(135deg, #EF4444, #DC2626);
                    box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
                }

                .transformation-badge.after {
                    background: linear-gradient(135deg, #10B981, #059669);
                    box-shadow: 0 3px 12px rgba(16, 185, 129, 0.3);
                }

                .transformation-text {
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: color 0.5s ease;
                }

                .transformation-text.before { color: #FCA5A5; }
                .transformation-text.after { color: #6EE7B7; }
            `}</style>

            <div
                className={`transformation-card ${isTransformed ? 'after' : 'before'}`}
                onClick={() => setIsTransformed(!isTransformed)}
            >
                {/* Heartbeat line for BEFORE state */}
                <div className="heartbeat-line">
                    <svg viewBox="0 0 200 25" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <polyline
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="2"
                            points="0,12 30,12 40,4 50,20 60,8 70,16 80,12 120,12 130,4 140,20 150,8 160,16 170,12 200,12"
                        />
                    </svg>
                </div>

                {/* Icon */}
                <div className={`transformation-icon ${isTransformed ? 'after' : 'before'}`}>
                    {isTransformed ? (
                        <FiShield size={24} color="#10B981" strokeWidth={2.5} />
                    ) : (
                        <FiAlertTriangle size={24} color="#EF4444" strokeWidth={2.5} />
                    )}
                </div>

                {/* Badge */}
                <span className={`transformation-badge ${isTransformed ? 'after' : 'before'}`}>
                    {isTransformed ? 'AFTER' : 'BEFORE'}
                </span>

                {/* Text */}
                <p className={`transformation-text ${isTransformed ? 'after' : 'before'}`} style={{ margin: 0 }}>
                    {isTransformed ? 'Fixed in 48h ✓' : 'Broken Drainage'}
                </p>
            </div>
        </>
    );
};

export default TransformationCard;
