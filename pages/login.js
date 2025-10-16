import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signInWithGoogle, currentUser, user } = useAuth();
  const router = useRouter();

  // Use either currentUser or user for compatibility
  const authenticatedUser = currentUser || user;

  useEffect(() => {
    if (authenticatedUser) {
      router.push('/');
    }
  }, [authenticatedUser, router]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(formData.email, formData.password);
      router.push('/');
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    }
    
    setLoading(false);
  };

const handleGoogleLogin = async () => {
  try {
    setError('');
    setLoading(true);
    await signInWithGoogle();
    // No need to redirect - auth state change will handle it automatically
  } catch (error) {
    setError('Failed to sign in with Google. Please try again.');
    console.error('Google login error:', error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "white",
          padding: "clamp(2rem, 4vw, 3rem)",
          borderRadius: "24px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          border: "1px solid #f1f5f9",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "20px",
                color: "white",
              }}
            >
              Q
            </div>
          </div>
          <h1
            style={{
              fontSize: "28px",
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
          <p style={{ color: "#64748b", fontSize: "16px", margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

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

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            background: "white",
            border: "1px solid #d1d5db",
            padding: "12px 16px",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#374151",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = "#f8fafc";
              e.target.style.borderColor = "#9ca3af";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.background = "white";
              e.target.style.borderColor = "#d1d5db";
            }
          }}
        >
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{ width: "16px", height: "16px", border: "2px solid transparent", borderTop: "2px solid #374151", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              Signing in...
            </div>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div style={{ position: "relative", textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ height: "1px", background: "#e2e8f0", width: "100%" }}></div>
          <span style={{ background: "white", padding: "0 1rem", color: "#64748b", fontSize: "14px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
              Email Address
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
                padding: "14px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "16px",
                transition: "all 0.3s ease",
                background: "white",
                opacity: loading ? 0.7 : 1,
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Enter your email"
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
              Password
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
                padding: "14px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "16px",
                transition: "all 0.3s ease",
                background: "white",
                opacity: loading ? 0.7 : 1,
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading 
                ? "#9ca3af" 
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white",
              border: "none",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
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
