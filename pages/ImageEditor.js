// ImageEditor.js
import { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ resultUrl, onClose, onDownloadEdited }) => {
  const [imageFilters, setImageFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0,
    sepia: 0,
    invert: 0
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('adjust');
  const canvasRef = useRef(null);

  // Check if mobile and disable body scroll
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Completely hide the main website content
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      // Re-enable body scroll when editor closes
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Apply filters to image
  const applyFilters = () => {
    if (!resultUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxWidth = isMobile ? window.innerWidth - 60 : 500;
      const maxHeight = isMobile ? window.innerHeight - 300 : 500;
      
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.filter = `
        brightness(${imageFilters.brightness}%)
        contrast(${imageFilters.contrast}%)
        saturate(${imageFilters.saturation}%)
        blur(${imageFilters.blur}px)
        hue-rotate(${imageFilters.hue}deg)
        sepia(${imageFilters.sepia}%)
        invert(${imageFilters.invert}%)
      `;
      
      ctx.drawImage(img, 0, 0, width, height);
    };
    
    img.src = resultUrl;
  };

  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    setImageFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setImageFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0,
      sepia: 0,
      invert: 0
    });
  };

  // Apply preset filters
  const applyPresetFilter = (preset) => {
    const presets = {
      original: { brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0, sepia: 0, invert: 0 },
      vintage: { brightness: 90, contrast: 110, saturation: 80, sepia: 40 },
      cool: { brightness: 100, contrast: 120, saturation: 90, hue: 180 },
      warm: { brightness: 110, contrast: 100, saturation: 120, hue: 30 },
      bw: { brightness: 100, contrast: 120, saturation: 0, sepia: 0 },
      dramatic: { brightness: 80, contrast: 150, saturation: 100 }
    };
    
    setImageFilters(prev => ({
      ...prev,
      ...presets[preset]
    }));
  };

  // Download edited image
  const downloadEditedImage = () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL('image/png');
      
      if (onDownloadEdited) {
        onDownloadEdited(url);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    if (resultUrl) {
      applyFilters();
    }
  }, [imageFilters, resultUrl, isMobile]);

  // Filter groups
  const adjustmentFilters = [
    { label: "Brightness", key: "brightness", min: 0, max: 200, unit: "%", icon: "☀️", defaultValue: 100 },
    { label: "Contrast", key: "contrast", min: 0, max: 200, unit: "%", icon: "⚡", defaultValue: 100 },
    { label: "Saturation", key: "saturation", min: 0, max: 200, unit: "%", icon: "🎨", defaultValue: 100 },
  ];

  const effectFilters = [
    { label: "Blur", key: "blur", min: 0, max: 10, unit: "px", icon: "🌀", defaultValue: 0 },
    { label: "Hue", key: "hue", min: 0, max: 360, unit: "°", icon: "🌈", defaultValue: 0 },
    { label: "Sepia", key: "sepia", min: 0, max: 100, unit: "%", icon: "📜", defaultValue: 0 },
    { label: "Invert", key: "invert", min: 0, max: 100, unit: "%", icon: "🔄", defaultValue: 0 },
  ];

  // Light theme color scheme matching your main website
  const colors = {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#1d4ed8',
    background: '#ffffff',
    backgroundLight: '#f8fafc',
    backgroundLighter: '#f1f5f9',
    text: '#1e293b',
    textSecondary: '#64748b',
    textLight: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    success: '#10b981',
    error: '#ef4444'
  };

  // Desktop Layout
  if (!isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${colors.backgroundLight} 0%, ${colors.background} 100%)`,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Light Theme Header */}
        <div
          style={{
            background: colors.background,
            padding: "1.25rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${colors.border}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                padding: "0.75rem 1.25rem",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.backgroundLighter;
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.color = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Results
            </button>
            
            <div style={{ 
              width: "1px", 
              height: "24px", 
              background: colors.border,
              opacity: 0.5 
            }} />
            
            <h1 style={{
              color: colors.text,
              fontSize: "20px",
              fontWeight: "700",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "14px",
                color: "white",
              }}>
                Q
              </div>
              Image Editor
            </h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={resetFilters}
              style={{
                background: "transparent",
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                padding: "0.75rem 1.25rem",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.backgroundLighter;
                e.currentTarget.style.color = colors.error;
                e.currentTarget.style.borderColor = colors.error;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = colors.textSecondary;
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              Reset All
            </button>
            
            <button
              onClick={downloadEditedImage}
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                display: "flex",
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Save Image
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            padding: "2rem",
            gap: "2rem",
            overflow: "hidden",
          }}
        >
          {/* Light Theme Sidebar */}
          <div
            style={{
              width: "380px",
              background: colors.background,
              borderRadius: "16px",
              padding: "1.5rem",
              border: `1px solid ${colors.border}`,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
              overflowY: "auto",
            }}
          >
            {/* Tab Navigation */}
            <div style={{ 
              display: "flex", 
              background: colors.backgroundLighter, 
              borderRadius: "12px", 
              padding: "4px",
              marginBottom: "2rem"
            }}>
              {[
                { id: 'adjust', label: 'Adjustments', icon: '🛠️' },
                { id: 'effects', label: 'Effects', icon: '✨' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    background: activeTab === tab.id ? colors.primary : 'transparent',
                    color: activeTab === tab.id ? '#fff' : colors.textSecondary,
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{
                fontSize: "14px",
                fontWeight: "700",
                color: colors.text,
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                opacity: 0.8,
              }}>
                🎨 Preset Styles
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.5rem",
              }}>
                {[
                  { name: "Original", preset: "original" },
                  { name: "Vintage", preset: "vintage" },
                  { name: "Cool", preset: "cool" },
                  { name: "Warm", preset: "warm" },
                  { name: "B&W", preset: "bw" },
                  { name: "Dramatic", preset: "dramatic" }
                ].map(({ name, preset }) => (
                  <button
                    key={preset}
                    onClick={() => applyPresetFilter(preset)}
                    style={{
                      background: "transparent",
                      color: colors.textSecondary,
                      border: `1px solid ${colors.border}`,
                      padding: "0.75rem 0.5rem",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.backgroundLighter;
                      e.currentTarget.style.color = colors.primary;
                      e.currentTarget.style.borderColor = colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = colors.textSecondary;
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {(activeTab === 'adjust' ? adjustmentFilters : effectFilters).map(({ label, key, min, max, unit, icon, defaultValue }) => (
                <div key={key} style={{
                  background: colors.backgroundLighter,
                  padding: "1.25rem",
                  borderRadius: "14px",
                  border: `1px solid ${colors.borderLight}`,
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ 
                        fontSize: "16px",
                        background: "rgba(59, 130, 246, 0.1)",
                        padding: "6px",
                        borderRadius: "8px",
                        color: colors.primary,
                      }}>
                        {icon}
                      </span>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: colors.text,
                      }}>
                        {label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "13px",
                      color: colors.primary,
                      fontWeight: "700",
                      background: "rgba(59, 130, 246, 0.1)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: `1px solid rgba(59, 130, 246, 0.2)`,
                    }}>
                      {imageFilters[key] > defaultValue ? '+' : ''}{imageFilters[key] - defaultValue}{unit}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={imageFilters[key]}
                    onChange={(e) => handleFilterChange(key, parseInt(e.target.value))}
                    style={{
                      width: "100%",
                      height: "6px",
                      borderRadius: "10px",
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
                      outline: "none",
                      cursor: "pointer",
                      WebkitAppearance: "none",
                    }}
                  />
                  
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: colors.textLight,
                    marginTop: "8px",
                    fontWeight: "500",
                  }}>
                    <span>{min}{unit}</span>
                    <span style={{ color: colors.primary }}>
                      Default: {defaultValue}{unit}
                    </span>
                    <span>{max}{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Light Theme Preview Area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: colors.backgroundLight,
              borderRadius: "16px",
              border: `1px solid ${colors.border}`,
              padding: "2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "2rem",
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                display: "inline-block",
                maxWidth: "100%",
                maxHeight: "100%",
                position: "relative",
                zIndex: 2,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  borderRadius: "12px",
                  display: "block",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
            
            {/* Live Preview Badge */}
            <div style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              zIndex: 3,
              boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: colors.success,
                animation: "pulse 2s infinite"
              }} />
              Live Preview
            </div>
          </div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid #3b82f6;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid #3b82f6;
            boxShadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // Mobile Layout - Light Theme
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.background,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Mobile Light Header */}
      <div
        style={{
          background: colors.background,
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`,
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <h1 style={{
          color: colors.text,
          fontSize: "16px",
          fontWeight: "700",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <div style={{
            width: "24px",
            height: "24px",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "12px",
            color: "white",
          }}>
            Q
          </div>
          Editor
        </h1>
        
        <button
          onClick={downloadEditedImage}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            color: "#fff",
            border: "none",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </div>

      {/* Mobile Image Preview */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          background: colors.backgroundLight,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "1.5rem",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            maxWidth: "calc(100% - 2rem)",
            maxHeight: "calc(100% - 2rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: "12px",
              display: "block",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
      </div>

      {/* Mobile Controls - Light Theme */}
      <div
        style={{
          background: colors.background,
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          padding: "1.5rem 1rem 2rem",
          borderTop: `1px solid ${colors.border}`,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          maxHeight: "45vh",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        {/* Mobile Tab Navigation */}
        <div style={{ 
          display: "flex", 
          background: colors.backgroundLighter, 
          borderRadius: "12px", 
          padding: "4px",
          marginBottom: "1.5rem"
        }}>
          {[
            { id: 'adjust', label: 'Adjust', icon: '🛠️' },
            { id: 'effects', label: 'Effects', icon: '✨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: activeTab === tab.id ? colors.primary : 'transparent',
                color: activeTab === tab.id ? '#fff' : colors.textSecondary,
                border: 'none',
                padding: '0.75rem 0.5rem',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls for Mobile */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {(activeTab === 'adjust' ? adjustmentFilters : effectFilters).map(({ label, key, min, max, unit, icon, defaultValue }) => (
            <div key={key}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: colors.primary }}>{icon}</span>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: colors.text,
                  }}>
                    {label}
                  </span>
                </div>
                <span style={{
                  fontSize: "13px",
                  color: colors.primary,
                  fontWeight: "700",
                  background: "rgba(59, 130, 246, 0.1)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                }}>
                  {imageFilters[key] > defaultValue ? '+' : ''}{imageFilters[key] - defaultValue}{unit}
                </span>
              </div>
              
              <input
                type="range"
                min={min}
                max={max}
                value={imageFilters[key]}
                onChange={(e) => handleFilterChange(key, parseInt(e.target.value))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "10px",
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
                  outline: "none",
                  cursor: "pointer",
                  WebkitAppearance: "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Mobile Quick Presets */}
        <div style={{ marginTop: "1.5rem" }}>
          <h3 style={{
            fontSize: "14px",
            fontWeight: "700",
            color: colors.text,
            marginBottom: "0.75rem",
            opacity: 0.8,
          }}>
            🎨 Styles
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem",
          }}>
            {[
              { name: "Original", preset: "original" },
              { name: "Vintage", preset: "vintage" },
              { name: "Cool", preset: "cool" },
              { name: "Warm", preset: "warm" },
              { name: "B&W", preset: "bw" },
              { name: "Dramatic", preset: "dramatic" }
            ].map(({ name, preset }) => (
              <button
                key={preset}
                onClick={() => applyPresetFilter(preset)}
                style={{
                  background: "transparent",
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  padding: "0.5rem 0.25rem",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
