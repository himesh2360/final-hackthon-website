import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiSun, FiMoon, FiHome, FiList, FiMap, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <img src="/logo.png" alt="Civic Engine" />
                        <span>Civic Engine</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-nav">
                        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                            Home
                        </Link>
                        <Link to="/issues" className={`nav-link ${isActive('/issues') ? 'active' : ''}`}>
                            Issues
                        </Link>
                        <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>
                            Map
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                                Admin
                            </Link>
                        )}
                    </div>

                    <div className="navbar-actions">
                        {/* Theme Toggle */}
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            aria-label="Toggle theme"
                        />

                        {/* Desktop Auth */}
                        <div className="desktop-auth">
                            {isAuthenticated ? (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 14px',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            color: 'white'
                                        }}>
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                            {user?.name?.split(' ')[0] || 'User'}
                                        </span>
                                    </div>
                                    <button onClick={logout} className="btn btn-ghost btn-sm" title="Logout">
                                        <FiLogOut />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="nav-link">Sign In</Link>
                                    <Link to="/register" className="btn btn-primary btn-sm">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Mobile Menu Slide-out */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    {/* User Info */}
                    {isAuthenticated && (
                        <div className="mobile-user-info">
                            <div className="mobile-user-avatar">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="mobile-user-name">{user?.name || 'User'}</div>
                                <div className="mobile-user-email">{user?.email || ''}</div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <nav className="mobile-nav">
                        <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>
                            <FiHome /> Home
                        </Link>
                        <Link to="/issues" className={`mobile-nav-link ${isActive('/issues') ? 'active' : ''}`}>
                            <FiList /> Issues
                        </Link>
                        <Link to="/map" className={`mobile-nav-link ${isActive('/map') ? 'active' : ''}`}>
                            <FiMap /> Map
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}>
                                <FiShield /> Admin
                            </Link>
                        )}
                    </nav>

                    {/* Auth Actions */}
                    <div className="mobile-auth">
                        {isAuthenticated ? (
                            <button onClick={logout} className="mobile-logout-btn">
                                <FiLogOut /> Sign Out
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="mobile-auth-btn secondary">Sign In</Link>
                                <Link to="/register" className="mobile-auth-btn primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                /* Mobile Menu Button */
                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .mobile-menu-btn:hover {
                    background: var(--bg-elevated);
                }

                /* Desktop Auth */
                .desktop-auth {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Mobile Menu Overlay */
                .mobile-menu-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 998;
                }

                /* Mobile Menu */
                .mobile-menu {
                    display: none;
                    position: fixed;
                    top: 0;
                    right: -100%;
                    bottom: 0;
                    width: 280px;
                    max-width: 85vw;
                    background: var(--bg-sidebar);
                    z-index: 999;
                    transition: right 0.3s ease;
                    padding-top: var(--navbar-height);
                    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
                }
                .mobile-menu.open {
                    right: 0;
                }

                .mobile-menu-content {
                    padding: 20px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }

                .mobile-user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bg-elevated);
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .mobile-user-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: white;
                    font-size: 1.1rem;
                }

                .mobile-user-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .mobile-user-email {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .mobile-nav {
                    flex: 1;
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    color: var(--text-secondary);
                    text-decoration: none;
                    border-radius: 10px;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .mobile-nav-link:hover, .mobile-nav-link.active {
                    background: var(--bg-elevated);
                    color: var(--primary-light);
                }

                .mobile-auth {
                    margin-top: auto;
                    padding-top: 20px;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .mobile-auth-btn {
                    display: block;
                    text-align: center;
                    padding: 14px;
                    border-radius: 10px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .mobile-auth-btn.primary {
                    background: var(--primary);
                    color: white;
                }
                .mobile-auth-btn.secondary {
                    background: var(--bg-elevated);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .mobile-logout-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #EF4444;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mobile-logout-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                }

                /* Show mobile elements on smaller screens */
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: flex;
                    }
                    .desktop-auth {
                        display: none;
                    }
                    .mobile-menu-overlay {
                        display: block;
                    }
                    .mobile-menu {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;

