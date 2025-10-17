import { useState, useRef, useEffect } from "react";
import { Client } from "@gradio/client";
import ImageEditor from './ImageEditor';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';


export default function Home() {
  const pageMeta = {
  title: 'Quizontal - AI Background Remover',
  description: 'Remove image backgrounds automatically with AI technology. 100% free, no watermarks, instant processing. Perfect for e-commerce, portraits, and creative projects.',
  image: 'https://rbg.quizontal.cc/og-image.jpg',
  url: 'https://rbg.quizontal.cc'
};
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
  const sidebarRef = useRef(null);
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
      if (mobileMenuOpen && 
          !event.target.closest('.mobile-sidebar') && 
          !event.target.closest('.menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close sidebar when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

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
        if (!currentUser) {
          setError("Please log in to upload and process images");
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }
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
      if (!currentUser) {
        setError("Please log in to upload and process images");
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      setFile(uploaded);
      setResultUrl(null);
      setError(null);
    }
  };

  // Background removal function
  const handleRemoveBackground = async () => {
    if (!file) return;
    
    if (!currentUser) {
      setError("Please log in to process images");
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("danuka21/quizontal-Background-Remover-C1");
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
      setMobileMenuOpen(false);
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
      </Head>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        

        
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          scroll-behavior: smooth;
          overflow-x: hidden;
        }
        
        /* Enhanced Responsive Animations */
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes neuralOrbit {
          0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
        }
        
        @keyframes neuralOrbitReverse {
          0% { transform: rotate(0deg) translateX(25px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(25px) rotate(360deg); }
        }
        
        @keyframes aiCorePulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes textGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
        
        .slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        .text-glow {
          animation: textGlow 2s ease-in-out infinite;
        }
        
        /* Enhanced Responsive Design */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          
          .mobile-only {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
          
          .mobile-sidebar {
            display: none !important;
          }
        }
        
        /* Hero Section Responsive */
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
        
        @media (max-width: 480px) {
          .hero-container {
            gap: 2rem;
            padding: 0 1rem;
          }
        }
        
        /* Feature Points */
        .feature-points {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .feature-points {
            align-items: center;
            text-align: center;
          }
        }
        
        /* CTA Buttons */
        .cta-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        @media (max-width: 480px) {
          .cta-buttons {
            flex-direction: column;
            width: 100%;
            align-items: center;
          }
          
          .cta-buttons button {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }
        
        /* Floating Badges */
        .floating-badge {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
        
        @media (max-width: 768px) {
          .floating-badge {
            font-size: 12px !important;
            padding: 8px 16px !important;
          }
        }
        
        /* Grid Layouts */
        .responsive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
          gap: 2rem;
        }
        
        @media (max-width: 480px) {
          .responsive-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 0 1rem;
          }
        }
        
        /* Image Responsive */
        .responsive-image {
          width: 100%;
          height: auto;
          max-width: 100%;
          object-fit: contain;
        }
        
        /* Text Responsive */
        .responsive-text {
          font-size: clamp(1rem, 2vw, 1.2rem);
        }
        
        .responsive-heading {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
        }
        
        /* Button Responsive */
        .responsive-button {
          padding: clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px);
          font-size: clamp(14px, 2vw, 16px);
        }
        
        /* Section Padding */
        .responsive-section {
          padding: clamp(2rem, 4vw, 4rem) clamp(1rem, 3vw, 2rem);
        }
        
        /* Navigation Responsive */
        @media (max-width: 768px) {
          .nav-container {
            padding: 1rem !important;
          }
          
          .nav-links {
            gap: 1rem !important;
          }
        }
        
        /* Results Grid */
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));
          gap: clamp(1.5rem, 3vw, 3rem);
        }
        
        @media (max-width: 480px) {
          .results-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        
        /* Upload Section */
        .upload-container {
          max-width: min(800px, 90vw);
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Mobile Sidebar Styles */
        .mobile-sidebar {
          animation: slideInLeft 0.3s ease-out;
        }
        
        .mobile-sidebar.closing {
          animation: slideOutLeft 0.3s ease-in;
        }
        
        .sidebar-overlay {
          animation: overlayFadeIn 0.3s ease-out;
        }
        
        .sidebar-overlay.closing {
          animation: overlayFadeOut 0.3s ease-in;
        }
        
        /* Improved Mobile Navigation */
        @media (max-width: 768px) {
          .mobile-nav-item {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f1f5f9;
            transition: all 0.2s ease;
          }
          
          .mobile-nav-item:active {
            background: #f8fafc;
          }
          
          .mobile-user-section {
            background: #f8fafc;
            margin: 1rem;
            padding: 1rem;
            border-radius: 12px;
          }
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
          className="nav-container"
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
<div className="desktop-only nav-links" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
  {[
    { name: 'Home', href: 'https://rbg.quizontal.cc' },
    { name: 'Upload', href: '#upload-section' },
    { name: 'Features', href: '#Features' },
    { name: 'Examples', href: '#examples' },
    { name: 'API Documentation', href: '/api.html' },
    { name: 'About', href: '/about.html' },
    { name: 'Blog', href: 'https://blog.quizontal.cc' }
  ].map((item) => (
    <a 
      key={item.name}
      href={item.href}
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
      {item.name}
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
                zIndex: 1001,
                position: "relative",
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
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className={`sidebar-overlay ${!mobileMenuOpen ? 'closing' : ''}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Navigation */}
      <div
        ref={sidebarRef}
        className={`mobile-sidebar ${!mobileMenuOpen ? 'closing' : ''}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(85vw, 320px)",
          background: "white",
          zIndex: 1000,
          boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
          display: mobileMenuOpen ? "flex" : "none",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #f8fafc, #ffffff)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
                color: "white",
              }}
            >
              Q
            </div>
            <div>
              <div style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#1e293b",
              }}>
                Quizontal<span style={{ color: "#3b82f6" }}>RBG</span>
              </div>
              <div style={{
                fontSize: "12px",
                color: "#64748b",
                marginTop: "2px"
              }}>
                AI Background Remover
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: "1rem 0" }}>
  {[
    { name: 'Home', href: 'https://rbg.quizontal.cc' },
    { name: 'Upload', href: '#upload-section' },
    { name: 'Features', href: '#Features' },
    { name: 'Examples', href: '#examples' },
    { name: 'API Documentation', href: 'api.html' },
    { name: 'About', href: 'about.html' },
    { name: 'Blog', href: 'https://blog.quizontal.cc' }
  ].map((item) => (
            <a
      key={item.name}
      href={item.href}
              className="mobile-nav-item"
              style={{
                display: "block",
                color: "#64748b",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}   
            </a>
          ))}
        </div>

        {/* User Section */}
        <div style={{
          padding: "1.5rem",
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc"
        }}>
          {currentUser ? (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
                  Signed in as
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>
                  {userProfile?.username || currentUser.email}
                </div>
                {userProfile?.phoneNumber && (
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                    {userProfile.phoneNumber}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid #dc2626",
                  color: "#dc2626",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={() => {
                  router.push('/login');
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
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
                  width: "100%",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  border: "none",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 2px 10px rgba(59, 130, 246, 0.3)",
                }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rest of your components remain the same */}
      {/* Hero Section */}
      <section
        className="responsive-section"
        style={{
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
              className="responsive-heading"
              style={{
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
              className="responsive-text"
              style={{
                color: "#64748b",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              100% Automatically and Free
            </p>
            
            <p
              className="responsive-text"
              style={{
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
                className="responsive-button"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "600",
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
                className="responsive-button"
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  fontWeight: "600",
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
                  className="responsive-image"
                  style={{
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

      {/* Upload Section - ALWAYS VISIBLE */}
      <section
        id="upload-section"
        className="responsive-section"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div className="upload-container">
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "clamp(1.5rem, 4vw, 2.5rem)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              border: dragActive ? "2px dashed #3b82f6" : "2px dashed #e2e8f0",
              transition: "all 0.3s ease",
              position: "relative",
              zIndex: 10,
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "clamp(60px, 10vw, 80px)",
                    height: "clamp(60px, 10vw, 80px)",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  className="bounce-subtle"
                >
                  <svg 
                    width="clamp(24px, 4vw, 32px)" 
                    height="clamp(24px, 4vw, 32px)" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ color: "white" }}
                  >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 style={{ 
                  fontSize: "clamp(1.25rem, 3vw, 1.5rem)", 
                  fontWeight: "600", 
                  color: "#1e293b", 
                  marginBottom: "0.5rem" 
                }}>
                  Upload image
                </h3>
                <p style={{ 
                  color: "#64748b", 
                  marginBottom: "2rem", 
                  fontSize: "clamp(0.9rem, 2vw, 1rem)" 
                }}>
                  Drag & drop or click to browse
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="responsive-button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "white",
                    borderRadius: "12px",
                    fontWeight: "600",
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Image
                </label>
                
                <p style={{ 
                  color: "#94a3b8", 
                  fontSize: "clamp(12px, 2vw, 14px)", 
                  marginTop: "1rem" 
                }}>
                  {!currentUser ? "Log in to start processing images" : "No images? Try our sample images"}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="responsive-image"
                    style={{
                      maxWidth: "min(400px, 90vw)",
                      maxHeight: "400px",
                      borderRadius: "15px",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
                      filter: loading ? "blur(4px) brightness(0.95)" : "none",
                      transition: "all 0.4s ease",
                      objectFit: "contain",
                    }}
                  />
                  
                  {/* Enhanced AI Loading Animation */}
                  {loading && (
                    <div
                      style={{
                       
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(255,255,255,0.98)",
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "2rem",
                        padding: "2rem",
                      }}
                    >
                      {/* Advanced Neural Network Animation */}
                      <div style={{ 
                        position: "relative", 
                        width: "120px", 
                        height: "120px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {/* Outer Orbit */}
                        <div
                          style={{
                            position: "absolute",
                            width: "100px",
                            height: "100px",
                            border: "2px solid #e2e8f0",
                            borderRadius: "50%",
                          }}
                        />
                        
                        {/* Orbiting Particles */}
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              width: "8px",
                              height: "8px",
                              background: "#3b82f6",
                              borderRadius: "50%",
                              animation: `neuralOrbit ${2 + i * 0.5}s linear infinite`,
                              animationDelay: `${i * 0.3}s`,
                            }}
                          />
                        ))}
                        
                        {/* Inner Orbit */}
                        <div
                          style={{
                            position: "absolute",
                            width: "60px",
                            height: "60px",
                            border: "2px solid #e2e8f0",
                            borderRadius: "50%",
                          }}
                        />
                        
                        {/* Inner Orbiting Particles */}
                        {[0, 1].map((i) => (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              width: "6px",
                              height: "6px",
                              background: "#10b981",
                              borderRadius: "50%",
                              animation: `neuralOrbitReverse ${1.5 + i * 0.4}s linear infinite`,
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                        
                        {/* AI Core */}
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            background: "linear-gradient(135deg, #3b82f6, #10b981)",
                            borderRadius: "50%",
                            animation: "aiCorePulse 2s ease-in-out infinite",
                          }}
                        />
                      </div>
                      
                      {/* Enhanced Text Content */}
                      <div style={{ 
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem"
                      }}>
                        <h3 style={{ 
                          color: "#1e293b", 
                          fontWeight: "700", 
                          fontSize: "clamp(1.25rem, 3vw, 1.5rem)", 
                          margin: 0,
                          animation: "textGlow 2s ease-in-out infinite"
                        }}>
                          AI Processing
                        </h3>
                        <p style={{ 
                          color: "#64748b", 
                          fontSize: "clamp(0.9rem, 2vw, 1rem)", 
                          margin: 0,
                          lineHeight: "1.5"
                        }}>
                          Analyzing image patterns...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  marginTop: "2rem", 
                  display: "flex", 
                  gap: "1rem", 
                  justifyContent: "center", 
                  flexWrap: "wrap" 
                }}>
                  {!loading && !resultUrl && (
                    <>
                      <button
                        onClick={handleRemoveBackground}
                        className="responsive-button"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
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
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Remove Background
                      </button>
                      
                      <button
                        onClick={resetAll}
                        className="responsive-button"
                        style={{
                          background: "transparent",
                          color: "#64748b",
                          border: "1px solid #d1d5db",
                          borderRadius: "12px",
                          fontWeight: "600",
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
                        Choose Different
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div
              style={{
                marginTop: "2rem",
                padding: "1rem 1.5rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                maxWidth: "500px",
                margin: "2rem auto 0",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {(resultUrl || editingMode) && (
        <section
          ref={resultsSectionRef}
          className="responsive-section"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
          }}
          className="slide-up"
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ 
                fontSize: "clamp(2rem, 4vw, 3rem)", 
                fontWeight: "700", 
                color: "#1e293b", 
                marginBottom: "1rem",
                background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Background Removed! 🎉
              </h2>
              <p style={{ 
                fontSize: "clamp(1rem, 2vw, 1.2rem)", 
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto",
              }}>
                Your image has been processed successfully. Download the result or edit it further.
              </p>
            </div>
            
            {/* Edit Button */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <button
                onClick={() => setEditingMode(true)}
                className="responsive-button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                  marginBottom: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.3)";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit Image
              </button>
            </div>
            
            {/* Results Grid */}
            <div className="results-grid">
              {/* Original Image */}
              <div style={{ textAlign: "center" }}>
                <h3 style={{ 
                  fontSize: "clamp(1.1rem, 2vw, 1.25rem)", 
                  fontWeight: "600", 
                  color: "#64748b", 
                  marginBottom: "1.5rem" 
                }}>
                  Original Image
                </h3>
                <div
                  style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "20px",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Original"
                    className="responsive-image"
                    style={{
                      maxWidth: "500px",
                      borderRadius: "12px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              </div>

              {/* Processed Image */}
              <div style={{ textAlign: "center" }}>
                <h3 style={{ 
                  fontSize: "clamp(1.1rem, 2vw, 1.25rem)", 
                  fontWeight: "600", 
                  color: "#64748b", 
                  marginBottom: "1.5rem" 
                }}>
                  Background Removed
                </h3>
                <div
                  style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "20px",
                    boxShadow: "0 15px 35px rgba(59, 130, 246, 0.15)",
                    position: "relative",
                  }}
                >
                  <img
                    src={resultUrl}
                    alt="Background removed"
                    className="responsive-image"
                    style={{
                      maxWidth: "500px",
                      borderRadius: "12px",
                      background: "linear-gradient(45deg, #f8fafc, #e2e8f0)",
                      padding: "1rem",
                    }}
                  />
                </div>
                
                <button
                  onClick={downloadImage}
                  className="responsive-button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginTop: "2rem",
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: "3rem", textAlign: "center" }}>
              <button
                onClick={resetAll}
                className="responsive-button"
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  fontWeight: "600",
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
                Remove Another Background
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Image Editor Component */}
      {editingMode && resultUrl && (
        <ImageEditor 
          resultUrl={resultUrl}
          onClose={() => setEditingMode(false)}
          onDownloadEdited={handleDownloadEdited}
        />
      )}

      {/* Features Section */}
      <section
        id = "Features"
        className="responsive-section"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              className="responsive-heading"
              style={{
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              Why Choose Quizontal RBG?
            </h2>
            <p
              className="responsive-text"
              style={{
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Experience the power of AI with our advanced background removal technology
            </p>
          </div>

          <div className="responsive-grid">
            {[
              {
                icon: "⚡",
                title: "Lightning Fast",
                description: "Get results in seconds with our optimized AI processing engine"
              },
              {
                icon: "🎯",
                title: "Pixel Perfect",
                description: "Crisp, clean edges with professional-grade accuracy every time"
              },
              {
                icon: "🆓",
                title: "Completely Free",
                description: "No hidden costs, no watermarks, no subscription required"
              },
              {
                icon: "🔒",
                title: "Privacy First",
                description: "Your images are processed securely and never stored on our servers"
              },
              {
                icon: "🎨",
                title: "High Quality",
                description: "Maintain original image quality with lossless background removal"
              },
              {
                icon: "🌐",
                title: "Universal Support",
                description: "Works with all image formats and sizes up to 25MB"
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  padding: "clamp(1.5rem, 3vw, 2.5rem)",
                  borderRadius: "20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  border: "1px solid #f1f5f9",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 3rem)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "1rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="responsive-text"
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section
        id="examples"
        className="responsive-section"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          position: "relative",
        }}
      >
        {/* Background Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "300px",
            height: "300px",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-5%",
            width: "250px",
            height: "250px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
        
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Section Header */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              className="responsive-heading"
              style={{
                fontWeight: "800",
                color: "#1e293b",
                marginBottom: "1rem",
                background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              See Amazing Results
            </h2>
            <p
              className="responsive-text"
              style={{
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Check out these stunning transformations powered by our AI technology
            </p>
          </div>

          {/* Examples Grid */}
          <div className="responsive-grid">
            {/* Example 1 - Product Photography */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                border: "1px solid #f1f5f9",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 30px 50px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "250px",
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://github.com/danukaya123/bgtest/blob/main/background-removed-1760539834260.png?raw=true"
                  alt="Shoes product photo"
                  className="responsive-image"
                  style={{
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "15px",
                    fontSize: "11px",
                    fontWeight: "700",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  Background Removed
                </div>
              </div>
              <div style={{ padding: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: "0.75rem",
                  }}
                >
                  E-commerce Products
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                    marginBottom: "1.5rem",
                    fontSize: "0.95rem",
                  }}
                >
                  Perfect for online stores. Create clean, professional product images that convert better.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#10b981",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  Perfect for online stores
                </div>
              </div>
            </div>

            {/* Example 2 - Portrait Photography */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                border: "1px solid #f1f5f9",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 30px 50px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "250px",
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://github.com/danukaya123/bgtest/blob/main/background-removed-1760542319588.png?raw=true"
                  alt="Portrait photography"
                  className="responsive-image"
                  style={{
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "15px",
                    fontSize: "11px",
                    fontWeight: "700",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  Professional Results
                </div>
              </div>
              <div style={{ padding: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: "0.75rem",
                  }}
                >
                  Portrait Photography
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                    marginBottom: "1.5rem",
                    fontSize: "0.95rem",
                  }}
                >
                  Create stunning portraits with clean backgrounds. Perfect for professional headshots and social media.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#10b981",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  Ideal for professional photos
                </div>
              </div>
            </div>

            {/* Example 3 - Creative Projects */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                border: "1px solid #f1f5f9",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 30px 50px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "250px",
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://github.com/danukaya123/bgtest/blob/main/background-removed-1760542234326.png?raw=true"
                  alt="Creative pet photography"
                  className="responsive-image"
                  style={{
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "15px",
                    fontSize: "11px",
                    fontWeight: "700",
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  Creative Projects
                </div>
              </div>
              <div style={{ padding: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: "0.75rem",
                  }}
                >
                  Pet & Animal Photos
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                    marginBottom: "1.5rem",
                    fontSize: "0.95rem",
                  }}
                >
                  Remove distracting backgrounds from pet photos. Perfect for creating clean, professional-looking animal portraits.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#10b981",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  Great for pet photography
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <p
              className="responsive-text"
              style={{
                color: "#64748b",
                marginBottom: "2rem",
                fontWeight: "500",
              }}
            >
              Ready to transform your images?
            </p>
            <button
              className="responsive-button"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
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
              onClick={() => {
                document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Try It Now - It's Free!
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "3rem 1rem",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "8px", 
            marginBottom: "1rem",
            flexWrap: "wrap"
          }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "12px",
                color: "white",
              }}
            >
              Q
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Quizontal<span style={{ color: "#3b82f6" }}>RBG</span>
            </span>
          </div>
          <p style={{ 
            color: "#64748b", 
            margin: "0.5rem 0", 
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            AI-powered background removal made simple and free
          </p>
          <p style={{ 
            color: "#94a3b8", 
            margin: 0, 
            fontSize: "12px",
            marginTop: "1rem"
          }}>
            &copy; {new Date().getFullYear()} QuizontalRBG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
