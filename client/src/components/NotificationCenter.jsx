import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdNotifications } from 'react-icons/md';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data.data);
            setUnreadCount(res.data.data.filter(n => !n.read).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    return (
        <div style={{ position: 'relative', marginRight: '1rem' }}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    position: 'relative',
                    padding: '0.5rem'
                }}
            >
                <MdNotifications />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: 'var(--danger)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '0',
                    width: '300px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Notifications</strong>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}>
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    onClick={() => !notif.read && markAsRead(notif._id)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: notif.read ? 'default' : 'pointer',
                                        background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                                        opacity: notif.read ? 0.6 : 1
                                    }}
                                >
                                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                        {notif.message}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
