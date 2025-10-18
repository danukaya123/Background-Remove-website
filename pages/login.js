import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Head from 'next/head';

export default function Login() {
      const pageMeta = {
    title: 'Login - Quizontal AI Background Remover',
    description: 'Login to Quizontal AI Background Remover to access all features. Easy Login using Google, Github or Email & Password.',
    image: 'https://rbg.quizontal.cc/og-image.jpg',
    url: 'https://rbg.quizontal.cc/login'
  };
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { login, signInWithSocial, forgotPassword, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await login(formData.email, formData.password);
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await signInWithSocial(provider);
    } catch (error) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await forgotPassword(forgotPasswordEmail);
      setSuccess('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error) {
      setError('Failed to send reset email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const socialProviders = [
    { 
      name: 'google', 
      label: 'Google', 
      color: '#4285F4', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ) 
    },
    { 
      name: 'github', 
      label: 'GitHub', 
      color: '#333', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ) 
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >

      <Head>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
        <meta property="og:title" content={pageMeta.title} />
        <meta property="og:description" content={pageMeta.description} />
        <meta property="og:image" content={pageMeta.image} />
        <meta property="og:url" content={pageMeta.url} />
        <meta name="twitter:title" content={pageMeta.title} />
        <meta name="twitter:description" content={pageMeta.description} />
        <meta name="twitter:image" content={pageMeta.image} />

        <meta 
    name="viewport" 
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
  />
      </Head>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .responsive-container {
            padding: 1.5rem !important;
            margin: 0.5rem !important;
          }
          
          .responsive-text {
            font-size: 14px !important;
          }
          
          .responsive-heading {
            font-size: 24px !important;
          }
        }

        @media (max-width: 768px) {
          .responsive-container {
            max-width: 90vw !important;
          }
        }
      `}</style>

      <div
        className="responsive-container"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "white",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          borderRadius: "24px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          border: "1px solid #f1f5f9",
          margin: "1rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "1rem" }}>
            <div
              style={{
                width: "clamp(40px, 8vw, 48px)",
                height: "clamp(40px, 8vw, 48px)",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "clamp(16px, 3vw, 20px)",
                color: "white",
              }}
            >
              Q
            </div>
          </div>
          <h1
            className="responsive-heading"
            style={{
              fontWeight: "800",
              color: "#1e293b",
              margin: "0 0 0.5rem 0",
              background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Welcome Back
          </h1>
          <p className="responsive-text" style={{ color: "#64748b", margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Social Login Section */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleSocialLogin(provider.name)}
                disabled={loading}
                style={{
                  width: "100%",
                  background: "white",
                  border: `1px solid ${provider.color}20`,
                  padding: "clamp(12px, 2vw, 14px) clamp(16px, 3vw, 20px)",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "clamp(14px, 2vw, 16px)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  color: provider.color,
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = `${provider.color}08`;
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = "white";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", border: "2px solid transparent", borderTop: `2px solid ${provider.color}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    Signing in...
                  </div>
                ) : (
                  <>
                    <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {provider.icon}
                    </span>
                    Continue with {provider.label}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ position: "relative", textAlign: "center", margin: "2rem 0" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "#e2e8f0" }}></div>
          <span style={{ background: "white", padding: "0 1rem", color: "#64748b", fontSize: "14px", position: "relative" }}>
            Or sign in with email
          </span>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'white',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            }}>
              <h3 style={{ 
                marginBottom: '1rem',
                fontWeight: '800',
                color: '#1e293b',
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Reset Password
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '14px' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 16px)",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  marginBottom: '1.5rem',
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: loading ? "#9ca3af" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "white",
                    border: "none",
                    padding: "clamp(12px, 2vw, 14px)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: loading ? "none" : "0 4px 15px rgba(59, 130, 246, 0.3)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  style={{
                    background: "none",
                    border: "2px solid #e2e8f0",
                    color: "#64748b",
                    padding: "clamp(12px, 2vw, 14px)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.background = "white";
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 16px)",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "16px",
                transition: "all 0.3s ease",
                background: "white",
                opacity: loading ? 0.7 : 1,
                boxSizing: "border-box",
              }}
              placeholder="Enter your email"
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 16px)",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "16px",
                transition: "all 0.3s ease",
                background: "white",
                opacity: loading ? 0.7 : 1,
                boxSizing: "border-box",
              }}
              placeholder="Enter your password"
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              fontSize: "14px",
              fontWeight: "600",
              textAlign: "left",
              cursor: "pointer",
              padding: 0,
              alignSelf: "flex-start",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#3b82f6";
            }}
          >
            Forgot your password?
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading 
                ? "#9ca3af" 
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white",
              border: "none",
              padding: "clamp(14px, 2vw, 16px)",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: loading ? "none" : "0 4px 15px rgba(59, 130, 246, 0.3)",
              marginTop: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
              }
            }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid transparent", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", color: "#64748b", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "#3b82f6", fontWeight: "600", textDecoration: "none" }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
