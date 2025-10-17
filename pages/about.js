'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

export default function About() {
  const pageMeta = {
    title: 'About - Quizontal AI Background Remover',
    description: 'Learn about Quizontal mission to make AI-powered background removal accessible to everyone. Free, fast, and privacy-focused.',
    image: 'https://rbg.quizontal.cc/og-image.jpg',
    url: 'https://rbg.quizontal.cc/about'
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const sidebarRef = useRef(null);
  const pathname = usePathname();
  const { currentUser, userProfile, logout } = useAuth();

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

  
  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [mobileMenuOpen]);
  

  return (
<div
  style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
    color: "#1e293b",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "0",
    margin: "0",
    width: "100%", // Ensure full width
    overflowX: "hidden", // Hide horizontal overflow
    position: "relative",
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
        
    body.no-scroll {
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
    height: 100% !important;
  }      
  html {
    width: 100%;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    touch-action: pan-y;
  }
  
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: 'Inter', sans-serif;
    scroll-behavior: smooth;
    overflow-x: hidden;
    width: 100%;
    position: relative;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Lock body scroll but allow vertical scrolling */
  body {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
  }
  
  /* Prevent zoom on double-tap */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* Allow text selection where needed */
  p, h1, h2, h3, h4, h5, h6, span, div {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }
  
  /* Main container - ensure full width */
  #__next {
    width: 100%;
    overflow-x: hidden;
    position: relative;
  }
  
  /* Your existing animations and responsive styles... */
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
        
        .slide-up {
          animation: slideUp 0.6s ease-out;
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
        
        /* Content Sections */
        .content-section {
          background: white;
          border-radius: 20px;
          padding: clamp(1.5rem, 4vw, 2.5rem);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          border: 1px solid #f1f5f9;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
          gap: 2rem;
        }
        
        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
          text-align: center;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .stat-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 15px;
          border: 1px solid #e2e8f0;
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #64748b;
          font-weight: 500;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem 0;
          }
          
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }
          
          .auth-buttons {
            margin-left: 0;
          }
          
          .content-grid,
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: 'none' }}>
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
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="desktop-only nav-links" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {[
    { name: 'Home', href: 'https://rbg.quizontal.cc' },
    { name: 'Upload', href: 'https://rbg.quizontal.cc' },
    { name: 'Features', href: 'https://rbg.quizontal.cc' },
    { name: 'Examples', href: 'https://rbg.quizontal.cc' },
    { name: 'API Documentation', href: '/api-documentation' },
    { name: 'About', href: '/about' },
    { name: 'Support', href: '/support' },
    { name: 'Blog', href: 'https://blog.quizontal.cc' }
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                style={{ 
                  color: pathname === item.href ? "#3b82f6" : "#64748b", 
                  textDecoration: "none", 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  transition: "all 0.3s",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                  background: pathname === item.href ? "#f1f5f9" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.color = "#3b82f6";
                    e.currentTarget.style.background = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.name}
              </Link>
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
                  <Link
                    href="/login"
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
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center'
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
                  </Link>
                  <Link
                    href="/signup"
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
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center'
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
                  </Link>
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
    { name: 'Upload', href: 'https://rbg.quizontal.cc' },
    { name: 'Features', href: 'https://rbg.quizontal.cc' },
    { name: 'Examples', href: 'https://rbg.quizontal.cc' },
    { name: 'API Documentation', href: '/api-documentation' },
    { name: 'About', href: '/about' },
    { name: 'Support', href: '/support' },
    { name: 'Blog', href: 'https://blog.quizontal.cc' }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="mobile-nav-item"
              style={{
                display: "block",
                color: pathname === item.href ? "#3b82f6" : "#64748b",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                transition: "all 0.2s",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
                background: pathname === item.href ? "#f1f5f9" : "transparent",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}   
            </Link>
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
              <Link
                href="/login"
                style={{
                  // width: "100%",
                  background: "transparent",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  // width: "100%",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  border: "none",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 2px 10px rgba(59, 130, 246, 0.3)",
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <section className="page-header" style={{ textAlign: "center", marginBottom: "3rem", padding: "2rem 0" }}>
            <h1 style={{ 
              fontSize: "clamp(2rem, 4vw, 3rem)", 
              fontWeight: "800", 
              background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text", 
              marginBottom: "1rem" 
            }}>
              About Quizontal
            </h1>
            <p style={{ 
              fontSize: "clamp(1rem, 2vw, 1.2rem)", 
              color: "#64748b", 
              maxWidth: "600px", 
              margin: "0 auto" 
            }}>
              Learn about our mission to make AI-powered background removal accessible to everyone, for free.
            </p>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#1e293b" }}>Our Story</h2>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <p style={{ color: "#64748b", lineHeight: "1.7", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
                Quizontal was born from a simple idea: everyone should have access to professional-quality 
                background removal technology without the high costs and complexity. Founded in 2023, our 
                mission has been to democratize AI-powered image editing tools.
              </p>
              <p style={{ color: "#64748b", lineHeight: "1.7", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
                We believe that powerful technology should be accessible to students, small businesses, 
                content creators, and anyone who needs to edit images. That&apos;s why we&apos;ve built Quizontal 
                RBG - a completely free, no-watermark background removal service powered by cutting-edge 
                artificial intelligence.
              </p>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#1e293b" }}>Our Mission</h2>
            <div className="content-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Accessibility</h3>
                <p>Make professional background removal tools available to everyone, regardless of budget or technical expertise.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Performance</h3>
                <p>Deliver lightning-fast processing with pixel-perfect accuracy using advanced AI algorithms.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Privacy First</h3>
                <p>Process your images securely with automatic deletion and no data storage on our servers.</p>
              </div>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#1e293b" }}>Our Impact</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Images Processed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">2s</div>
                <div className="stat-label">Average Processing</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Free Forever</div>
              </div>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#1e293b" }}>The Technology</h2>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <p style={{ color: "#64748b", lineHeight: "1.7", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
                Quizontal RBG leverages state-of-the-art deep learning models trained on millions of images 
                to deliver exceptional background removal results. Our AI understands complex image contexts, 
                handles fine details like hair and transparent objects, and maintains original image quality.
              </p>
              <div style={{ background: "#f8fafc", padding: "2rem", borderRadius: "12px", marginTop: "2rem" }}>
                <h4 style={{ color: "#1e293b", marginBottom: "1rem" }}>Key Technical Features:</h4>
                <ul style={{ color: "#64748b", lineHeight: "1.8", paddingLeft: "1.5rem" }}>
                  <li>Advanced neural networks for precise edge detection</li>
                  <li>Real-time processing optimization</li>
                  <li>Support for all major image formats (PNG, JPG, WEBP)</li>
                  <li>Lossless quality preservation</li>
                  <li>Automatic image enhancement</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#1e293b" }}>Join Our Community</h2>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "1.1rem" }}>
                We&apos;re constantly improving our technology and adding new features. Join thousands of users 
                who trust Quizontal for their image editing needs.
              </p>
              <Link href="/" style={{ 
                fontSize: "1.1rem", 
                padding: "12px 24px", 
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
              }}>
                Start Removing Backgrounds Now
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "3rem 1rem", background: "#f8fafc", marginTop: "auto" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ width: "24px", height: "24px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", color: "white" }}>
              Q
            </div>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
              Quizontal<span style={{ color: "#3b82f6" }}>RBG</span>
            </span>
          </div>
          <p style={{ color: "#64748b", margin: "0.5rem 0", fontSize: "14px", lineHeight: "1.5" }}>
            AI-powered background removal made simple and free
          </p>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "1rem" }}>
            &copy; 2025 QuizontalRBG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
