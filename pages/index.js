import { useState, useRef, useEffect } from "react";
import { Client } from "@gradio/client";
import ImageEditor from './ImageEditor'; 

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  // Add these functions with proper indentation
  const handleEditImage = () => {
    setEditingImage(resultUrl);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingImage(null);
  };

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          scroll-behavior: smooth;
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
        
        @keyframes dataFlow {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes particleFloat {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10%, 90% { opacity: 1; }
          50% { 
            transform: translate(100px, -50px) rotate(180deg);
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
        
        @keyframes slideInFromRight {
          from { 
            opacity: 0;
            transform: translateX(100%);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
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
        
        .slide-in-right {
          animation: slideInFromRight 0.3s ease-out;
        }
        
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        /* Responsive design helper classes */
        .desktop-only {
          display: flex;
        }
        
        .mobile-only {
          display: none;
        }
        
        /* Hero section responsive styles */
        .hero-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        
        .hero-text h1,
        .hero-text p {
          text-align: left;
        }
        
        .feature-points {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .cta-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .floating-badge {
          position: absolute;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          
          .mobile-only {
            display: flex !important;
          }
          
          .hero-container {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            text-align: center;
          }
          
          .hero-text h1,
          .hero-text p {
            text-align: center !important;
          }
          
          .cta-buttons {
            justify-content: center !important;
          }
          
          .feature-points {
            align-items: center !important;
          }
          
          /* FIX: Text first, then image below on mobile */
          .hero-text {
            order: 1; /* Text appears first */
          }
          
          .hero-image {
            order: 2; /* Image appears second (below text) */
          }
          
          .floating-badge {
            font-size: 12px !important;
            padding: 8px 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .cta-buttons button {
            padding: 12px 20px !important;
            font-size: 14px !important;
            width: 100%;
            justify-content: center;
          }
          
          .cta-buttons {
            flex-direction: column;
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
              BG
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#1e293b",
                letterSpacing: "-0.5px",
              }}
            >
              remove<span style={{ color: "#3b82f6" }}>BG</span>
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
              <button
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
              <button
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
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Left Text, Right Image Layout */}
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
                marginBottom: "1.5rem",
                background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-1px",
              }}
            >
              Remove Image
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Background
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
                { icon: "✓", text: "No manual editing required" },
                { icon: "✓", text: "Preserves original image quality" },
                { icon: "✓", text: "Works with any image format" }
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
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Try It Now
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
                  zIndex: 3,
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
                  zIndex: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                className="floating-badge"
              >
                <span>After</span>
              </div>
              
              {/* Floating Element 2 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-15px",
                  left: "-15px",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                  zIndex: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                className="floating-badge"
              >
                <span>Before</span>
              </div>
              
              {/* Background Decorative Card */}
              <div
                style={{
                  position: "absolute",
                  top: "30px",
                  left: "30px",
                  right: "-30px",
                  bottom: "-30px",
                  background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                  borderRadius: "20px",
                  zIndex: 1,
                  transform: "rotate(-2deg)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section - Positioned below hero */}
      <section
        id="upload-section"
        style={{
          padding: "2rem 1rem 6rem",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
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
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "white",
                    padding: "clamp(10px, 2vw, 12px) clamp(24px, 4vw, 32px)",
                    borderRadius: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                    fontSize: "clamp(14px, 2vw, 16px)",
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
                  No images? Try our sample images
                </p>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    style={{
                      maxWidth: "min(400px, 90vw)",
                      width: "100%",
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
                        position: "absolute",
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
                        
                        {/* Floating Particles */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              width: "4px",
                              height: "4px",
                              background: "#8b5cf6",
                              borderRadius: "50%",
                              animation: `particleFloat ${3 + i * 0.5}s ease-in-out infinite`,
                              animationDelay: `${i * 0.6}s`,
                              left: "50%",
                              top: "50%",
                            }}
                          />
                        ))}
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
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          marginTop: "0.5rem"
                        }}>
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#3b82f6",
                            animation: "textGlow 1.4s ease-in-out infinite"
                          }}></div>
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#10b981",
                            animation: "textGlow 1.4s ease-in-out infinite 0.2s"
                          }}></div>
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#8b5cf6",
                            animation: "textGlow 1.4s ease-in-out infinite 0.4s"
                          }}></div>
                        </div>
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
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                          border: "none",
                          padding: "clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "clamp(14px, 2vw, 16px)",
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
                        style={{
                          background: "transparent",
                          color: "#64748b",
                          border: "1px solid #d1d5db",
                          padding: "clamp(12px, 2vw, 14px) clamp(20px, 3vw, 24px)",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "clamp(14px, 2vw, 16px)",
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
      {resultUrl && (
        <section
          ref={resultsSectionRef}
          style={{
            padding: "4rem 1rem",
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
                Your image has been processed successfully. Download the result or remove another background.
              </p>
            </div>
            
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
                gap: "clamp(2rem, 4vw, 4rem)",
                alignItems: "start",
              }}
            >
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
                    style={{
                      width: "100%",
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
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      borderRadius: "12px",
                      background: "linear-gradient(45deg, #f8fafc, #e2e8f0)",
                      padding: "1rem",
                    }}
                  />
                </div>
                
                <div style={{ 
                  marginTop: "2rem", 
                  display: "flex", 
                  gap: "1rem", 
                  justifyContent: "center", 
                  flexWrap: "wrap" 
                }}>
                  <button
                    onClick={handleEditImage}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      color: "white",
                      border: "none",
                      padding: "clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "clamp(14px, 2vw, 16px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
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
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Image
                  </button>
                  
                  <button
                    onClick={downloadImage}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      color: "white",
                      border: "none",
                      padding: "clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "clamp(14px, 2vw, 16px)",
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
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: "3rem", textAlign: "center" }}>
              <button
                onClick={resetAll}
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #d1d5db",
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 28px)",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "clamp(14px, 2vw, 16px)",
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

      {/* Features Section */}
      <section
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
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              Why Choose RemoveBG?
            </h2>
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.1rem)",
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Experience the power of AI with our advanced background removal technology
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: "clamp(1.5rem, 3vw, 2rem)",
            }}
          >
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
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                    margin: 0,
                    fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
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
        style={{
          padding: "6rem 1rem",
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
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
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
              style={{
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(350px, 100%), 1fr))",
              gap: "clamp(2rem, 4vw, 3rem)",
              alignItems: "start",
            }}
          >
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
                  style={{
                    width: "100%",
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
                  style={{
                    width: "100%",
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
                  style={{
                    width: "100%",
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
              style={{
                fontSize: "1.1rem",
                color: "#64748b",
                marginBottom: "2rem",
                fontWeight: "500",
              }}
            >
              Ready to transform your images?
            </p>
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
                // Scroll to upload section
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
              BG
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              remove<span style={{ color: "#3b82f6" }}>BG</span>
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
            &copy; {new Date().getFullYear()} removeBG. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Image Editor Modal - Add this at the very end */}
      {showEditor && (
        <ImageEditor
          imageUrl={editingImage}
          onClose={handleCloseEditor}
          onSave={handleCloseEditor}
        />
      )}
    </div>
  );
}
