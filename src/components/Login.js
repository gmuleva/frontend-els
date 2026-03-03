import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} data-testid="login-form">
        {error && <div className="error-message" role="alert">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="email-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="password-input"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          data-testid="login-button"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
