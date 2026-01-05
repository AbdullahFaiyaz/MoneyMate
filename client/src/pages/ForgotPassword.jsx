import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [devOTP, setDevOTP] = useState('');
    const [isSimulated, setIsSimulated] = useState(false);

    const { forgotPassword, verifyOTP, resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        setIsLoading(true);
        setError('');
        setMessage('');
        setDevOTP('');
        setIsSimulated(false);

        const res = await forgotPassword(trimmedEmail);
        if (res.success) {
            setMessage(res.message);
            if (res.simulated) {
                setIsSimulated(true);
                setDevOTP(res.devOTP);
            }
            setStep(2);
        } else {
            setError(res.error);
        }
        setIsLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const res = await verifyOTP(email.trim(), otp);
        if (res.success) {
            setStep(3);
            setMessage('OTP verified! Set your new password.');
        } else {
            setError(res.error);
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setIsLoading(true);
        setError('');

        const res = await resetPassword(email.trim(), otp, password);
        if (res.success) {
            alert('Password reset successful! Logging you in...');
            navigate('/');
        } else {
            setError(res.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="card auth-card animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>
                        {step === 1 && "Reset Password"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "New Password"}
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}>
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                style={{
                                    width: '30px',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: s <= step ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
                {message && <div style={{ color: '#2ecc71', marginBottom: '1.5rem', textAlign: 'center' }}>{message}</div>}

                {isSimulated && (
                    <div style={{
                        background: 'rgba(243, 156, 18, 0.1)',
                        border: '1px solid #f39c12',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: '#f39c12', margin: 0, fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>⚠️ Developer Simulation Mode</p>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Email service failed. Use this OTP to proceed:</p>
                        <div style={{ fontSize: '2rem', fontWeight: '900', color: 'white', letterSpacing: '8px', margin: '1.5rem 0' }}>{devOTP}</div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>This is only visible in development mode.</p>
                    </div>
                )}



                {step === 1 && (
                    <form onSubmit={handleSendOTP}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label>Enter 6-Digit OTP</label>
                            <input
                                type="text"
                                placeholder="000000"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                disabled={isLoading}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '10px',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>
                        <button type="submit" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            Back to Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Update Password'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/login" style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
