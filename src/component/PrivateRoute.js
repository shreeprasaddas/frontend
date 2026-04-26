import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, "");

/**
 * PrivateRoute — wraps protected routes.
 * First checks for token in localStorage (instant).
 * Then verifies with backend (background).
 * Redirects to /admin (login page) only if truly unauthenticated.
 */
export default function PrivateRoute({ children }) {
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    const verifyAuth = async () => {
      // First check: Do we have a token in localStorage?
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setAuthState('unauthenticated');
        return;
      }

      // We have a token, optimistically set as authenticated
      // (user will be logged out if backend rejects)
      setAuthState('authenticated');

      // Second check: Verify token with backend (non-blocking)
      try {
        const response = await fetch(`${API_URL}/login/verify`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (!response.ok || !data.validUser) {
          // Backend rejected token, logout
          localStorage.removeItem('admin_token');
          localStorage.removeItem('user_info');
          setAuthState('unauthenticated');
        }
        // If valid, stay authenticated (already set above)
      } catch (error) {
        console.warn('Token verification error (non-blocking):', error.message);
        // Network error - don't logout, let user proceed
        // They'll be logged out on next failed request
      }
    };

    verifyAuth();
  }, []);

  if (authState === 'loading') {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.text}>Verifying access...</p>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

const styles = {
  loading: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
    gap: '1rem',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
  },
};
