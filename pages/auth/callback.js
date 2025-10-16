import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { handleGoogleAuthCallback } = useAuth();
  const [status, setStatus] = useState('Processing Google authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        setStatus(`Error: ${error}`);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('No authorization code received');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        setStatus('Authenticating with Google...');
        await handleGoogleAuthCallback(code);
        setStatus('Success! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus(`Authentication failed: ${error.message}`);
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
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          {status}
        </p>
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
