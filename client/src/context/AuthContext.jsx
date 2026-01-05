import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    useEffect(() => {
        const checkUser = async () => {
            if (token) {
                try {
                    const userData = await authService.getMe();
                    setUser(userData);
                } catch (err) {
                    console.error(err);
                    logout();
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const data = await authService.login({ email, password });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await authService.register({ name, email, password });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const forgotPassword = async (email) => {
        setError(null);
        try {
            const res = await authService.forgotPassword(email);
            return {
                success: true,
                message: res.message,
                simulated: res.simulated,
                devOTP: res.devOTP
            };
        } catch (err) {
            const message = err.response?.data?.message || 'Request failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const verifyOTP = async (email, otp) => {
        setError(null);
        try {
            await authService.verifyOTP(email, otp);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'OTP verification failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const resetPassword = async (email, otp, password) => {
        setError(null);
        try {
            const data = await authService.resetPassword(email, otp, password);
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Reset failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, forgotPassword, verifyOTP, resetPassword, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
