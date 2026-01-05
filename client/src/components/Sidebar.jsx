import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import {
    MdDashboard,
    MdSwapHoriz,
    MdGppGood,
    MdPerson,
    MdLogout,
    MdAccountBalanceWallet,
    MdDarkMode,
    MdLightMode,
    MdReceipt,
    MdTrendingUp,
    MdExitToApp,
    MdAccountBalance
} from 'react-icons/md';

import NotificationCenter from './NotificationCenter';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            {/* ... other code ... */}
            <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
                <h1 className="sidebar-logo" style={{ margin: 0, fontSize: '1.75rem' }}>
                    <MdDashboard style={{ color: 'var(--primary-color)' }} />
                    <span>MoneyMate</span>
                </h1>
            </div>
            {/* We'll place notification center in the header area actually, but since we only have sidebar, let's put it at the bottom or top?
               Ideally top right of a main layout, but Sidebar seems to be the main container.
               Let's put it next to Theme Toggle at the bottom for now or in the nav links?
               Actually, a better place is near the user profile or logout.
            */}

            <nav style={{ flex: 1, padding: '2rem 1rem' }}>
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <MdDashboard /> Dashboard
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <MdReceipt /> Transactions
                </NavLink>
                <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <MdTrendingUp /> Goals & Budget
                </NavLink>
                <NavLink to="/debts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <MdAccountBalance /> Debts & Loans
                </NavLink>
            </nav>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationCenter />
                    <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
                        {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
                    </button>
                </div>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <MdExitToApp /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
