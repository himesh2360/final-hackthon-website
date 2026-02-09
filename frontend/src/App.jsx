import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import FloatingActionButton from './components/common/FloatingActionButton';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Issues from './pages/Issues';
import IssueDetail from './pages/IssueDetail';
import CreateIssue from './pages/CreateIssue';
import MapView from './pages/MapView';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return isAdmin ? children : <Navigate to="/" />;
};

const AppContent = () => {
    const { loading } = useAuth();
    const location = useLocation();

    // Hide floating button on login/register pages
    const hideFloatingButton = ['/login', '/register'].includes(location.pathname);

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            {!hideFloatingButton && <FloatingActionButton />}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/issues" element={<Issues />} />
                <Route path="/issues/:id" element={<IssueDetail />} />
                <Route path="/map" element={<MapView />} />

                {/* Protected Routes (Authenticated Users) */}
                <Route path="/report" element={
                    <ProtectedRoute>
                        <CreateIssue />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
};

export default App;
