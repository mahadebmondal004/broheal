import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionRole = sessionStorage.getItem('sessionRole') || 'user';
        const profileStr = localStorage.getItem(`${sessionRole}_profile`);
        const token = localStorage.getItem(`${sessionRole}_accessToken`) || localStorage.getItem('accessToken');

        if (profileStr && token) {
            setUser(JSON.parse(profileStr));
        }
        setLoading(false);
    }, []);

    const login = (userData, accessToken, refreshToken) => {
        const role = userData?.role || 'user';
        sessionStorage.setItem('sessionRole', role);
        localStorage.setItem(`${role}_profile`, JSON.stringify(userData));
        localStorage.setItem(`${role}_accessToken`, accessToken);
        localStorage.setItem(`${role}_refreshToken`, refreshToken);
        // Clear legacy generic tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(userData);
    };

    const logout = () => {
        const role = sessionStorage.getItem('sessionRole') || 'user';
        localStorage.removeItem(`${role}_accessToken`);
        localStorage.removeItem(`${role}_refreshToken`);
        localStorage.removeItem(`${role}_profile`);
        // Clear legacy generic tokens just in case
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const updateUser = (userData) => {
        const role = sessionStorage.getItem('sessionRole') || userData?.role || 'user';
        localStorage.setItem(`${role}_profile`, JSON.stringify(userData));
        setUser(userData);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isUser: user?.role === 'user',
        isTherapist: user?.role === 'therapist',
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
