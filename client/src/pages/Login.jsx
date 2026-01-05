import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2 style={{ textAlign: 'center' }}>Login</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', opacity: 0.8 }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    {error && error.includes('password') && (
                        <div style={{
                            background: 'rgba(231, 76, 60, 0.1)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(231, 76, 60, 0.2)',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            <p style={{ margin: 0, color: 'var(--danger)' }}>
                                Wrong password? <Link to="/forgot-password" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Click here to recover it</Link>
                            </p>
                        </div>
                    )}
                    <button
                        type="submit"
                        style={{ width: '100%' }}
                    >
                        Login
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
