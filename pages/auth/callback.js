import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { handleGoogleAuthCallback } = useAuth();
  const [status, setStatus] = useState('Processing Google authentication...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Get the URL parameters from the current URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      console.log('Callback URL params:', { code, error }); // Debug log

      if (error) {
        setError(`Google OAuth Error: ${error}`);
        setStatus('Authentication failed');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received from Google');
        setStatus('Authentication failed');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        setStatus('Exchanging code for access token...');
        
        // Call the Google auth callback handler
        await handleGoogleAuthCallback(code);
        
        setStatus('Authentication successful! Redirecting...');
        
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect to home page
        setTimeout(() => router.push('/'), 1000);
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(`Authentication failed: ${error.message}`);
        setStatus('Error occurred');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router, handleGoogleAuthCallback]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          Q
        </div>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Google Authentication
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          {status}
        </p>
        {error && (
          <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '14px' }}>
            {error}
          </p>
        )}
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
}
