import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiCamera, FiArrowRight } from 'react-icons/fi';

const GlassmorphismReportCard = memo(() => {
    return (
        <>
            <style>{`
                /* ===== GLASSMORPHISM CARD - OPTIMIZED ===== */
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes ripplePass {
                    0% { left: -100%; opacity: 0; }
                    50% { opacity: 0.4; }
                    100% { left: 150%; opacity: 0; }
                }

                .glass-report-card {
                    position: relative;
                    background: linear-gradient(145deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.9));
                    border-radius: 20px;
                    padding: 24px;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    overflow: hidden;
                    animation: cardFadeIn 0.4s ease-out;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    will-change: transform, box-shadow;
                }

                .glass-report-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(59, 130, 246, 0.12);
                }

                .glass-report-card::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 20px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, transparent 40%);
                    pointer-events: none;
                }

                .glass-card-content { position: relative; z-index: 1; }

                .glass-card-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #f1f5f9;
                    margin: 0 0 10px 0;
                }

                .glass-card-description {
                    font-size: 0.88rem;
                    color: #94a3b8;
                    line-height: 1.5;
                    margin: 0 0 20px 0;
                }

                .glass-cta-button {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #3B82F6, #2563EB);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.92rem;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    will-change: transform;
                }

                .glass-cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(59, 130, 246, 0.35);
                }

                .glass-cta-button::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
                    transform: skewX(-20deg);
                    pointer-events: none;
                    opacity: 0;
                }

                .glass-cta-button:hover::before {
                    animation: ripplePass 0.6s ease-out forwards;
                }

                .glass-cta-icon { transition: transform 0.2s ease; }
                .glass-cta-button:hover .glass-cta-icon { transform: translateX(3px); }

                .glass-card-icon {
                    position: absolute;
                    top: 18px; right: 18px;
                    width: 40px; height: 40px;
                    border-radius: 10px;
                    background: rgba(59, 130, 246, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .glass-card-icon svg { color: #60A5FA; }
            `}</style>

            <div className="glass-report-card">
                <div className="glass-card-icon">
                    <FiCamera size={18} />
                </div>

                <div className="glass-card-content">
                    <h3 className="glass-card-title">Spot a problem?</h3>
                    <p className="glass-card-description">
                        Be the change in your community. Report issues like potholes, garbage, or streetlights in seconds.
                    </p>

                    <Link
                        to="/report"
                        className="glass-cta-button"
                    >
                        Report Issue Now
                        <FiArrowRight size={16} className="glass-cta-icon" />
                    </Link>
                </div>
            </div>
        </>
    );
});

export default GlassmorphismReportCard;
