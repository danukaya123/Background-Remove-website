import { useState, useRef, useEffect } from 'react';

const FotorImageEditor = () => {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Editing states
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    exposure: 0,
    temperature: 0,
    vignette: 0,
    blur: 0,
    sharpen: 0
  });

  const [filters, setFilters] = useState({
    vintage: 0,
    dramatic: 0,
    cinematic: 0,
    nostalgic: 0,
    fade: 0,
    glow: 0
  });

  const [activeTab, setActiveTab] = useState('adjust');
  const [uploadedImages, setUploadedImages] = useState([]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setOriginalImage(img);
          initializeCanvas(img);
          // Add to uploaded images gallery
          setUploadedImages(prev => [...prev, e.target.result].slice(-4));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const initializeCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const maxWidth = isMobile ? window.innerWidth - 40 : 600;
    const scale = Math.min(maxWidth / img.width, 1);
    
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    drawImageOnCanvas(img);
  };

  const drawImageOnCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    const filterString = `
      brightness(${adjustments.brightness}%)
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      blur(${adjustments.blur}px)
    `;

    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply advanced effects
    applyAdvancedEffects(ctx, canvas.width, canvas.height);
  };

  const applyAdvancedEffects = (ctx, width, height) => {
    // Exposure adjustment
    if (adjustments.exposure !== 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const exposure = adjustments.exposure / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + exposure * 255); // Red
        data[i + 1] = Math.min(255, data[i + 1] + exposure * 255); // Green
        data[i + 2] = Math.min(255, data[i + 2] + exposure * 255); // Blue
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Temperature effect
    if (adjustments.temperature !== 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const temp = adjustments.temperature / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + (temp > 0 ? temp * 50 : 0)); // Warm - add red
        data[i + 2] = Math.min(255, data[i + 2] + (temp < 0 ? -temp * 50 : 0)); // Cool - add blue
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Vignette effect
    if (adjustments.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${adjustments.vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Apply filter presets
    applyFilterPresets(ctx, width, height);
  };

  const applyFilterPresets = (ctx, width, height) => {
    // Vintage filter
    if (filters.vintage > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const intensity = filters.vintage / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        // Sepia tone effect
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        data[i] = Math.min(255, (r * 0.393 + g * 0.769 + b * 0.189) * intensity + r * (1 - intensity));
        data[i + 1] = Math.min(255, (r * 0.349 + g * 0.686 + b * 0.168) * intensity + g * (1 - intensity));
        data[i + 2] = Math.min(255, (r * 0.272 + g * 0.534 + b * 0.131) * intensity + b * (1 - intensity));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Dramatic filter
    if (filters.dramatic > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const intensity = filters.dramatic / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast
        const factor = (259 * (intensity * 150 + 255)) / (255 * (259 - intensity * 150));
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }
      ctx.putImageData(imageData, 0, 0);
    }
  };

  // Update canvas when adjustments change
  useEffect(() => {
    if (image) {
      drawImageOnCanvas(image);
    }
  }, [adjustments, filters, image]);

  const handleAdjustmentChange = (adjustment, value) => {
    setAdjustments(prev => ({ ...prev, [adjustment]: value }));
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const resetAll = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 0,
      temperature: 0,
      vignette: 0,
      blur: 0,
      sharpen: 0
    });
    setFilters({
      vintage: 0,
      dramatic: 0,
      cinematic: 0,
      nostalgic: 0,
      fade: 0,
      glow: 0
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `fotor-edited-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Quick adjustment presets
  const quickPresets = [
    { name: 'Auto Enhance', icon: '⚡', values: { brightness: 110, contrast: 110, saturation: 110 } },
    { name: 'Portrait', icon: '👤', values: { brightness: 105, contrast: 105, saturation: 95, blur: 2 } },
    { name: 'Landscape', icon: '🏞️', values: { brightness: 105, contrast: 115, saturation: 120 } },
    { name: 'Vintage', icon: '📻', values: { temperature: 25, vintage: 80 } },
    { name: 'Dramatic', icon: '🎭', values: { contrast: 130, vignette: 30 } },
    { name: 'Cinematic', icon: '🎬', values: { contrast: 120, saturation: 95, vignette: 25 } }
  ];

  const applyQuickPreset = (preset) => {
    setAdjustments(prev => ({ ...prev, ...preset.values }));
    if (preset.values.vintage) {
      setFilters(prev => ({ ...prev, vintage: preset.values.vintage }));
    }
  };

  // Enhanced Slider Component
  const EditorSlider = ({ 
    label, 
    value, 
    min, 
    max, 
    onChange, 
    unit = '',
    defaultValue = 0,
    icon = '⚡'
  }) => {
    const sliderRef = useRef(null);

    const handleMouseDown = (e) => {
      const updateValue = (e) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        let percentage = (e.clientX - rect.left) / rect.width;
        percentage = Math.min(Math.max(percentage, 0), 1);
        const newValue = Math.round(min + percentage * (max - min));
        onChange(newValue);
      };

      updateValue(e);
      
      const handleMouseMove = (e) => updateValue(e);
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e) => {
      const updateValue = (touch) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        let percentage = (touch.clientX - rect.left) / rect.width;
        percentage = Math.min(Math.max(percentage, 0), 1);
        const newValue = Math.round(min + percentage * (max - min));
        onChange(newValue);
      };

      updateValue(e.touches[0]);
      
      const handleTouchMove = (e) => updateValue(e.touches[0]);
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    };

    const progress = ((value - min) / (max - min)) * 100;

    return (
      <div className="editor-slider">
        <div className="slider-header">
          <span className="slider-label">
            <span className="slider-icon">{icon}</span>
            {label}
          </span>
          <span className="slider-value">{value}{unit}</span>
        </div>
        <div 
          ref={sliderRef}
          className="slider-track"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div 
            className="slider-progress" 
            style={{ width: `${progress}%` }}
          />
          <div 
            className="slider-thumb" 
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fotor-editor">
      {/* Header */}
      <header className="editor-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Fotor</h1>
            <span className="tagline">AI Photo Editor</span>
          </div>
          <div className="header-actions">
            <button className="premium-btn">
              🔥 Up to 10% Off
            </button>
          </div>
        </div>
      </header>

      <div className="editor-main">
        {/* Sidebar - Upload Section */}
        <aside className="editor-sidebar">
          <div className="upload-section">
            <h3>Upload Image</h3>
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">📁</div>
              <span>Click to Upload</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="uploaded-gallery">
                <h4>Recent Images</h4>
                <div className="gallery-grid">
                  {uploadedImages.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Uploaded ${index}`}
                      className="gallery-thumb"
                      onClick={() => {
                        const img = new Image();
                        img.onload = () => {
                          setImage(img);
                          initializeCanvas(img);
                        };
                        img.src = src;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Tools Section */}
          <div className="ai-tools-section">
            <h3>AI Tools</h3>
            <div className="ai-tools-grid">
              <button className="ai-tool-btn">
                <span className="ai-icon">🎨</span>
                AI Enhance
              </button>
              <button className="ai-tool-btn">
                <span className="ai-icon">🔍</span>
                AI Background
              </button>
              <button className="ai-tool-btn">
                <span className="ai-icon">✨</span>
                AI Effects
              </button>
              <button className="ai-tool-btn">
                <span className="ai-icon">🎭</span>
                AI Portrait
              </button>
            </div>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="editor-content">
          {/* Preview Canvas */}
          <div className="preview-section">
            <div className="preview-container">
              {image ? (
                <canvas
                  ref={canvasRef}
                  className="preview-canvas"
                />
              ) : (
                <div className="empty-preview">
                  <div className="empty-icon">🖼️</div>
                  <h3>No Image Selected</h3>
                  <p>Upload an image to start editing</p>
                  <button 
                    className="upload-prompt-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Editing Controls */}
          <div className="controls-section">
            {/* Quick Presets */}
            <div className="presets-section">
              <h3>Quick Adjustments</h3>
              <div className="presets-grid">
                {quickPresets.map((preset, index) => (
                  <button
                    key={index}
                    className="preset-btn"
                    onClick={() => applyQuickPreset(preset)}
                  >
                    <span className="preset-icon">{preset.icon}</span>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-navigation">
              <button
                className={`tab-btn ${activeTab === 'adjust' ? 'active' : ''}`}
                onClick={() => setActiveTab('adjust')}
              >
                🎛️ Adjust
              </button>
              <button
                className={`tab-btn ${activeTab === 'filters' ? 'active' : ''}`}
                onClick={() => setActiveTab('filters')}
              >
                ✨ Filters
              </button>
              <button
                className={`tab-btn ${activeTab === 'effects' ? 'active' : ''}`}
                onClick={() => setActiveTab('effects')}
              >
                ⚡ Effects
              </button>
            </div>

            {/* Controls Content */}
            <div className="controls-content">
              {activeTab === 'adjust' && (
                <div className="tab-panel">
                  <h4>Basic Adjustments</h4>
                  <div className="sliders-grid">
                    <EditorSlider
                      label="Brightness"
                      value={adjustments.brightness}
                      min={0}
                      max={200}
                      onChange={(value) => handleAdjustmentChange('brightness', value)}
                      unit="%"
                      icon="☀️"
                    />
                    <EditorSlider
                      label="Contrast"
                      value={adjustments.contrast}
                      min={0}
                      max={200}
                      onChange={(value) => handleAdjustmentChange('contrast', value)}
                      unit="%"
                      icon="⚫"
                    />
                    <EditorSlider
                      label="Saturation"
                      value={adjustments.saturation}
                      min={0}
                      max={200}
                      onChange={(value) => handleAdjustmentChange('saturation', value)}
                      unit="%"
                      icon="🎨"
                    />
                    <EditorSlider
                      label="Exposure"
                      value={adjustments.exposure}
                      min={-100}
                      max={100}
                      onChange={(value) => handleAdjustmentChange('exposure', value)}
                      icon="📷"
                    />
                    <EditorSlider
                      label="Temperature"
                      value={adjustments.temperature}
                      min={-100}
                      max={100}
                      onChange={(value) => handleAdjustmentChange('temperature', value)}
                      icon="🌡️"
                    />
                    <EditorSlider
                      label="Vignette"
                      value={adjustments.vignette}
                      min={0}
                      max={100}
                      onChange={(value) => handleAdjustmentChange('vignette', value)}
                      unit="%"
                      icon="⭕"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'filters' && (
                <div className="tab-panel">
                  <h4>Creative Filters</h4>
                  <div className="sliders-grid">
                    <EditorSlider
                      label="Vintage"
                      value={filters.vintage}
                      min={0}
                      max={100}
                      onChange={(value) => handleFilterChange('vintage', value)}
                      unit="%"
                      icon="📻"
                    />
                    <EditorSlider
                      label="Dramatic"
                      value={filters.dramatic}
                      min={0}
                      max={100}
                      onChange={(value) => handleFilterChange('dramatic', value)}
                      unit="%"
                      icon="🎭"
                    />
                    <EditorSlider
                      label="Cinematic"
                      value={filters.cinematic}
                      min={0}
                      max={100}
                      onChange={(value) => handleFilterChange('cinematic', value)}
                      unit="%"
                      icon="🎬"
                    />
                    <EditorSlider
                      label="Fade"
                      value={filters.fade}
                      min={0}
                      max={100}
                      onChange={(value) => handleFilterChange('fade', value)}
                      unit="%"
                      icon="🌫️"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'effects' && (
                <div className="tab-panel">
                  <h4>Advanced Effects</h4>
                  <div className="sliders-grid">
                    <EditorSlider
                      label="Blur"
                      value={adjustments.blur}
                      min={0}
                      max={20}
                      onChange={(value) => handleAdjustmentChange('blur', value)}
                      unit="px"
                      icon="🌀"
                    />
                    <EditorSlider
                      label="Sharpen"
                      value={adjustments.sharpen}
                      min={0}
                      max={100}
                      onChange={(value) => handleAdjustmentChange('sharpen', value)}
                      unit="%"
                      icon="🔍"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="action-btn reset" onClick={resetAll}>
                ↺ Reset All
              </button>
              <button 
                className="action-btn download" 
                onClick={handleDownload}
                disabled={!image}
              >
                ⬇️ Download Image
              </button>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .fotor-editor {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header */
        .editor-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .logo-section h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline {
          color: #666;
          font-size: 14px;
          margin-left: 12px;
        }

        .premium-btn {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
          transition: all 0.3s ease;
        }

        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
        }

        /* Main Layout */
        .editor-main {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          gap: 24px;
          min-height: calc(100vh - 80px);
        }

        /* Sidebar */
        .editor-sidebar {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .upload-section, .ai-tools-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .upload-section h3, .ai-tools-section h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }

        .upload-area {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8fafc;
        }

        .upload-area:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.7;
        }

        .uploaded-gallery {
          margin-top: 20px;
        }

        .uploaded-gallery h4 {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .gallery-thumb {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .gallery-thumb:hover {
          transform: scale(1.05);
          border-color: #667eea;
        }

        /* AI Tools */
        .ai-tools-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .ai-tool-btn {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .ai-tool-btn:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .ai-icon {
          font-size: 20px;
        }

        /* Main Content */
        .editor-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Preview Section */
        .preview-section {
          flex: 1;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-canvas {
          max-width: 100%;
          max-height: 500px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .empty-preview {
          text-align: center;
          color: #666;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .upload-prompt-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
          transition: all 0.3s ease;
        }

        .upload-prompt-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* Controls Section */
        .controls-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Presets */
        .presets-section h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .preset-btn {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .preset-btn:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .preset-icon {
          font-size: 20px;
        }

        /* Tabs */
        .tabs-navigation {
          display: flex;
          background: #f8fafc;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .tab-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Sliders */
        .sliders-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .editor-slider {
          background: white;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .slider-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #334155;
        }

        .slider-icon {
          font-size: 16px;
        }

        .slider-value {
          font-weight: 600;
          color: #667eea;
          background: #f0f4ff;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        .slider-track {
          position: relative;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          cursor: pointer;
        }

        .slider-progress {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 3px;
          transition: width 0.1s ease;
        }

        .slider-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 18px;
          height: 18px;
          background: white;
          border: 3px solid #667eea;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
          cursor: grab;
        }

        .slider-thumb:active {
          cursor: grabbing;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .action-btn {
          flex: 1;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.reset {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .action-btn.reset:hover {
          background: #f1f5f9;
        }

        .action-btn.download {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .action-btn.download:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .editor-main {
            flex-direction: column;
            padding: 16px;
            gap: 16px;
          }

          .editor-sidebar {
            width: 100%;
            order: 2;
          }

          .editor-content {
            order: 1;
          }

          .header-content {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .presets-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .ai-tools-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .gallery-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .preview-section {
            min-height: 300px;
          }

          .preview-canvas {
            max-height: 300px;
          }
        }

        @media (max-width: 480px) {
          .presets-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ai-tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tabs-navigation {
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FotorImageEditor;
