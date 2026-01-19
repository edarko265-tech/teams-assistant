/**
 * Login Page Component
 * Modern authentication page with gradient branding
 */

import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

type AuthMode = 'signin' | 'signup';

function LoginPage() {
  const { signIn, signUp, isLoading, error, clearError } = useAppContext();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please enter email and password');
      return;
    }

    if (mode === 'signup' && !name) {
      setLocalError('Please enter your name');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setLocalError(null);
    clearError();
  };

  const displayError = localError || error;

  return (
    <div className="login-page">
      {/* Gradient background decoration */}
      <div className="login-bg-gradient"></div>
      <div className="login-bg-blur"></div>
      
      <div className="login-container animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon ai-gradient ai-glow">✨</div>
            <h1 className="ai-gradient-text">Teams Assistant</h1>
          </div>
          <p className="login-subtitle">
            {mode === 'signin' 
              ? 'Welcome back! Sign in to continue' 
              : 'Create an account to get started'}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group animate-slide-up">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group animate-slide-up" style={{ animationDelay: '50ms' }}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group animate-slide-up" style={{ animationDelay: '100ms' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {displayError && (
            <div className="login-error animate-scale-in">
              <span className="error-icon">⚠️</span>
              {displayError}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary login-btn ai-gradient hover-lift"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner animate-spin">⏳</span>
            ) : mode === 'signin' ? (
              '✨ Sign In'
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button 
                  type="button" 
                  className="link-btn ai-gradient-text" 
                  onClick={toggleMode}
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="link-btn ai-gradient-text" 
                  onClick={toggleMode}
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <div className="login-features glass-effect">
          <h3>✨ Features</h3>
          <ul>
            <li><span className="feature-icon">💬</span> Real-time team messaging</li>
            <li><span className="feature-icon">🤖</span> AI-powered assistant</li>
            <li><span className="feature-icon">📁</span> File sharing & context</li>
            <li><span className="feature-icon">👥</span> Channels & direct messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
