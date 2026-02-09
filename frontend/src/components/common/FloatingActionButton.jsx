import { Link, useLocation } from 'react-router-dom';
import { FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const FloatingActionButton = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Don't show on create issue page or admin pages
    if (location.pathname === '/report' || location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fab-container">
            <Link
                to={isAuthenticated ? "/report" : "/login"}
                className="fab-button"
                title="Report an Issue"
            >
                <FiCamera />
            </Link>
            <span className="fab-label">Report an Issue</span>
        </div>
    );
};

export default FloatingActionButton;
