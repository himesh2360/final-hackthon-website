import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const response = await authAPI.getMe();
                setUser(response.data.user);
            } catch (error) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);

        return user;
    };

    const register = async (name, email, password) => {
        const response = await authAPI.register({ name, email, password });
        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);

        return user;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Ignore logout errors
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isSuperAdmin = user?.role === 'superadmin';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            isAdmin,
            isSuperAdmin,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
