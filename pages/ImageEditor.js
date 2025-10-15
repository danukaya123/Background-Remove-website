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
  const quickPresets = {
    enhance: { brightness: 110, contrast: 110, saturation: 110, clarity: 30 },
    portrait: { brightness: 105, contrast: 105, saturation: 95 },
    landscape: { brightness: 105, contrast: 115, saturation: 120 },
    moody: { brightness: 85, contrast: 120, saturation: 90, vignette: 40 },
    vibrant: { brightness: 110, contrast: 110, saturation: 130 },
    cinematic: { brightness: 90, contrast: 120, saturation: 95, vignette: 25 },
    vintage: { brightness: 95, contrast: 105, saturation: 85, temperature: 25 },
    dramatic: { brightness: 80, contrast: 130, saturation: 95, vignette: 35 },
    clean: { brightness: 105, contrast: 105, saturation: 100 },
    warm: { brightness: 105, contrast: 105, saturation: 110, temperature: 15 }
  };

  const applyQuickPreset = (preset) => {
    setAdjustments(prev => ({ ...prev, ...quickPresets[preset] }));
  };

  // Enhanced Draggable Slider Component
  const DraggableSlider = ({ 
    label, 
    value, 
    min, 
    max, 
    onChange, 
    unit = '%',
    defaultValue = 0 
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

    return (
      <div className="slider-container">
        <div className="slider-header">
          <span className="slider-label">{label}</span>
          <div className="slider-controls">
            <span className="slider-value">{value}{unit}</span>
            <button 
              className="reset-slider-btn"
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

  return (
    <div className="editor-overlay">
      <div className="editor-container">
        {/* Header */}
        <div className="editor-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Premium Editor</h1>
              <p>Professional photo editing tools</p>
            </div>
            <button className="close-btn" onClick={onClose}>
              <span>×</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="editor-main">
          {/* Preview Section */}
          <div className="preview-section">
            <div className="preview-container">
              <div className="preview-label">
                <span>Live Preview</span>
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
              <div className="presets-grid">
                {Object.keys(quickPresets).map(preset => (
                  <button
                    key={preset}
                    onClick={() => applyQuickPreset(preset)}
                    className="preset-btn"
                  >
                    {preset}
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
                Adjust
              </button>
              <button
                onClick={() => setActiveTab('effects')}
                className={`tab-btn ${activeTab === 'effects' ? 'active' : ''}`}
              >
                Effects
              </button>
              <button
                onClick={() => setActiveTab('background')}
                className={`tab-btn ${activeTab === 'background' ? 'active' : ''}`}
              >
                Background
              </button>
            </div>

            {/* Controls Content */}
            <div className="controls-content">
              {/* Adjust Tab */}
              {activeTab === 'adjust' && (
                <div className="tab-panel">
                  <h4>Image Adjustments</h4>
                  <div className="sliders-container">
                    <DraggableSlider
                      label="Brightness"
                      value={adjustments.brightness}
                      min={0}
                      max={200}
                      defaultValue={100}
                      onChange={(value) => handleAdjustmentChange('brightness', value)}
                    />
                    <DraggableSlider
                      label="Contrast"
                      value={adjustments.contrast}
                      min={0}
                      max={200}
                      defaultValue={100}
                      onChange={(value) => handleAdjustmentChange('contrast', value)}
                    />
                    <DraggableSlider
                      label="Saturation"
                      value={adjustments.saturation}
                      min={0}
                      max={200}
                      defaultValue={100}
                      onChange={(value) => handleAdjustmentChange('saturation', value)}
                    />
                    <DraggableSlider
                      label="Exposure"
                      value={adjustments.exposure}
                      min={-100}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleAdjustmentChange('exposure', value)}
                    />
                    <DraggableSlider
                      label="Vignette"
                      value={adjustments.vignette}
                      min={0}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleAdjustmentChange('vignette', value)}
                    />
                    <DraggableSlider
                      label="Blur"
                      value={adjustments.blur}
                      min={0}
                      max={20}
                      unit="px"
                      defaultValue={0}
                      onChange={(value) => handleAdjustmentChange('blur', value)}
                    />
                    <DraggableSlider
                      label="Temperature"
                      value={adjustments.temperature}
                      min={-100}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleAdjustmentChange('temperature', value)}
                    />
                    <DraggableSlider
                      label="Clarity"
                      value={adjustments.clarity}
                      min={0}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleAdjustmentChange('clarity', value)}
                    />
                  </div>
                </div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className="tab-panel">
                  <h4>Creative Effects</h4>
                  <div className="sliders-container">
                    <DraggableSlider
                      label="Vintage"
                      value={effects.vintage}
                      min={0}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleEffectChange('vintage', value)}
                    />
                    <DraggableSlider
                      label="Dramatic"
                      value={effects.dramatic}
                      min={0}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleEffectChange('dramatic', value)}
                    />
                    <DraggableSlider
                      label="Cinematic"
                      value={effects.cinematic}
                      min={0}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleEffectChange('cinematic', value)}
                    />
                    <DraggableSlider
                      label="Fade"
                      value={effects.fade}
                      min={0}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleEffectChange('fade', value)}
                    />
                    <DraggableSlider
                      label="Glow"
                      value={effects.glow}
                      min={0}
                      max={100}
                      defaultValue={0}
                      onChange={(value) => handleEffectChange('glow', value)}
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
                      </div>
                    </div>

                    {background.type === 'color' && (
                      <div className="color-picker">
                        <label>Select Color</label>
                        <input
                          type="color"
                          value={background.color}
                          onChange={(e) => handleBackgroundChange('color', e.target.value)}
                          className="color-input"
                        />
                        <div className="color-previews">
                          {['#FFFFFF', '#000000', '#3B82F6', '#10B981', '#EF4444', '#F59E0B'].map(color => (
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
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={resetAll} className="reset-btn">
                Reset All
              </button>
              <button onClick={handleDownload} className="download-btn">
                Download Image
              </button>
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
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .editor-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 1200px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Header */
        .editor-header {
          padding: 20px;
          background: #1a1a1a;
          color: white;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .header-text p {
          margin: 4px 0 0 0;
          color: #ccc;
          font-size: 14px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
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
          padding: 20px;
          background: #f5f5f5;
        }

        .preview-container {
          position: relative;
          max-width: 100%;
          max-height: 100%;
        }

        .preview-label {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 2;
        }

        .canvas-wrapper {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .preview-canvas {
          max-width: 100%;
          max-height: 60vh;
          display: block;
        }

        /* Controls Section */
        .controls-section {
          width: ${isMobile ? '100%' : '400px'};
          background: white;
          border-left: ${isMobile ? 'none' : '1px solid #e0e0e0'};
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Presets Section */
        .presets-section {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .presets-section h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .preset-btn {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .preset-btn:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        /* Tabs Navigation */
        .tabs-navigation {
          display: flex;
          padding: 0 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab-btn:hover {
          color: #3b82f6;
          background: #f8fafc;
        }

        /* Controls Content */
        .controls-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .tab-panel h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .sliders-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Enhanced Slider Styles */
        .slider-container {
          margin-bottom: 8px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .slider-label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .slider-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .slider-value {
          font-size: 12px;
          font-weight: 600;
          color: #3b82f6;
          background: #eff6ff;
          padding: 2px 6px;
          border-radius: 4px;
          min-width: 40px;
          text-align: center;
        }

        .reset-slider-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: #666;
          padding: 2px;
          border-radius: 2px;
        }

        .reset-slider-btn:hover {
          background: #f3f4f6;
          color: #333;
        }

        .slider-track {
          position: relative;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .slider-track:hover {
          background: #d1d5db;
        }

        .slider-track.dragging {
          background: #cbd5e1;
        }

        .slider-progress {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 3px;
          transition: width 0.1s ease;
        }

        .slider-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: grab;
          transition: all 0.2s;
        }

        .slider-thumb:active {
          cursor: grabbing;
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }

        /* Background Options */
        .background-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .option-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
        }

        .type-buttons {
          display: flex;
          gap: 8px;
        }

        .type-btn {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .type-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .color-picker {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .color-input {
          width: 100%;
          height: 40px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
        }

        .color-previews {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .color-swatch {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .color-swatch.active {
          border-color: #3b82f6;
          transform: scale(1.1);
        }

        /* Action Buttons */
        .action-buttons {
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 12px;
        }

        .reset-btn, .download-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .reset-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .reset-btn:hover {
          background: #e5e7eb;
        }

        .download-btn {
          background: #3b82f6;
          color: white;
        }

        .download-btn:hover {
          background: #2563eb;
        }

        /* Mobile Optimizations */
        @media (max-width: 767px) {
          .editor-overlay {
            padding: 0;
          }

          .editor-container {
            height: 100vh;
            border-radius: 0;
          }

          .editor-header {
            padding: 16px;
          }

          .preview-section {
            padding: 16px;
          }

          .canvas-wrapper {
            padding: 16px;
          }

          .presets-section, .controls-content {
            padding: 16px;
          }

          .action-buttons {
            padding: 16px;
          }

          .presets-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .type-buttons {
            flex-direction: column;
          }
        }

        /* Scrollbar Styling */
        .controls-content::-webkit-scrollbar {
          width: 4px;
        }

        .controls-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .controls-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .controls-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;
