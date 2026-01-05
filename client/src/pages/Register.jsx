import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(name, email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2 style={{ textAlign: 'center' }}>Register</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit} autoComplete="off">
                    {/* Robust hack to disable chrome autofill */}
                    <input
                        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
                        type="text"
                        name="fakeusernameremembered"
                        tabIndex={-1}
                    />
                    <input
                        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
                        type="password"
                        name="fakepasswordremembered"
                        tabIndex={-1}
                    />

                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            id="register-name"
                            name="user_name_new"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="off"
                            readOnly
                            onFocus={(e) => e.target.readOnly = false}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            id="register-email"
                            name="user_email_new"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            readOnly
                            onFocus={(e) => e.target.readOnly = false}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="At least 6 characters"
                            id="register-password"
                            name="user_password_new"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                            autoComplete="new-password"
                            readOnly
                            onFocus={(e) => e.target.readOnly = false}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{ width: '100%' }}
                    >
                        Register
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
