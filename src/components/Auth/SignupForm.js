import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { signUp } from '../../services/authService';
import './LoginForm.css'; // Reuse login styles

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        // Validate password strength
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);

        try {
            const data = await signUp(email, password);
            console.log('Signup response:', data);
            
            if (data.user && !data.session) {
                // Email confirmation required
                setMessage('Please check your email to confirm your account before logging in.');
            } else {
                // Auto logged in
                history.push('/browse');
            }
        } catch (err) {
            console.error('Signup error:', err.message);
            setError('Sign up failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h1 className="login-title">ReportRack</h1>
                <p className="login-subtitle">Create your account</p>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <div className="login-options">
                    <p>Already have an account? <Link to="/" className="signin-link">Sign In</Link></p>
                    <Link to="/browse" className="browse-link">Browse Dashboards</Link>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;