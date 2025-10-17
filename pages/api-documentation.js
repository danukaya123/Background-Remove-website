'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const sidebarRef = useRef(null);
  const pathname = usePathname();

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

  // Check for user authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const profileData = localStorage.getItem('userProfile');
        
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.log('No user data found');
      }
    };

    checkAuth();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      
      setCurrentUser(null);
      setUserProfile(null);
      setShowDropdown(false);
      setMobileMenuOpen(false);
      
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

  const codeExamples = {
    quickStart: `from gradio_client import Client, handle_file

# Initialize the client
client = Client("danuka21/quizontal-Background-Remover-C1")

# Remove background from an image
result = client.predict(
    image=handle_file('https://example.com/image.png'),
    api_name="/image"
)
print(result)`,

    responseExample: `{
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
}`,

    pythonExample: `import requests
from gradio_client import Client

client = Client("danuka21/quizontal-Background-Remover-C1")
result = client.predict(
    image="path/to/image.jpg",
    api_name="/image"
)`,

    javascriptExample: `// Using fetch API
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(
  'https://huggingface.co/spaces/danuka21/quizontal-Background-Remover-C1',
  {
    method: 'POST',
    body: formData
  }
);`,

    swiftExample: `// Swift example
let client = Client(
  src: "danuka21/quizontal-Background-Remover-C1"
)
let result = client.predict(
  inputs: ["image": imageData],
  endpoint: "/image"
)`
  };

  return (
    <div className="api-page">
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
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          scroll-behavior: smooth;
          overflow-x: hidden;
          width: 100%;
        }

        .api-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
          color: #1e293b;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0;
          margin: 0;
          width: 100%;
          overflow-x: hidden;
        }

        /* Navigation Base Styles */
        nav {
          border-bottom: 1px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          width: 100%;
        }

        .nav-container {
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: white;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .logo-accent {
          color: #3b82f6;
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .nav-links a:hover,
        .nav-links a.active {
          color: #3b82f6;
          background: #f1f5f9;
        }

        .auth-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-left: 0.5rem;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .btn-outline:hover {
          background: #f8fafc;
          border-color: #9ca3af;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          flex-direction: column;
          gap: 4px;
          z-index: 1001;
          position: relative;
        }

        .mobile-menu-toggle span {
          width: 24px;
          height: 2px;
          background: #1e293b;
          transition: all 0.3s;
        }

        /* Mobile Sidebar */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: none;
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(85vw, 320px);
          background: white;
          z-index: 1000;
          box-shadow: 2px 0 20px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .sidebar-logo .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          font-size: 18px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .mobile-nav-item {
          display: block;
          color: #64748b;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s;
        }

        .mobile-nav-item:active {
          background: #f8fafc;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        /* Main Content */
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 1rem;
          width: 100%;
          overflow-x: hidden;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 4rem 0 2rem;
          width: 100%;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .page-subtitle {
          font-size: 1.2rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .content-section {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          border: 1px solid #f1f5f9;
          width: 100%;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        /* IMPROVED: Code Block Styling for Mobile */
        .code-block {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 12px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          overflow-x: auto;
          margin: 1.5rem 0;
          position: relative;
          max-width: 100%;
          -webkit-overflow-scrolling: touch;
        }

        .code-block pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          word-break: break-all;
          min-width: 0;
          overflow-wrap: break-word;
        }

        .code-block code {
          display: block;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
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
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          width: 100%;
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
          font-size: 1rem;
          word-break: break-all;
        }

        .endpoint-description {
          color: #64748b;
          margin: 1rem 0;
          line-height: 1.6;
          font-size: 1rem;
        }

        .parameter-table-container {
          width: 100%;
          overflow-x: auto;
          margin: 1rem 0;
          -webkit-overflow-scrolling: touch;
        }

        .parameter-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 500px;
        }

        .parameter-table th,
        .parameter-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
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

        /* IMPROVED: Examples Grid for Mobile */
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
          width: 100%;
        }

        .example-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
          text-align: center;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .example-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .example-icon {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .example-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .example-card .code-block {
          flex: 1;
          margin: 0;
          display: flex;
          flex-direction: column;
        }

        .example-card .code-block pre {
          flex: 1;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
          margin-top: 1.5rem;
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
          font-size: 14px;
        }

        /* Support Section Buttons */
        .support-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 1rem;
        }

        .support-buttons .btn {
          padding: 12px 24px;
          font-size: 1rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* Footer */
        footer {
          border-top: 1px solid #e2e8f0;
          padding: 3rem 1rem;
          background: #f8fafc;
          margin-top: 4rem;
          width: 100%;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .footer-logo .logo-icon {
          width: 24px;
          height: 24px;
          font-size: 12px;
        }

        .footer-text {
          color: #64748b;
          margin: 0.5rem 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .footer-copyright {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 1rem;
        }

        /* Animations */
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

        /* IMPROVED: Responsive Design for Mobile */
        @media (max-width: 768px) {
          .nav-links,
          .auth-buttons {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .nav-container {
            padding: 1rem;
          }

          .container {
            padding: 0 1rem;
          }

          .page-header {
            padding: 2rem 0 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .page-subtitle {
            font-size: 1rem;
            padding: 0 1rem;
          }

          .content-section {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .section-title {
            font-size: 1.5rem;
          }

          /* IMPROVED: Code blocks for mobile */
          .code-block {
            padding: 1rem;
            font-size: 12px;
            margin: 1rem 0;
          }

          .code-block pre {
            font-size: 11px;
            line-height: 1.4;
          }

          .endpoint-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .parameter-table {
            min-width: 400px;
          }

          /* IMPROVED: Examples grid for mobile */
          .examples-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .example-card {
            padding: 1.5rem;
            margin: 0;
          }

          .example-card .code-block {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-card {
            padding: 1.5rem;
          }

          .support-buttons {
            flex-direction: column;
            align-items: center;
          }

          .support-buttons .btn {
            width: 100%;
            max-width: 280px;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.75rem;
          }

          .content-section {
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .code-block {
            padding: 0.75rem;
            font-size: 11px;
          }

          .code-block pre {
            font-size: 10px;
          }

          .parameter-table {
            min-width: 350px;
            font-size: 11px;
          }

          .parameter-table th,
          .parameter-table td {
            padding: 0.5rem;
            font-size: 12px;
          }

          .examples-grid {
            gap: 1rem;
          }

          .example-card {
            padding: 1.25rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .footer-logo {
            flex-direction: column;
            gap: 0.5rem;
          }

          /* IMPROVED: Better code wrapping on very small screens */
          .code-block pre {
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .endpoint-path {
            font-size: 0.9rem;
            word-break: break-word;
          }
        }

        @media (min-width: 1200px) {
          .nav-container,
          .container {
            max-width: 1200px;
          }
        }

        /* Mobile Sidebar Active States */
        .mobile-sidebar {
          animation: slideInLeft 0.3s ease-out;
        }

        .mobile-sidebar.closing {
          animation: slideOutLeft 0.3s ease-in;
        }

        .sidebar-overlay {
          animation: overlayFadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Navigation */}
      <nav>
        <div className="nav-container">
          <Link href="/" className="logo">
            <div className="logo-icon">Q</div>
            <div className="logo-text">Quizontal<span className="logo-accent">RBG</span></div>
          </Link>
          
          <div className="nav-links">
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
                  background: pathname === item.href ? "#f1f5f9" : "transparent",
                }}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="auth-buttons">
              {currentUser ? (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ position: "relative" }}>
                    <button
                      className="btn btn-outline"
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
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline">Log in</Link>
                  <Link href="/signup" className="btn btn-primary">Sign up</Link>
                </>
              )}
            </div>
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span style={{ transform: mobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
            <span style={{ opacity: mobileMenuOpen ? "0" : "1" }}></span>
            <span style={{ transform: mobileMenuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none" }}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Navigation */}
      <div
        ref={sidebarRef}
        className="mobile-sidebar"
        style={{ display: mobileMenuOpen ? "flex" : "none" }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">Q</div>
            <div>
              <div className="logo-text">Quizontal<span className="logo-accent">RBG</span></div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                AI Background Remover
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
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
                color: pathname === item.href ? "#3b82f6" : "#64748b",
                background: pathname === item.href ? "#f1f5f9" : "transparent",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}   
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          {currentUser ? (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
                  Signed in as
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>
                  {userProfile?.username || currentUser.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ width: "100%", borderColor: "#dc2626", color: "#dc2626" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="container">
          <section className="page-header">
            <h1 className="page-title">API Documentation</h1>
            <p className="page-subtitle">
              Integrate Quizontal&apos;s AI background removal into your applications with our simple REST API.
            </p>
          </section>

          {/* Quick Start */}
          <section className="content-section slide-up">
            <h2 className="section-title">Quick Start</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.7" }}>
              Get started with our API in minutes. The Quizontal API provides programmatic access to 
              our AI-powered background removal technology. All API endpoints are free to use and 
              require no authentication for basic usage.
            </p>
            
            <div className="code-block">
              <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
              <pre>{codeExamples.quickStart}</pre>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="content-section slide-up">
            <h2 className="section-title">API Endpoints</h2>
            
            <div className="endpoint-card">
              <div className="endpoint-header">
                <span className="endpoint-method">POST</span>
                <span className="endpoint-path">/image</span>
              </div>
              <p className="endpoint-description">
                Remove background from a single image. Supports PNG, JPG, and WEBP formats up to 25MB.
              </p>
              
              <h4 style={{ color: "#1e293b", margin: "1.5rem 0 1rem" }}>Parameters</h4>
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
              
              <h4 style={{ color: "#1e293b", margin: "1.5rem 0 1rem" }}>Response</h4>
              <div className="code-block">
                <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                <pre>{codeExamples.responseExample}</pre>
              </div>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="content-section slide-up">
            <h2 className="section-title">Usage Examples</h2>
            
            <div className="examples-grid">
              <div className="example-card">
                <div className="example-icon">🐍</div>
                <h3 className="example-title">Python</h3>
                <div className="code-block">
                  <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                  <pre>{codeExamples.pythonExample}</pre>
                </div>
              </div>
              
              <div className="example-card">
                <div className="example-icon">🟨</div>
                <h3 className="example-title">JavaScript</h3>
                <div className="code-block">
                  <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                  <pre>{codeExamples.javascriptExample}</pre>
                </div>
              </div>
              
              <div className="example-card">
                <div className="example-icon">📱</div>
                <h3 className="example-title">Mobile Apps</h3>
                <div className="code-block">
                  <button className="copy-btn" onClick={(e) => copyCode(e.currentTarget)}>📋 Copy</button>
                  <pre>{codeExamples.swiftExample}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits & Pricing */}
          <section className="content-section slide-up">
            <h2 className="section-title">Rate Limits & Pricing</h2>
            <div style={{ background: "#f0f9ff", padding: "2rem", borderRadius: "12px", border: "1px solid #bae6fd" }}>
              <h3 style={{ color: "#0369a1", marginBottom: "1rem" }}>🎉 Completely Free!</h3>
              <p style={{ color: "#64748b", lineHeight: "1.7" }}>
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
            <h2 className="section-title">Support</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.7" }}>
              Need help integrating our API? Check out our documentation or contact our support team.
            </p>
            <div className="support-buttons">
              <a href="#" className="btn btn-primary">View Full Documentation</a>
              <a href="#" className="btn btn-outline">Contact Support</a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon">Q</div>
            <div className="logo-text">Quizontal<span className="logo-accent">RBG</span></div>
          </div>
          <p className="footer-text">
            AI-powered background removal made simple and free
          </p>
          <p className="footer-copyright">
            &copy; 2024 QuizontalRBG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
