import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    birthday: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email'); // 'email', 'social'
  
  const { signup, signInWithSocial, currentUser } = useAuth();
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

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      await signup(formData.email, formData.password, {
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        birthday: formData.birthday
      });

      setSuccess('Account created successfully! Please check your email for verification.');
      
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      setError('Failed to create account: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleSocialSignup = async (provider) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await signInWithSocial(provider);
    } catch (error) {
      setError(`Failed to sign up with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const socialProviders = [
    { name: 'google', label: 'Google', color: '#4285F4', icon: 'G' },
    { name: 'github', label: 'GitHub', color: '#333', icon: 'G' },
  ];

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
          maxWidth: "480px",
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
            Create Account
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: 0 }}>
            Join thousands of users transforming their images
          </p>
        </div>

        {/* Auth Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
          {['social', 'email'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`,
                color: activeTab === tab ? '#3b82f6' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {tab === 'social' && 'Social'}
              {tab === 'email' && 'Email'}
            </button>
          ))}
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

        {/* Social Signup */}
        {activeTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleSocialSignup(provider.name)}
                disabled={loading}
                style={{
                  width: "100%",
                  background: "white",
                  border: `1px solid ${provider.color}20`,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: provider.color,
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = `${provider.color}10`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = "white";
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", border: "2px solid transparent", borderTop: `2px solid ${provider.color}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    Signing up...
                  </div>
                ) : (
                  <>
                    <span style={{ 
                      width: '20px', 
                      height: '20px', 
                      background: provider.color, 
                      color: 'white', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {provider.icon}
                    </span>
                    Continue with {provider.label}
                  </>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Email Signup */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSignup} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
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
                placeholder="Choose a username"
              />
            </div>

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
                placeholder="Enter your email"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label
                  htmlFor="phoneNumber"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
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
                  placeholder="Phone"
                />
              </div>

              <div>
                <label
                  htmlFor="birthday"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Birthday
                </label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
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
                />
              </div>
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
                placeholder="Create a password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
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
                placeholder="Confirm your password"
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
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", border: "2px solid transparent", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem", color: "#64748b", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#3b82f6", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
