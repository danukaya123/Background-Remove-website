import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    }
    
    setLoading(false);
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
            Reset Password
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: 0, lineHeight: "1.5" }}>
            Enter your email address and we'll send you instructions to reset your password.
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

        {message && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
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
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "16px",
                transition: "all 0.3s ease",
                background: "white",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Enter your email"
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
                Sending...
              </div>
            ) : (
              "Send Reset Instructions"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", color: "#64748b", fontSize: "14px" }}>
          <Link href="/login" style={{ color: "#3b82f6", fontWeight: "600", textDecoration: "none" }}>
            Back to Sign In
          </Link>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
