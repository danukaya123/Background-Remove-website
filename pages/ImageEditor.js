import { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ imageUrl, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('filters');
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Editing states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    exposure: 0,
    vignette: 0,
    sepia: 0,
    noise: 0,
    temperature: 0,
    sharpen: 0
  });

  const [effects, setEffects] = useState({
    vintage: 0,
    dramatic: 0,
    cinematic: 0,
    nostalgic: 0,
    lomo: 0,
    clarity: 0
  });

  const [background, setBackground] = useState({
    type: 'transparent',
    color: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    customColor: '#3B82F6'
  });

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load image and initialize canvas
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImage(img);
        initializeCanvas(img);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const initializeCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const maxWidth = isMobile ? window.innerWidth - 80 : 600;
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

    // Apply background
    if (background.type !== 'transparent') {
      if (background.type === 'color') {
        ctx.fillStyle = background.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background.type === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const colors = background.gradient.match(/#[a-fA-F0-9]{6}/g);
        if (colors) {
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(1, colors[1] || colors[0]);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background.type === 'custom') {
        ctx.fillStyle = background.customColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Apply all filters and effects
    const filterString = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      hue-rotate(${filters.hue}deg)
      blur(${filters.blur}px)
      sepia(${filters.sepia}%)
    `;

    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply advanced effects
    applyAdvancedEffects(ctx, canvas.width, canvas.height);
  };

  const applyAdvancedEffects = (ctx, width, height) => {
    // Vignette effect
    if (filters.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Noise effect
    if (filters.noise > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const intensity = filters.noise / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * 255 * intensity;
        data[i] = Math.max(0, Math.min(255, data[i] + grain));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Apply effect presets
    applyEffectPresets(ctx, width, height);
  };

  const applyEffectPresets = (ctx, width, height) => {
    // Vintage effect
    if (effects.vintage > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const intensity = effects.vintage / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        // Add warm tone
        data[i] = Math.min(255, data[i] + 20 * intensity);
        data[i + 2] = Math.max(0, data[i + 2] - 10 * intensity);
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Dramatic effect
    if (effects.dramatic > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const intensity = effects.dramatic / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast
        const factor = (259 * (intensity * 100 + 255)) / (255 * (259 - intensity * 100));
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }
      ctx.putImageData(imageData, 0, 0);
    }
  };

  // Update canvas when filters change
  useEffect(() => {
    if (image) {
      drawImageOnCanvas(image);
    }
  }, [filters, effects, background, image]);

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const handleEffectChange = (effect, value) => {
    setEffects(prev => ({ ...prev, [effect]: value }));
  };

  const handleBackgroundChange = (type, value) => {
    setBackground(prev => ({ ...prev, type, [type]: value }));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `premium-edit-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetAll = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      exposure: 0,
      vignette: 0,
      sepia: 0,
      noise: 0,
      temperature: 0,
      sharpen: 0
    });
    setEffects({
      vintage: 0,
      dramatic: 0,
      cinematic: 0,
      nostalgic: 0,
      lomo: 0,
      clarity: 0
    });
    setBackground({
      type: 'transparent',
      color: '#ffffff',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      customColor: '#3B82F6'
    });
  };

  const quickPresets = {
    enhance: { brightness: 110, contrast: 110, saturation: 110, clarity: 50 },
    portrait: { brightness: 105, contrast: 105, saturation: 95, sharpen: 20 },
    landscape: { brightness: 105, contrast: 115, saturation: 120, vibrance: 30 },
    moody: { brightness: 85, contrast: 120, saturation: 90, vignette: 40 },
    vibrant: { brightness: 110, contrast: 110, saturation: 130, hue: 5 }
  };

  const applyQuickPreset = (preset) => {
    setFilters(prev => ({ ...prev, ...quickPresets[preset] }));
  };

  const gradientPresets = [
    { name: 'Sunset', value: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { name: 'Forest', value: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    { name: 'Sunrise', value: 'linear-gradient(135deg, #fa709a, #fee140)' },
    { name: 'Royal', value: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
    { name: 'Mystic', value: 'linear-gradient(135deg, #cd9cf2, #f6f3ff)' }
  ];

  const solidColors = [
    '#FFFFFF', '#000000', '#3B82F6', '#10B981', '#EF4444', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const EffectSlider = ({ label, value, min, max, onChange, unit = '%' }) => {
    const handleMouseDown = (e) => {
      setIsDragging(true);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e) => {
      setIsDragging(true);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const newValue = Math.round(min + percentage * (max - min));
      onChange(newValue);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      const percentage = Math.min(Math.max((touch.clientX - rect.left) / rect.width, 0), 1);
      const newValue = Math.round(min + percentage * (max - min));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    const handleClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const newValue = Math.round(min + percentage * (max - min));
      onChange(newValue);
    };

    const progress = ((value - min) / (max - min)) * 100;

    return (
      <div className="effect-slider">
        <div className="slider-header">
          <span className="slider-label">{label}</span>
          <span className="slider-value">{value}{unit}</span>
        </div>
        <div 
          className="slider-track"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
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
    <div className="premium-editor-overlay">
      <div className="premium-editor-container">
        {/* Header */}
        <div className="editor-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="editor-logo">
                <span className="logo-icon">🎨</span>
              </div>
              <div className="header-text">
                <h1>Premium Editor</h1>
                <p>Professional photo editing tools</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <span>×</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="editor-content">
          {/* Preview Section - Always Visible */}
          <div className="preview-section">
            <div className="preview-container">
              <div className="canvas-frame">
                <canvas
                  ref={canvasRef}
                  className="preview-canvas"
                />
              </div>
              <div className="preview-overlay">
                <div className="preview-info">
                  <span>Live Preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="controls-section">
            {/* Quick Presets */}
            <div className="presets-panel">
              <h3>Quick Presets</h3>
              <div className="presets-grid">
                {Object.keys(quickPresets).map(preset => (
                  <button
                    key={preset}
                    onClick={() => applyQuickPreset(preset)}
                    className="preset-btn"
                  >
                    <span className="preset-icon">✨</span>
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-navigation">
              {[
                { id: 'filters', icon: '🔧', label: 'Adjust' },
                { id: 'effects', icon: '🌟', label: 'Effects' },
                { id: 'background', icon: '🎨', label: 'Background' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Controls Content */}
            <div className="controls-content">
              {/* Filters Tab */}
              {activeTab === 'filters' && (
                <div className="tab-panel">
                  <h4>Image Adjustments</h4>
                  <div className="sliders-grid">
                    <EffectSlider
                      label="Brightness"
                      value={filters.brightness}
                      min={0}
                      max={200}
                      onChange={(value) => handleFilterChange('brightness', value)}
                    />
                    <EffectSlider
                      label="Contrast"
                      value={filters.contrast}
                      min={0}
                      max={200}
                      onChange={(value) => handleFilterChange('contrast', value)}
                    />
                    <EffectSlider
                      label="Saturation"
                      value={filters.saturation}
                      min={0}
                      max={200}
                      onChange={(value) => handleFilterChange('saturation', value)}
                    />
                    <EffectSlider
                      label="Exposure"
                      value={filters.exposure}
                      min={-100}
                      max={100}
                      onChange={(value) => handleFilterChange('exposure', value)}
                    />
                    <EffectSlider
                      label="Vignette"
                      value={filters.vignette}
                      min={0}
                      max={100}
                      onChange={(value) => handleFilterChange('vignette', value)}
                    />
                    <EffectSlider
                      label="Blur"
                      value={filters.blur}
                      min={0}
                      max={20}
                      unit="px"
                      onChange={(value) => handleFilterChange('blur', value)}
                    />
                  </div>
                </div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className="tab-panel">
                  <h4>Creative Effects</h4>
                  <div className="sliders-grid">
                    <EffectSlider
                      label="Vintage"
                      value={effects.vintage}
                      min={0}
                      max={100}
                      onChange={(value) => handleEffectChange('vintage', value)}
                    />
                    <EffectSlider
                      label="Dramatic"
                      value={effects.dramatic}
                      min={0}
                      max={100}
                      onChange={(value) => handleEffectChange('dramatic', value)}
                    />
                    <EffectSlider
                      label="Cinematic"
                      value={effects.cinematic}
                      min={0}
                      max={100}
                      onChange={(value) => handleEffectChange('cinematic', value)}
                    />
                    <EffectSlider
                      label="Sepia"
                      value={filters.sepia}
                      min={0}
                      max={100}
                      onChange={(value) => handleFilterChange('sepia', value)}
                    />
                    <EffectSlider
                      label="Noise"
                      value={filters.noise}
                      min={0}
                      max={100}
                      onChange={(value) => handleFilterChange('noise', value)}
                    />
                    <EffectSlider
                      label="Temperature"
                      value={filters.temperature}
                      min={-100}
                      max={100}
                      onChange={(value) => handleFilterChange('temperature', value)}
                    />
                  </div>
                </div>
              )}

              {/* Background Tab */}
              {activeTab === 'background' && (
                <div className="tab-panel">
                  <h4>Background Options</h4>
                  
                  <div className="background-options">
                    <div className="option-group">
                      <label>Background Type</label>
                      <div className="type-buttons">
                        <button
                          onClick={() => handleBackgroundChange('type', 'transparent')}
                          className={`type-btn ${background.type === 'transparent' ? 'active' : ''}`}
                        >
                          Transparent
                        </button>
                        <button
                          onClick={() => handleBackgroundChange('type', 'color')}
                          className={`type-btn ${background.type === 'color' ? 'active' : ''}`}
                        >
                          Solid Color
                        </button>
                        <button
                          onClick={() => handleBackgroundChange('type', 'gradient')}
                          className={`type-btn ${background.type === 'gradient' ? 'active' : ''}`}
                        >
                          Gradient
                        </button>
                      </div>
                    </div>

                    {background.type === 'color' && (
                      <div className="color-picker-section">
                        <label>Solid Colors</label>
                        <div className="color-grid">
                          {solidColors.map(color => (
                            <div
                              key={color}
                              onClick={() => handleBackgroundChange('color', color)}
                              className={`color-swatch ${background.color === color ? 'active' : ''}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {background.type === 'gradient' && (
                      <div className="gradient-section">
                        <label>Gradient Presets</label>
                        <div className="gradient-grid">
                          {gradientPresets.map((gradient, index) => (
                            <div
                              key={index}
                              onClick={() => handleBackgroundChange('gradient', gradient.value)}
                              className={`gradient-preset ${background.gradient === gradient.value ? 'active' : ''}`}
                              style={{ background: gradient.value }}
                              title={gradient.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={resetAll} className="reset-btn">
                <span>🔄</span>
                Reset All
              </button>
              <button onClick={handleDownload} className="download-btn">
                <span>💾</span>
                Download Image
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .premium-editor-container {
          background: white;
          border-radius: 24px;
          width: 95%;
          max-width: 1400px;
          height: 95%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 32px 64px rgba(0,0,0,0.3);
          overflow: hidden;
        }

        /* Header */
        .editor-header {
          padding: 24px 32px;
          background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
          color: white;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .editor-logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .header-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-text p {
          margin: 4px 0 0 0;
          color: #d1d5db;
          font-size: 14px;
        }

        .close-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 20px;
          cursor: pointer;
          color: white;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: rotate(90deg);
        }

        /* Main Content */
        .editor-content {
          display: flex;
          flex: 1;
          overflow: hidden;
          flex-direction: ${isMobile ? 'column' : 'row'};
        }

        /* Preview Section */
        .preview-section {
          flex: ${isMobile ? '1' : '1.5'};
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${isMobile ? '20px' : '40px'};
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
        }

        .preview-container {
          position: relative;
          max-width: 100%;
          max-height: 100%;
        }

        .canvas-frame {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }

        .preview-canvas {
          max-width: 100%;
          max-height: ${isMobile ? '50vh' : '70vh'};
          display: block;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }

        .preview-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .preview-info {
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Controls Section */
        .controls-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          border-left: ${isMobile ? 'none' : '1px solid #e5e7eb'};
          border-top: ${isMobile ? '1px solid #e5e7eb' : 'none'};
          max-height: ${isMobile ? '50vh' : 'none'};
          overflow-y: auto;
        }

        /* Presets Panel */
        .presets-panel {
          padding: 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .presets-panel h3 {
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 700;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .preset-btn {
          background: white;
          border: 2px solid #e5e7eb;
          padding: 12px 8px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .preset-btn:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .preset-icon {
          font-size: 14px;
        }

        /* Tabs Navigation */
        .tabs-navigation {
          display: flex;
          padding: 0 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
        }

        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff, #f0f9ff);
        }

        .tab-btn:hover {
          color: #3b82f6;
          background: #f9fafb;
        }

        /* Controls Content */
        .controls-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .tab-panel h4 {
          margin: 0 0 20px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 700;
        }

        .sliders-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Effect Slider */
        .effect-slider {
          margin-bottom: 8px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .slider-label {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .slider-value {
          color: #3b82f6;
          font-size: 12px;
          font-weight: 700;
          background: #eff6ff;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .slider-track {
          position: relative;
          height: 6px;
          background: #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slider-track:hover {
          background: #d1d5db;
        }

        .slider-progress {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          transition: width 0.2s ease;
        }

        .slider-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          cursor: grab;
          transition: all 0.2s ease;
        }

        .slider-thumb:active {
          cursor: grabbing;
          transform: translate(-50%, -50%) scale(1.1);
        }

        /* Background Options */
        .background-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .option-group label {
          display: block;
          color: #374151;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
        }

        .type-buttons {
          display: flex;
          gap: 8px;
        }

        .type-btn {
          flex: 1;
          background: white;
          border: 2px solid #e5e7eb;
          padding: 12px 8px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          transition: all 0.3s ease;
        }

        .type-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .color-swatch {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          cursor: pointer;
          border: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .color-swatch.active {
          border-color: #3b82f6;
          transform: scale(1.1);
        }

        .gradient-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .gradient-preset {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          cursor: pointer;
          border: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .gradient-preset.active {
          border-color: #3b82f6;
          transform: scale(1.05);
        }

        /* Action Buttons */
        .action-buttons {
          padding: 24px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          gap: 12px;
        }

        .reset-btn, .download-btn {
          flex: 1;
          padding: 16px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: none;
        }

        .reset-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .reset-btn:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .download-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        /* Mobile Optimizations */
        @media (max-width: 767px) {
          .premium-editor-overlay {
            padding: 0;
          }

          .premium-editor-container {
            width: 100%;
            height: 100%;
            border-radius: 0;
          }

          .editor-header {
            padding: 16px 20px;
          }

          .header-text h1 {
            font-size: 20px;
          }

          .preview-section {
            padding: 16px;
          }

          .canvas-frame {
            padding: 16px;
          }

          .presets-panel, .controls-content {
            padding: 20px;
          }

          .action-buttons {
            padding: 20px;
            flex-direction: column;
          }

          .type-buttons {
            flex-direction: column;
          }

          .color-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .gradient-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Hide scrollbar for controls */
        .controls-section::-webkit-scrollbar {
          width: 6px;
        }

        .controls-section::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .controls-section::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .controls-section::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;
