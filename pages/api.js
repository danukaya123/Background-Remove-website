'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';

export default function Api() {
  const pageMeta = {
    title: 'API - Quizontal AI Background Remover',
    description: 'Integrate Quizontal AI background removal into your applications with our simple REST API. Free, fast, and easy to use.',
    image: 'https://rbg.quizontal.cc/og-image.jpg',
    url: 'https://rbg.quizontal.cc/api'
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

  // Copy code functionality
  const copyCode = (button) => {
    const codeBlock = button.parentElement;
    const code = codeBlock.querySelector('pre').innerText;
    
    navigator.clipboard.writeText(code).then(() => {
      button.innerHTML = '✅ Copied!';
      setTimeout(() => {
        button.innerHTML = '📋 Copy';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
      button.innerHTML = '❌ Error';
      setTimeout(() => {
        button.innerHTML = '📋 Copy';
      }, 2000);
    });
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
        
        /* Code Block Styling */
        .code-block {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 12px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: clamp(12px, 2vw, 14px);
          line-height: 1.5;
          overflow-x: auto;
          margin: 1.5rem 0;
          position: relative;
          max-width: 100%;
        }

        .code-block pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          min-width: 0;
        }

        .code-keyword {
          color: #3b82f6;
        }

        .code-string {
          color: #10b981;
        }

        .code-comment {
          color: #64748b;
        }

        .code-function {
          color: #f59e0b;
        }

        .copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 4px;
          padding: 6px 10px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
          z-index: 2;
        }

        .copy-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        /* API Endpoints */
        .endpoint-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: clamp(1rem, 3vw, 1.5rem);
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          width: 100%;
          overflow: hidden;
        }

        .endpoint-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.1);
        }

        .endpoint-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .endpoint-method {
          display: inline-block;
          padding: 4px 12px;
          background: #3b82f6;
          color: white;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .endpoint-path {
          font-family: 'Monaco', 'Menlo', monospace;
          color: #1e293b;
          font-weight: 500;
          font-size: clamp(14px, 2vw, 1rem);
          word-break: break-all;
        }

        .endpoint-description {
          color: #64748b;
          margin: 1rem 0;
          line-height: 1.6;
          font-size: clamp(14px, 2vw, 1rem);
        }

        .parameter-table-container {
          width: 100%;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .parameter-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 500px;
        }

        .parameter-table th,
        .parameter-table td {
          padding: clamp(0.5rem, 2vw, 0.75rem);
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          font-size: clamp(12px, 2vw, 14px);
        }

        .parameter-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
        }

        .parameter-table td {
          color: #64748b;
        }

        .param-required {
          color: #ef4444;
          font-weight: 600;
          font-size: 12px;
        }

        /* Examples Grid */
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
          gap: clamp(1rem, 3vw, 2rem);
          margin-top: 2rem;
          width: 100%;
        }

        .example-card {
          background: white;
          padding: clamp(1.5rem, 3vw, 2rem);
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
          text-align: center;
          width: 100%;
          overflow: hidden;
        }

        .example-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .example-icon {
          font-size: clamp(2rem, 5vw, 2.5rem);
          margin-bottom: 1.5rem;
        }

        .example-title {
          font-size: clamp(1.1rem, 3vw, 1.25rem);
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
          gap: clamp(1rem, 3vw, 2rem);
          margin-top: 1.5rem;
        }

        .stat-card {
          text-align: center;
          padding: clamp(1rem, 3vw, 2rem);
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 15px;
          border: 1px solid #e2e8f0;
        }

        .stat-number {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #64748b;
          font-weight: 500;
          font-size: clamp(12px, 2vw, 14px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nav-links,
          .auth-buttons {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .endpoint-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .parameter-table {
            min-width: 400px;
          }

          .examples-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 1rem;
          }

          .container {
            padding: 0 1rem;
          }

          .content-section {
            padding: 1.5rem 1rem;
            border-radius: 16px;
          }

          .code-block {
            padding: 1rem;
            font-size: 12px;
          }

          .parameter-table {
            min-width: 350px;
            font-size: 11px;
          }

          .parameter-table th,
          .parameter-table td {
            padding: 0.5rem 0.25rem;
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
            padding: "1rem clamp(1rem, 3vw, 2rem)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Logo */}
          <Link href="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: 'none' }}>
            <div className="logo-icon" style={{
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
            }}>
              Q
            </div>
            <div className="logo-text" style={{
              fontSize: "clamp(18px, 4vw, 24px)",
              fontWeight: "800",
              color: "#1e293b",
              letterSpacing: "-0.5px",
            }}>
              Quizontal<span className="logo-accent" style={{ color: "#3b82f6" }}>RBG</span>
            </div>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="desktop-only nav-links" style={{ display: "flex", gap: "clamp(0.75rem, 2vw, 1.5rem)", alignItems: "center" }}>
            {[
              { name: 'Home', href: '/' },
              { name: 'Upload', href: '/#upload-section' },
              { name: 'Features', href: '/#Features' },
              { name: 'Examples', href: '/#examples' },
              { name: 'API Documentation', href: '/api' },
              { name: 'About', href: '/about' },
              { name: 'Blog', href: 'https://blog.quizontal.cc' }
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                style={{ 
                  color: pathname === item.href ? "#3b82f6" : "#64748b", 
                  textDecoration: "none", 
                  fontSize: "clamp(12px, 2vw, 14px)", 
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
            
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginLeft: "0.5rem" }}>
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
                        fontSize: "clamp(12px, 2vw, 14px)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
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
                    className="btn btn-outline"
                    style={{
                      background: "transparent",
                      border: "1px solid #d1d5db",
                      padding: "6px clamp(12px, 3vw, 16px)",
                      borderRadius: "6px",
                      color: "#374151",
                      fontWeight: "600",
                      fontSize: "clamp(12px, 2vw, 14px)",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      whiteSpace: "nowrap",
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
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
                    className="btn btn-primary"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      border: "none",
                      padding: "6px clamp(12px, 3vw, 16px)",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "clamp(12px, 2vw, 14px)",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      boxShadow: "0 2px 10px rgba(59, 130, 246, 0.3)",
                      whiteSpace: "nowrap",
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
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
              className="mobile-menu-toggle menu-toggle"
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
        <div className="sidebar-header" style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #f8fafc, #ffffff)"
        }}>
          <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <div className="logo-icon" style={{
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
            }}>
              Q
            </div>
            <div>
              <div className="logo-text" style={{
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
        <div className="sidebar-nav" style={{ flex: 1, padding: "1rem 0" }}>
          {[
            { name: 'Home', href: '/' },
            { name: 'Upload', href: '/#upload-section' },
            { name: 'Features', href: '/#Features' },
            { name: 'Examples', href: '/#examples' },
            { name: 'API Documentation', href: '/api' },
            { name: 'About', href: '/about' },
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
        <div className="sidebar-footer" style={{
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
                  width: "100%",
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
      <main>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(1rem, 3vw, 2rem)", width: "100%", overflowX: "hidden" }}>
          {/* Page Header */}
          <section className="page-header" style={{ textAlign: "center", marginBottom: "3rem", padding: "clamp(2rem, 6vw, 4rem) 0 clamp(1rem, 3vw, 2rem)", width: "100%" }}>
            <h1 className="page-title" style={{ 
              fontSize: "clamp(2rem, 6vw, 3rem)", 
              fontWeight: "800", 
              background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text", 
              marginBottom: "1rem", 
              lineHeight: "1.1", 
              wordWrap: "break-word" 
            }}>
              API Documentation
            </h1>
            <p className="page-subtitle" style={{ 
              fontSize: "clamp(1rem, 3vw, 1.2rem)", 
              color: "#64748b", 
              maxWidth: "600px", 
              margin: "0 auto", 
              lineHeight: "1.6", 
              padding: "0 1rem" 
            }}>
              Integrate Quizontal&apos;s AI background removal into your applications with our simple REST API.
            </p>
          </section>

          {/* Quick Start */}
          <section className="content-section slide-up">
            <h2 className="section-title" style={{ 
              fontSize: "clamp(1.5rem, 4vw, 2rem)", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "1.5rem", 
              wordWrap: "break-word" 
            }}>
              Quick Start
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.7", fontSize: "clamp(14px, 2vw, 1rem)" }}>
              Get started with our API in minutes. The Quizontal API provides programmatic access to 
              our AI-powered background removal technology. All API endpoints are free to use and 
              require no authentication for basic usage.
            </p>
            
            <div className="code-block">
              <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
              <pre><span className="code-keyword">from</span> gradio_client <span className="code-keyword">import</span> Client, handle_file

<span className="code-comment"># Initialize the client</span>
client = Client(<span className="code-string">"danuka21/quizontal-Background-Remover-C1"</span>)

<span className="code-comment"># Remove background from an image</span>
result = client.predict(
    image=handle_file(<span className="code-string">'https://example.com/image.png'</span>),
    api_name=<span className="code-string">"/image"</span>
)
<span className="code-keyword">print</span>(result)</pre>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="content-section slide-up">
            <h2 className="section-title" style={{ 
              fontSize: "clamp(1.5rem, 4vw, 2rem)", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "1.5rem", 
              wordWrap: "break-word" 
            }}>
              API Endpoints
            </h2>
            
            <div className="endpoint-card">
              <div className="endpoint-header">
                <span className="endpoint-method">POST</span>
                <span className="endpoint-path">/image</span>
              </div>
              <p className="endpoint-description">
                Remove background from a single image. Supports PNG, JPG, and WEBP formats up to 25MB.
              </p>
              
              <h4 style={{ color: "#1e293b", margin: "1.5rem 0 1rem", fontSize: "clamp(1.1rem, 3vw, 1.25rem)" }}>Parameters</h4>
              <div className="parameter-table-container">
                <table className="parameter-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>image</td>
                      <td>File</td>
                      <td><span className="param-required">Yes</span></td>
                      <td>Image file to process (PNG, JPG, WEBP)</td>
                    </tr>
                    <tr>
                      <td>api_name</td>
                      <td>String</td>
                      <td><span className="param-required">Yes</span></td>
                      <td>Must be "/image"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h4 style={{ color: "#1e293b", margin: "1.5rem 0 1rem", fontSize: "clamp(1.1rem, 3vw, 1.25rem)" }}>Response</h4>
              <div className="code-block">
                <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                <pre>{`{
  "data": [
    [
      {
        "url": "https://processed-image-url.com/result.png",
        "size": [800, 600],
        "original_name": "input.jpg"
      }
    ]
  ],
  "duration": 2.1
}`}</pre>
              </div>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="content-section slide-up">
            <h2 className="section-title" style={{ 
              fontSize: "clamp(1.5rem, 4vw, 2rem)", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "1.5rem", 
              wordWrap: "break-word" 
            }}>
              Usage Examples
            </h2>
            
            <div className="examples-grid">
              <div className="example-card">
                <div className="example-icon">🐍</div>
                <h3 className="example-title">Python</h3>
                <div className="code-block" style={{ margin: "1rem 0" }}>
                  <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                  <pre><span className="code-keyword">import</span> requests
<span className="code-keyword">from</span> gradio_client <span className="code-keyword">import</span> Client

client = Client(<span className="code-string">"danuka21/quizontal-Background-Remover-C1"</span>)
result = client.predict(
    image=<span className="code-string">"path/to/image.jpg"</span>,
    api_name=<span className="code-string">"/image"</span>
)</pre>
                </div>
              </div>
              
              <div className="example-card">
                <div className="example-icon">🟨</div>
                <h3 className="example-title">JavaScript</h3>
                <div className="code-block" style={{ margin: "1rem 0" }}>
                  <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                  <pre><span className="code-comment">// Using fetch API</span>
<span className="code-keyword">const</span> formData = <span className="code-keyword">new</span> FormData();
formData.append(<span className="code-string">'image'</span>, imageFile);

<span className="code-keyword">const</span> response = <span className="code-keyword">await</span> fetch(
  <span className="code-string">'https://huggingface.co/spaces/danuka21/quizontal-Background-Remover-C1'</span>,
  {
    method: <span className="code-string">'POST'</span>,
    body: formData
  }
);</pre>
                </div>
              </div>
              
              <div className="example-card">
                <div className="example-icon">📱</div>
                <h3 className="example-title">Mobile Apps</h3>
                <div className="code-block" style={{ margin: "1rem 0" }}>
                  <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                  <pre><span className="code-comment">// Swift example</span>
<span className="code-keyword">let</span> client = Client(
  src: <span className="code-string">"danuka21/quizontal-Background-Remover-C1"</span>
)
<span className="code-keyword">let</span> result = client.predict(
  inputs: [<span className="code-string">"image"</span>: imageData],
  endpoint: <span className="code-string">"/image"</span>
)</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits & Pricing */}
          <section className="content-section slide-up">
            <h2 className="section-title" style={{ 
              fontSize: "clamp(1.5rem, 4vw, 2rem)", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "1.5rem", 
              wordWrap: "break-word" 
            }}>
              Rate Limits & Pricing
            </h2>
            <div style={{ background: "#f0f9ff", padding: "clamp(1.5rem, 3vw, 2rem)", borderRadius: "12px", border: "1px solid #bae6fd" }}>
              <h3 style={{ color: "#0369a1", marginBottom: "1rem", fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>🎉 Completely Free!</h3>
              <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "clamp(14px, 2vw, 1rem)" }}>
                The Quizontal API is completely free to use with no rate limits for individual users. 
                We believe in making AI accessible to everyone. For high-volume commercial use, 
                please contact us for enterprise solutions.
              </p>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Requests</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0$</div>
                  <div className="stat-label">Cost</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">25MB</div>
                  <div className="stat-label">Max File Size</div>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="content-section slide-up">
            <h2 className="section-title" style={{ 
              fontSize: "clamp(1.5rem, 4vw, 2rem)", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "1.5rem", 
              wordWrap: "break-word" 
            }}>
              Support
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.7", fontSize: "clamp(14px, 2vw, 1rem)" }}>
              Need help integrating our API? Check out our documentation or contact our support team.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <a href="#" className="btn btn-primary" style={{ fontSize: "clamp(14px, 2vw, 1rem)", padding: "10px 20px", textDecoration: 'none' }}>View Full Documentation</a>
              <a href="#" className="btn btn-outline" style={{ fontSize: "clamp(14px, 2vw, 1rem)", padding: "10px 20px", textDecoration: 'none' }}>Contact Support</a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "clamp(2rem, 4vw, 3rem) 1rem", background: "#f8fafc", marginTop: "4rem", width: "100%" }}>
        <div className="footer-content" style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", padding: "0 1rem" }}>
          <div className="footer-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div className="logo-icon" style={{ width: "24px", height: "24px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", color: "white" }}>
              Q
            </div>
            <div className="logo-text" style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
              Quizontal<span className="logo-accent" style={{ color: "#3b82f6" }}>RBG</span>
            </div>
          </div>
          <p className="footer-text" style={{ color: "#64748b", margin: "0.5rem 0", fontSize: "clamp(12px, 2vw, 14px)", lineHeight: "1.5" }}>
            AI-powered background removal made simple and free
          </p>
          <p className="footer-copyright" style={{ color: "#94a3b8", fontSize: "12px", marginTop: "1rem" }}>
            &copy; 2024 QuizontalRBG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
