import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { login, getCurrentUser } from '../../services/authService';
import './LoginForm.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    history.push('/browse');
                }
            } catch (err) {
                console.error('Auth check error:', err.message);
                // Continue showing login form if auth check fails
            }
        };
        
        checkAuth();
    }, [history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            console.log('Login successful:', user);
            history.push('/browse');
        } catch (err) {
            console.error('Login error:', err.message);
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <div className="login-header">
                    <h1 className="login-title">ReportRack</h1>
                    <p className="login-subtitle">Access your Power BI dashboards</p>
                </div>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message" role="alert">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn primary-btn login-button"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                
                <div className="login-footer">
                    <div className="login-options">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-link">
                                Create Account
                            </Link>
                        </p>
                    </div>
                    <div className="secondary-actions">
                        <Link to="/browse" className="btn secondary-btn browse-button">
                            Browse Dashboards
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;