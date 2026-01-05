import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { MdPerson, MdEmail, MdDateRange, MdStar } from 'react-icons/md';

const Profile = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container animate-fade-in">
            <h2 style={{ marginBottom: '2rem' }}>User Profile</h2>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'white',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{user.name}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Moneymate Premium Member</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <MdEmail style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }} />
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Email Address</p>
                            <p style={{ fontWeight: '600' }}>{user.email}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <MdDateRange style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }} />
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Joined On</p>
                            <p style={{ fontWeight: '600' }}>{new Date(user.date || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <MdStar style={{ color: '#f1c40f', fontSize: '1.5rem' }} />
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Current Streak</p>
                            <p style={{ fontWeight: '600' }}>{user.savingsStreak || 0} Days</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Account Security</h4>
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                        Change Password
                    </button>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Ensure your account stays secure by using a strong password.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
