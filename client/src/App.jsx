import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthContext from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import GoalsBudget from './pages/GoalsBudget';
import Debts from './pages/Debts';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

import { CurrencyProvider } from './context/CurrencyContext';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CurrencyProvider>
                    <ThemeProvider>
                        <div className="app-container">
                            <div className="glow-wrapper">
                                <div className="glow-orb orb-1"></div>
                                <div className="glow-orb orb-2"></div>
                                <div className="glow-orb orb-3"></div>
                            </div>
                            <Routes>
                                <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
                                <Route path="/goals" element={<PrivateRoute><Layout><GoalsBudget /></Layout></PrivateRoute>} />
                                <Route path="/debts" element={<PrivateRoute><Layout><Debts /></Layout></PrivateRoute>} />
                                <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
                            </Routes>
                        </div>
                    </ThemeProvider>
                </CurrencyProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
