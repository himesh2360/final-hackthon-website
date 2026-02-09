import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '80px 16px 40px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto'
            }}>
                <div className="card animate-fade-in-up">
                    <div className="card-body" style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <Link to="/" style={{ display: 'inline-block', marginBottom: '20px' }}>
                                <img
                                    src="/logo.png"
                                    alt="Civic Engine"
                                    style={{ height: 'clamp(48px, 10vw, 60px)' }}
                                />
                            </Link>
                            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', marginBottom: '8px' }}>Create Account</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
                                Join our community and report civic issues
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{ paddingLeft: '48px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ paddingLeft: '48px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ paddingLeft: '48px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        style={{ paddingLeft: '48px' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%', marginTop: '8px' }}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                                <FiArrowRight />
                            </button>
                        </form>

                        <p style={{
                            textAlign: 'center',
                            marginTop: '24px',
                            color: 'var(--text-secondary)'
                        }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: 'var(--primary-light)',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
