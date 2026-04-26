import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, "");

/**
 * PrivateRoute — wraps protected routes.
 * First checks for token in localStorage (instant).
 * Then verifies with backend (background, non-blocking).
 * Redirects to /admin (login page) only if NO token in localStorage.
 */
export default function PrivateRoute({ children }) {
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    const verifyAuth = async () => {
      // First check: Do we have a token in localStorage?
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        // No token at all - user is not authenticated
        console.log('No token in localStorage - redirecting to login');
        setAuthState('unauthenticated');
        return;
      }

      // We have a token in localStorage - optimistically authenticate
      console.log('Token found in localStorage - user authenticated');
      setAuthState('authenticated');

      // Second check: Verify token with backend (background, non-blocking)
      // This doesn't block the UI - we stay authenticated even if backend check fails
      const verifyWithBackend = async () => {
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
            // Backend explicitly rejected the token
            console.log('Backend rejected token - logging out');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('user_info');
            setAuthState('unauthenticated');
          } else {
            console.log('Backend verified token - staying authenticated');
          }
        } catch (error) {
          // Network error verifying with backend
          // User stays authenticated with localStorage token
          console.warn('Could not verify with backend (network error):', error.message);
          console.log('User staying authenticated with localStorage token');
        }
      };

      // Run backend verification in background (don't await, don't block)
      verifyWithBackend();
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
