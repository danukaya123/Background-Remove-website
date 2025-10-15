import { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ imageUrl, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('adjust');
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Enhanced editing states with proper ranges
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    exposure: 0,
    vignette: 0,
    blur: 0,
    temperature: 0,
    clarity: 0
  });

  const [effects, setEffects] = useState({
    vintage: 0,
    dramatic: 0,
    cinematic: 0,
    nostalgic: 0,
    fade: 0,
    glow: 0
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
      }
    }

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

    // Temperature effect (warm/cool)
    if (adjustments.temperature !== 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const temp = adjustments.temperature / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        // Warm (positive temp) adds red, cool (negative temp) adds blue
        data[i] = Math.min(255, data[i] + (temp > 0 ? temp * 50 : 0)); // Red
        data[i + 2] = Math.min(255, data[i + 2] + (temp < 0 ? -temp * 50 : 0)); // Blue
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
        // Add warm brown tone
        data[i] = Math.min(255, data[i] + 20 * intensity);
        data[i + 1] = Math.min(255, data[i + 1] + 10 * intensity);
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
        // Increase contrast dramatically
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
  }, [adjustments, effects, background, image]);

  const handleAdjustmentChange = (adjustment, value) => {
    setAdjustments(prev => ({ ...prev, [adjustment]: value }));
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
    link.download = `edited-image-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetAll = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 0,
      vignette: 0,
      blur: 0,
      temperature: 0,
      clarity: 0
    });
    setEffects({
      vintage: 0,
      dramatic: 0,
      cinematic: 0,
      nostalgic: 0,
      fade: 0,
      glow: 0
    });
    setBackground({
      type: 'transparent',
      color: '#ffffff',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      customColor: '#3B82F6'
    });
  };

  // Quick presets data
  const quickPresets = [
    { name: 'Enhance', icon: '✨', values: { brightness: 110, contrast: 110, saturation: 110, clarity: 30 } },
    { name: 'Portrait', icon: '👤', values: { brightness: 105, contrast: 105, saturation: 95 } },
    { name: 'Landscape', icon: '🏞️', values: { brightness: 105, contrast: 115, saturation: 120 } },
    { name: 'Moody', icon: '🌑', values: { brightness: 85, contrast: 120, saturation: 90, vignette: 40 } },
    { name: 'Vibrant', icon: '🎨', values: { brightness: 110, contrast: 110, saturation: 130 } },
    { name: 'Cinematic', icon: '🎬', values: { brightness: 90, contrast: 120, saturation: 95, vignette: 25 } },
    { name: 'Vintage', icon: '📻', values: { brightness: 95, contrast: 105, saturation: 85, temperature: 25 } },
    { name: 'Dramatic', icon: '⚡', values: { brightness: 80, contrast: 130, saturation: 95, vignette: 35 } },
    { name: 'Clean', icon: '🧼', values: { brightness: 105, contrast: 105, saturation: 100 } },
    { name: 'Warm', icon: '☀️', values: { brightness: 105, contrast: 105, saturation: 110, temperature: 15 } }
  ];

  const applyQuickPreset = (preset) => {
    setAdjustments(prev => ({ ...prev, ...preset.values }));
  };

  // Premium Draggable Slider Component
  const PremiumSlider = ({ 
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
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
      setIsDragging(true);
      updateValue(e);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e) => {
      setIsDragging(true);
      updateValue(e.touches[0]);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      updateValue(e);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      updateValue(e.touches[0]);
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

    const updateValue = (e) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      let percentage = (e.clientX - rect.left) / rect.width;
      percentage = Math.min(Math.max(percentage, 0), 1);
      const newValue = Math.round(min + percentage * (max - min));
      onChange(newValue);
    };

    const resetToDefault = () => {
      onChange(defaultValue);
    };

    const progress = ((value - min) / (max - min)) * 100;
    const isDefault = value === defaultValue;

    return (
      <div className="premium-slider-container">
        <div className="slider-header">
          <div className="slider-label-group">
            <span className="slider-icon">{icon}</span>
            <span className="slider-label">{label}</span>
          </div>
          <div className="slider-controls">
            <span className={`slider-value ${value !== defaultValue ? 'active' : ''}`}>
              {value > 0 ? '+' : ''}{value}{unit}
            </span>
            <button 
              className={`reset-slider-btn ${!isDefault ? 'visible' : ''}`}
              onClick={resetToDefault}
              title="Reset to default"
            >
              ↺
            </button>
          </div>
        </div>
        <div 
          ref={sliderRef}
          className={`slider-track ${isDragging ? 'dragging' : ''}`}
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

  // Slider icons mapping
  const sliderIcons = {
    brightness: '☀️',
    contrast: '⚫',
    saturation: '🎨',
    exposure: '📷',
    vignette: '⭕',
    blur: '🌀',
    temperature: '🌡️',
    clarity: '🔍',
    vintage: '📻',
    dramatic: '⚡',
    cinematic: '🎬',
    fade: '🌫️',
    glow: '💫'
  };

  return (
    <div className="editor-overlay">
      <div className="editor-container">
        {/* Header */}
        <div className="editor-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Image Editor Pro</h1>
              <p>Professional editing tools at your fingertips</p>
            </div>
            <div className="header-actions">
              <button onClick={resetAll} className="header-btn secondary">
                Reset All
              </button>
              <button onClick={handleDownload} className="header-btn primary">
                Download
              </button>
              <button className="close-btn" onClick={onClose}>
                <span>×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="editor-main">
          {/* Preview Section - Always visible on mobile */}
          <div className="preview-section">
            <div className="preview-container">
              <div className="preview-header">
                <div className="preview-badge">
                  <span>Live Preview</span>
                </div>
                <div className="preview-actions">
                  <button className="preview-action-btn" onClick={resetAll}>
                    ↺ Reset
                  </button>
                </div>
              </div>
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  className="preview-canvas"
                />
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="controls-section">
            {/* Quick Presets */}
            <div className="presets-section">
              <h3>Quick Presets</h3>
              <div className="presets-scroll">
                {quickPresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyQuickPreset(preset)}
                    className="preset-card"
                  >
                    <span className="preset-icon">{preset.icon}</span>
                    <span className="preset-name">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-navigation">
              <button
                onClick={() => setActiveTab('adjust')}
                className={`tab-btn ${activeTab === 'adjust' ? 'active' : ''}`}
              >
                <span className="tab-icon">🎛️</span>
                Adjust
              </button>
              <button
                onClick={() => setActiveTab('effects')}
                className={`tab-btn ${activeTab === 'effects' ? 'active' : ''}`}
              >
                <span className="tab-icon">✨</span>
                Effects
              </button>
              <button
                onClick={() => setActiveTab('background')}
                className={`tab-btn ${activeTab === 'background' ? 'active' : ''}`}
              >
                <span className="tab-icon">🖼️</span>
                Background
              </button>
            </div>

            {/* Controls Content */}
            <div className="controls-content">
              {/* Adjust Tab */}
              {activeTab === 'adjust' && (
                <div className="tab-panel">
                  <div className="panel-header">
                    <h4>Image Adjustments</h4>
                    <span>Fine-tune your image</span>
                  </div>
                  <div className="sliders-container">
                    <PremiumSlider
                      label="Brightness"
                      value={adjustments.brightness}
                      min={0}
                      max={200}
                      defaultValue={100}
                      unit="%"
                      icon={sliderIcons.brightness}
                      onChange={(value) => handleAdjustmentChange('brightness', value)}
                    />
                    <PremiumSlider
                      label="Contrast"
                      value={adjustments.contrast}
                      min={0}
                      max={200}
                      defaultValue={100}
                      unit="%"
                      icon={sliderIcons.contrast}
                      onChange={(value) => handleAdjustmentChange('contrast', value)}
                    />
                    <PremiumSlider
                      label="Saturation"
                      value={adjustments.saturation}
                      min={0}
                      max={200}
                      defaultValue={100}
                      unit="%"
                      icon={sliderIcons.saturation}
                      onChange={(value) => handleAdjustmentChange('saturation', value)}
                    />
                    <PremiumSlider
                      label="Exposure"
                      value={adjustments.exposure}
                      min={-100}
                      max={100}
                      defaultValue={0}
                      unit=""
                      icon={sliderIcons.exposure}
                      onChange={(value) => handleAdjustmentChange('exposure', value)}
                    />
                    <PremiumSlider
                      label="Vignette"
                      value={adjustments.vignette}
                      min={0}
                      max={100}
                      defaultValue={0}
                      unit="%"
                      icon={sliderIcons.vignette}
                      onChange={(value) => handleAdjustmentChange('vignette', value)}
                    />
                    <PremiumSlider
                      label="Blur"
                      value={adjustments.blur}
                      min={0}
                      max={20}
                      defaultValue={0}
                      unit="px"
                      icon={sliderIcons.blur}
                      onChange={(value) => handleAdjustmentChange('blur', value)}
                    />
                    <PremiumSlider
                      label="Temperature"
                      value={adjustments.temperature}
                      min={-100}
                      max={100}
                      defaultValue={0}
                      unit=""
                      icon={sliderIcons.temperature}
                      onChange={(value) => handleAdjustmentChange('temperature', value)}
                    />
                    <PremiumSlider
                      label="Clarity"
                      value={adjustments.clarity}
                      min={0}
                      max={100}
                      defaultValue={0}
                      unit="%"
                      icon={sliderIcons.clarity}
                      onChange={(value) => handleAdjustmentChange('clarity', value)}
                    />
                  </div>
                </div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className="tab-panel">
                  <div className="panel-header">
                    <h4>Creative Effects</h4>
                    <span>Add artistic touches</span>
                  </div>
                  <div className="sliders-container">
                    <PremiumSlider
                      label="Vintage"
                      value={effects.vintage}
                      min={0}
                      max={100}
                      defaultValue={0}
                      unit="%"
                      icon={sliderIcons.vintage}
                      onChange={(value) => handleEffectChange('vintage', value)}
                    />
                    <PremiumSlider
                      label="Dramatic"
                      value={effects.dramatic}
                      min={0}
                      max={100}
                      defaultValue={0}
                      unit="%"
                      icon={sliderIcons.dramatic}
                      onChange={(value) => handleEffectChange('dramatic', value)}
                    />
                    <PremiumSlider
                      label="Cinematic"
                      value={effects.cinematic}
                      min={0}
                      max={100}
                      defaultValue={0}
                      unit="%"
                      icon={sliderIcons.cinematic}
                      onChange={(value) => handleEffectChange('cinematic', value)}
                    />
                    <PremiumSlider
                      label="Fade"
                      value={effects.fade}
                      min={0}
                      max={100}
                      defaultValue={0}
                      unit="%"
                      icon={sliderIcons.fade}
                      onChange={(value) => handleEffectChange('fade', value)}
                    />
                    <PremiumSlider
                      label="Glow"
                      value={effects.glow}
                      min={0}
                      max={100}
                      defaultValue={0}
                      unit="%"
                      icon={sliderIcons.glow}
                      onChange={(value) => handleEffectChange('glow', value)}
                    />
                  </div>
                </div>
              )}

              {/* Background Tab */}
              {activeTab === 'background' && (
                <div className="tab-panel">
                  <div className="panel-header">
                    <h4>Background Options</h4>
                    <span>Customize your background</span>
                  </div>
                  <div className="background-options">
                    <div className="option-group">
                      <label>Background Type</label>
                      <div className="type-cards">
                        <div
                          onClick={() => handleBackgroundChange('type', 'transparent')}
                          className={`type-card ${background.type === 'transparent' ? 'active' : ''}`}
                        >
                          <div className="type-icon">◯</div>
                          <span>Transparent</span>
                        </div>
                        <div
                          onClick={() => handleBackgroundChange('type', 'color')}
                          className={`type-card ${background.type === 'color' ? 'active' : ''}`}
                        >
                          <div className="type-icon">■</div>
                          <span>Solid Color</span>
                        </div>
                      </div>
                    </div>

                    {background.type === 'color' && (
                      <div className="color-picker">
                        <label>Select Color</label>
                        <div className="color-grid">
                          {['#FFFFFF', '#000000', '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'].map(color => (
                            <div
                              key={color}
                              onClick={() => handleBackgroundChange('color', color)}
                              className={`color-option ${background.color === color ? 'active' : ''}`}
                              style={{ backgroundColor: color }}
                            >
                              {background.color === color && (
                                <div className="checkmark">✓</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <input
                          type="color"
                          value={background.color}
                          onChange={(e) => handleBackgroundChange('color', e.target.value)}
                          className="color-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .editor-overlay {
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
        }

        .editor-container {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 1400px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(20px);
        }

        /* Header */
        .editor-header {
          padding: 24px 32px;
          background: white;
          border-bottom: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          margin: 4px 0 0 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .header-btn.secondary {
          background: #f8fafc;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .header-btn.secondary:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
        }

        .header-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .header-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .close-btn {
          background: #f8fafc;
          border: none;
          color: #64748b;
          font-size: 24px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #ef4444;
          color: white;
          transform: rotate(90deg);
        }

        /* Main Content */
        .editor-main {
          display: flex;
          flex: 1;
          overflow: hidden;
          flex-direction: ${isMobile ? 'column' : 'row'};
        }

        /* Preview Section */
        .preview-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #f8fafc;
          position: relative;
        }

        .preview-container {
          position: relative;
          max-width: 100%;
          max-height: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .preview-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
        }

        .preview-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .preview-action-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preview-action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .canvas-wrapper {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .preview-canvas {
          max-width: 100%;
          max-height: 60vh;
          display: block;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Controls Section */
        .controls-section {
          width: ${isMobile ? '100%' : '420px'};
          background: white;
          border-left: ${isMobile ? 'none' : '1px solid #f1f5f9'};
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Presets Section */
        .presets-section {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .presets-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .presets-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .presets-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .presets-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }

        .presets-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        .preset-card {
          flex-shrink: 0;
          width: 80px;
          padding: 16px 12px;
          border: 2px solid #f1f5f9;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .preset-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .preset-icon {
          font-size: 20px;
        }

        .preset-name {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-align: center;
        }

        /* Tabs Navigation */
        .tabs-navigation {
          display: flex;
          padding: 0 24px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
        }

        .tab-btn {
          flex: 1;
          padding: 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .tab-btn.active {
          color: #667eea;
          border-bottom-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .tab-btn:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .tab-icon {
          font-size: 18px;
        }

        /* Controls Content */
        .controls-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: #f8fafc;
        }

        .panel-header {
          margin-bottom: 24px;
        }

        .panel-header h4 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .panel-header span {
          color: #64748b;
          font-size: 14px;
        }

        .sliders-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Premium Slider Styles */
        .premium-slider-container {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .premium-slider-container:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .slider-label-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .slider-icon {
          font-size: 18px;
        }

        .slider-label {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }

        .slider-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .slider-value {
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          background: #f8fafc;
          padding: 6px 10px;
          border-radius: 8px;
          min-width: 60px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .slider-value.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .reset-slider-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #cbd5e1;
          padding: 6px;
          border-radius: 6px;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .reset-slider-btn.visible {
          opacity: 1;
          color: #94a3b8;
        }

        .reset-slider-btn:hover {
          background: #f1f5f9;
          color: #64748b;
        }

        .slider-track {
          position: relative;
          height: 8px;
          background: #f1f5f9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .slider-track:hover {
          background: #e2e8f0;
        }

        .slider-track.dragging {
          background: #cbd5e1;
        }

        .slider-progress {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 8px;
          transition: width 0.1s ease;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }

        .slider-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #667eea;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          cursor: grab;
          transition: all 0.3s ease;
        }

        .slider-thumb:active {
          cursor: grabbing;
          transform: translate(-50%, -50%) scale(1.2);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        /* Background Options */
        .background-options {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .option-group label {
          display: block;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 15px;
          color: #1e293b;
        }

        .type-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .type-card {
          padding: 20px;
          border: 2px solid #f1f5f9;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .type-card.active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .type-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .type-icon {
          font-size: 24px;
          color: #64748b;
        }

        .type-card.active .type-icon {
          color: #667eea;
        }

        .color-picker {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .color-option {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          cursor: pointer;
          border: 3px solid transparent;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .color-option.active {
          border-color: #667eea;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .color-option:hover {
          transform: scale(1.05);
        }

        .checkmark {
          color: white;
          font-size: 14px;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .color-input {
          width: 100%;
          height: 50px;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .color-input:hover {
          border-color: #667eea;
        }

        /* Mobile Optimizations */
        @media (max-width: 767px) {
          .editor-overlay {
            padding: 0;
          }

          .editor-container {
            height: 100vh;
            border-radius: 0;
            max-width: none;
          }

          .editor-header {
            padding: 16px 20px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .header-actions {
            justify-content: space-between;
          }

          .header-text {
            text-align: center;
          }

          .header-text h1 {
            font-size: 24px;
          }

          .preview-section {
            padding: 16px;
            flex: 0.6;
          }

          .canvas-wrapper {
            padding: 16px;
            min-height: 300px;
          }

          .preview-canvas {
            max-height: 40vh;
          }

          .controls-section {
            flex: 0.4;
            min-height: 300px;
          }

          .presets-section, .controls-content {
            padding: 20px;
          }

          .presets-scroll {
            gap: 8px;
          }

          .preset-card {
            width: 70px;
            padding: 12px 8px;
          }

          .type-cards {
            grid-template-columns: 1fr;
          }

          .color-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Scrollbar Styling */
        .controls-content::-webkit-scrollbar {
          width: 6px;
        }

        .controls-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .controls-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .controls-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;
