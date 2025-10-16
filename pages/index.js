import { useState, useRef, useEffect } from "react";
import { Client } from "@gradio/client";
import ImageEditor from './ImageEditor';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  
  const fileInputRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const router = useRouter();
  const { currentUser, userProfile, logout } = useAuth();

  // Auto-scroll to results when processing is complete
  useEffect(() => {
    if (resultUrl && !loading) {
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [resultUrl, loading]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleDownloadEdited = (editedImageUrl) => {
    try {
      const a = document.createElement("a");
      a.href = editedImageUrl;
      a.download = `edited-background-removed-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Download failed. Please try again.");
    }
  };

  // Typewriter phrases for subheading
  const typewriterPhrases = [
    "AI-Powered & Instant Processing.!",
    "100% Free & No Watermarks.!", 
    "Professional Quality Results.!",
    "Perfect for E-commerce.!",
    "No Manual Editing Required.!",
    "Works with Any Image Format.!",
    "Crisp Clean Edges Every Time.!",
    "Secure & Private Processing.!"
  ];

  // Typewriter effect for subheading
  useEffect(() => {
    const currentPhrase = typewriterPhrases[currentPhraseIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing phase
        if (currentIndex < currentPhrase.length) {
          setDisplayedText(currentPhrase.substring(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else {
          // Wait before starting to delete
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting phase
        if (currentIndex > 0) {
          setDisplayedText(currentPhrase.substring(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((currentPhraseIndex + 1) % typewriterPhrases.length);
        }
      }
    }, isDeleting ? 40 : 60);

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, currentPhraseIndex]);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploaded = e.dataTransfer.files[0];
      if (uploaded.type.startsWith('image/')) {
        setFile(uploaded);
        setResultUrl(null);
        setError(null);
      }
    }
  };

  // File selection handler
  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setResultUrl(null);
      setError(null);
    }
  };

  // Background removal function
  const handleRemoveBackground = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("Jonny001/Background-Remover-C1");
      console.log("✅ Connected to HF Space");

      const result = await client.predict("/image", { image: file });

      let processedObj = null;
      if (Array.isArray(result.data) && Array.isArray(result.data[0])) {
        const outputs = result.data[0];
        processedObj = outputs[1];
      } else if (Array.isArray(result.data)) {
        processedObj = result.data[1] || result.data[0];
      }

      if (!processedObj?.url)
        throw new Error("No processed image URL found in response.");

      setResultUrl(processedObj.url);
    } catch (err) {
      console.error("❌ Error during background removal:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Download function
  const downloadImage = async () => {
    if (!resultUrl) return;
    
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `background-removed-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Download failed. Please try again.");
    }
  };

  // Reset function
  const resetAll = () => {
    setFile(null);
    setResultUrl(null);
    setError(null);
    setEditingMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        color: "#1e293b",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "0",
        margin: "0",
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes neuralOrbit {
          0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        
        @keyframes neuralOrbitReverse {
          0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(30px) rotate(360deg); }
        }
        
        @keyframes aiCorePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          50% { transform: translate(20px, -20px) scale(1.5); opacity: 1; }
        }
        
        @keyframes textGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slide-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
        
        .hero-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        
        @media (max-width: 968px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          
          .hero-text {
            order: 1;
          }
          
          .hero-image {
            order: 2;
          }
        }
        
        .feature-points {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .cta-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        @media (max-width: 480px) {
          .cta-buttons {
            flex-direction: column;
          }
          
          .cta-buttons button {
            width: 100%;
          }
        }
        
        .floating-badge {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav
        style={{
          borderBottom: "1px solid #e2e8f0",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "16px",
                color: "white",
              }}
            >
              Q
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#1e293b",
                letterSpacing: "-0.5px",
              }}
            >
              Quizontal<span style={{ color: "#3b82f6" }}>RBG</span>
            </span>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="desktop-only" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {['Uploads', 'Bulk Editing', 'API', 'Integrations', 'Pricing'].map((item) => (
              <a 
                key={item}
                href="#" 
                style={{ 
                  color: "#64748b", 
                  textDecoration: "none", 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  transition: "all 0.3s",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#3b82f6";
                  e.currentTarget.style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item}
              </a>
            ))}
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginLeft: "0.5rem" }}>
              {currentUser ? (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* User Profile Dropdown */}
                  <div style={{ position: "relative" }}>
                    <button
                      style={{
                        background: "transparent",
                        border: "1px solid #d1d5db",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        color: "#374151",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.borderColor = "#9ca3af";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        {userProfile?.username?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {userProfile?.username || currentUser?.email || "User"}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "0.75rem",
                          marginTop: "0.5rem",
                          minWidth: "200px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          zIndex: 1000,
                        }}
                      >
                        <div style={{ padding: "0.5rem 0.75rem", color: "#64748b", fontSize: "14px", borderBottom: "1px solid #f1f5f9" }}>
                          Signed in as<br />
                          <strong style={{ color: "#1e293b" }}>{currentUser?.email || "User"}</strong>
                        </div>
                        {userProfile && (
                          <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>Username:</div>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{userProfile.username}</div>
                            {userProfile.phoneNumber && (
                              <>
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Phone:</div>
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{userProfile.phoneNumber}</div>
                              </>
                            )}
                          </div>
                        )}
                        <button
                          onClick={handleLogout}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            padding: "0.75rem",
                            textAlign: "left",
                            color: "#dc2626",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            borderRadius: "6px",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    style={{
                      background: "transparent",
                      border: "1px solid #d1d5db",
                      padding: "6px 16px",
                      borderRadius: "6px",
                      color: "#374151",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#9ca3af";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      border: "none",
                      padding: "6px 16px",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      boxShadow: "0 2px 10px rgba(59, 130, 246, 0.3)",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 10px rgba(59, 130, 246, 0.3)";
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="mobile-only">
            <button
              className="menu-toggle"
              onClick={toggleMobileMenu}
              style={{
                background: "transparent",
                border: "none",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ 
                width: "24px", 
                height: "2px", 
                background: "#1e293b",
                transition: "all 0.3s",
                transform: mobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
              }}></span>
              <span style={{ 
                width: "24px", 
                height: "2px", 
                background: "#1e293b",
                transition: "all 0.3s",
                opacity: mobileMenuOpen ? "0" : "1"
              }}></span>
              <span style={{ 
                width: "24px", 
                height: "2px", 
                background: "#1e293b",
                transition: "all 0.3s",
                transform: mobileMenuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none"
              }}></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            className="mobile-menu"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(10px)",
              borderTop: "1px solid #e2e8f0",
              padding: "1rem 2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              zIndex: 1000,
            }}
          >
            {['Uploads', 'Bulk Editing', 'API', 'Integrations', 'Pricing'].map((item) => (
              <a 
                key={item}
                href="#" 
                style={{ 
                  color: "#64748b", 
                  textDecoration: "none", 
                  fontSize: "16px", 
                  fontWeight: "500", 
                  padding: "10px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              {currentUser ? (
                <>
                  <div style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", width: "100%" }}>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Signed in as</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{currentUser.email}</div>
                    {userProfile && (
                      <>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Username: {userProfile.username}</div>
                        {userProfile.phoneNumber && (
                          <div style={{ fontSize: "12px", color: "#64748b" }}>Phone: {userProfile.phoneNumber}</div>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "transparent",
                      border: "1px solid #d1d5db",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      color: "#374151",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      router.push('/login');
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      background: "transparent",
                      border: "1px solid #d1d5db",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      color: "#374151",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      router.push('/signup');
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: "6rem 1rem",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "400px",
            height: "400px",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "300px",
            height: "300px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />
        
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
          className="hero-container"
        >
          {/* Left Content - Text */}
          <div className="hero-text">
            <h1
              style={{
                fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                fontWeight: "800",
                lineHeight: "1.1",
                marginBottom: "0.5rem",
                background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-1px",
              }}
            >
              Quizontal Image
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Background Removal
              </span>
            </h1>
            
            <p
              style={{
                fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                color: "#64748b",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              100% Automatically and Free
            </p>
            
            <p
              style={{
                fontSize: "clamp(1rem, 1.5vw, 1.1rem)",
                color: "#64748b",
                marginBottom: "2.5rem",
                lineHeight: "1.7",
                maxWidth: "500px",
              }}
            >
              Transform your images with AI-powered background removal. 
              Perfect for product photos, portraits, and creative projects. 
              No manual work, no credit card required.
            </p>

            {/* Feature Points */}
            <div style={{ marginBottom: "2.5rem" }} className="feature-points">
              {[
                { icon: "✓", text: "AI-powered instant processing" },
                { icon: "✓", text: "Preserves original image quality" },
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <span
                    style={{
                      color: "#475569",
                      fontSize: "1rem",
                      fontWeight: "500",
                    }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="cta-buttons">
              <button
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  border: "none",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                }}
                onClick={() => {
                  if (currentUser) {
                    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    router.push('/login');
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {currentUser ? "Try It Now" : "Get Started"}
              </button>
              
              <button
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #d1d5db",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#9ca3af";
                  e.currentTarget.style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.color = "#64748b";
                }}
                onClick={() => {
                  document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Examples
              </button>
            </div>
          </div>

          {/* Right Content - Image */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              flexDirection: "column",
              gap: "2rem",
            }}
            className="hero-image"
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "500px",
              }}
            >
              {/* Main Image Container */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                  position: "relative",
                  zIndex: 6,
                  transform: "rotate(2deg)",
                }}
              >
                <img
                  src="https://github.com/danukaya123/bgtest/blob/main/bgremove-banner.PNG?raw=true"
                  alt="Before and after background removal example"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                />
              </div>
              
              {/* Floating Element 1 */}
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
                  zIndex: 7,
                  animation: "bounce-subtle 3s ease-in-out infinite",
                }}
                className="floating-badge"
              >
                ✨ AI Powered
              </div>
              
              {/* Floating Element 2 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-15px",
                  left: "-15px",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.3)",
                  zIndex: 7,
                  animation: "bounce-subtle 3s ease-in-out infinite 1.5s",
                }}
                className="floating-badge"
              >
                ⚡ Instant Results
              </div>
            </div>
            
            {/* Stats Bar */}
            <div
              style={{
                display: "flex",
                gap: "2rem",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "1rem",
              }}
            >
              {[
                { number: "50K+", label: "Images Processed" },
                { number: "99.9%", label: "Accuracy" },
                { number: "2s", label: "Avg. Processing" },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    minWidth: "100px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "800",
                      color: "#1e293b",
                      marginBottom: "4px",
                    }}
                  >
                    {stat.number}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      {currentUser && (
        <section
          id="upload-section"
          style={{
            padding: "4rem 1rem",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              background: "white",
              borderRadius: "20px",
              padding: "3rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                textAlign: "center",
                marginBottom: "0.5rem",
                color: "#1e293b",
              }}
            >
              Remove Background
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#64748b",
                marginBottom: "2.5rem",
                fontSize: "1.1rem",
              }}
            >
              Upload an image to automatically remove its background
            </p>

            {/* Upload Area */}
            <div
              style={{
                border: dragActive ? "2px dashed #3b82f6" : "2px dashed #d1d5db",
                borderRadius: "16px",
                padding: "3rem 2rem",
                textAlign: "center",
                background: dragActive ? "#f0f9ff" : "#fafafa",
                transition: "all 0.3s ease",
                marginBottom: "2rem",
                cursor: "pointer",
                position: "relative",
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  transition: "all 0.3s ease",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: "0.5rem",
                }}
              >
                {file ? file.name : "Drop your image here"}
              </h3>
              
              <p
                style={{
                  color: "#64748b",
                  marginBottom: "1rem",
                }}
              >
                {file
                  ? "Click to change or drop another image"
                  : "or click to browse files"}
              </p>
              
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#94a3b8",
                }}
              >
                Supports: JPG, PNG, WEBP (Max 10MB)
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleRemoveBackground}
                disabled={!file || loading}
                style={{
                  background: loading 
                    ? "#9ca3af" 
                    : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "160px",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid transparent",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    Remove Background
                  </>
                )}
              </button>

              {file && (
                <button
                  onClick={resetAll}
                  disabled={loading}
                  style={{
                    background: "transparent",
                    color: "#64748b",
                    border: "1px solid #d1d5db",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#9ca3af";
                      e.currentTarget.style.color = "#374151";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginTop: "1.5rem",
                  textAlign: "center",
                }}
              >
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Results Section */}
      {(resultUrl || editingMode) && (
        <section
          ref={resultsSectionRef}
          style={{
            padding: "4rem 1rem",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                textAlign: "center",
                marginBottom: "3rem",
                color: "#1e293b",
              }}
            >
              {editingMode ? "Edit Your Image" : "Background Removed Successfully!"}
            </h2>

            {editingMode ? (
              <ImageEditor
                imageUrl={resultUrl}
                onSave={handleDownloadEdited}
                onCancel={() => setEditingMode(false)}
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "3rem",
                  alignItems: "start",
                }}
              >
                {/* Original Image */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#64748b",
                      marginBottom: "1rem",
                    }}
                  >
                    Original Image
                  </h3>
                  <div
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "1.5rem",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Original"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>

                {/* Processed Image */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#64748b",
                      marginBottom: "1rem",
                    }}
                  >
                    Background Removed
                  </h3>
                  <div
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "1.5rem",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      position: "relative",
                    }}
                  >
                    <img
                      src={resultUrl}
                      alt="Background removed"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                    
                    {/* Success Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "50px",
                        fontSize: "12px",
                        fontWeight: "600",
                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      ✓ Success
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!editingMode && (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  marginTop: "3rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={downloadImage}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download Image
                </button>

                <button
                  onClick={() => setEditingMode(true)}
                  style={{
                    background: "transparent",
                    color: "#3b82f6",
                    border: "1px solid #3b82f6",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#3b82f6";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Image
                </button>

                <button
                  onClick={resetAll}
                  style={{
                    background: "transparent",
                    color: "#64748b",
                    border: "1px solid #d1d5db",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#9ca3af";
                    e.currentTarget.style.color = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  Process New Image
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Examples Section */}
      <section
        id="examples"
        style={{
          padding: "6rem 1rem",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              textAlign: "center",
              marginBottom: "1rem",
              color: "#1e293b",
            }}
          >
            See It In Action
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#64748b",
              textAlign: "center",
              marginBottom: "4rem",
              maxWidth: "600px",
              margin: "0 auto 4rem",
            }}
          >
            Discover how our AI transforms images with perfect background removal
          </p>

          {/* Example Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                before: "https://github.com/danukaya123/bgtest/blob/main/bgremove-banner.PNG?raw=true",
                after: "https://github.com/danukaya123/bgtest/blob/main/bgremove-banner.PNG?raw=true",
                title: "Product Photography",
                description: "Perfect for e-commerce and online stores"
              },
              {
                before: "https://github.com/danukaya123/bgtest/blob/main/bgremove-banner.PNG?raw=true",
                after: "https://github.com/danukaya123/bgtest/blob/main/bgremove-banner.PNG?raw=true",
                title: "Portrait Enhancement",
                description: "Clean, professional headshots"
              },
              {
                before: "https://github.com/danukaya123/bgtest/blob/main/bgremove-banner.PNG?raw=true",
                after: "https://github.com/danukaya123/bgtest/blob/main/bgremove-banner.PNG?raw=true",
                title: "Creative Projects",
                description: "Ideal for design and marketing"
              }
            ].map((example, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1px",
                    background: "#f1f5f9",
                  }}
                >
                  <div style={{ background: "white", padding: "1rem" }}>
                    <img
                      src={example.before}
                      alt={`Before - ${example.title}`}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      Before
                    </div>
                  </div>
                  <div style={{ background: "white", padding: "1rem" }}>
                    <img
                      src={example.after}
                      alt={`After - ${example.title}`}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      After
                    </div>
                  </div>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {example.title}
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {example.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "6rem 1rem",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "1rem",
            }}
          >
            Ready to Transform Your Images?
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#cbd5e1",
              marginBottom: "2.5rem",
              lineHeight: "1.6",
            }}
          >
            Join thousands of creators and businesses using our AI-powered background removal tool
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => {
                if (currentUser) {
                  document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  router.push('/signup');
                }
              }}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "white",
                border: "none",
                padding: "16px 40px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "1.1rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
              }}
            >
              {currentUser ? "Start Processing" : "Get Started Free"}
            </button>
            <button
              onClick={() => {
                document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: "transparent",
                color: "white",
                border: "1px solid #475569",
                padding: "16px 32px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "1.1rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#374151";
                e.currentTarget.style.borderColor = "#64748b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "#475569";
              }}
            >
              View Examples
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0f172a",
          color: "white",
          padding: "3rem 1rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "3rem",
              marginBottom: "3rem",
            }}
          >
            {/* Company Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "white",
                  }}
                >
                  Q
                </div>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "white",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Quizontal<span style={{ color: "#3b82f6" }}>RBG</span>
                </span>
              </div>
              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                }}
              >
                AI-powered background removal tool for creators, businesses, and everyone in between.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "white",
                }}
              >
                Quick Links
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {['Home', 'Features', 'Examples', 'Pricing', 'API Docs'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#3b82f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "white",
                }}
              >
                Support
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {['Help Center', 'Contact Us', 'Status', 'Community'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#3b82f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "white",
                }}
              >
                Legal
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#3b82f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              borderTop: "1px solid #1e293b",
              paddingTop: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "0.875rem",
              }}
            >
              © 2024 QuizontalRBG. All rights reserved.
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
              }}
            >
              {['Twitter', 'GitHub', 'LinkedIn', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  style={{
                    color: "#64748b",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
