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
    defaultValue = 0,
    icon = null
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
      <div className="adjustment-control">
        <div className="control-header">
          <span>{label}</span>
          <span className="value-display">{value}{unit}</span>
        </div>
        <div className="slider-container">
          {icon && <i className={icon}></i>}
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
          {icon && <i className={icon}></i>}
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
            <div className="logo">
              <i className="fas fa-camera-retro"></i>
              <span>PixelPro</span>
            </div>
            <div className="editor-actions">
              <button className="btn btn-outline">
                <i className="fas fa-download"></i> Export
              </button>
              <button className="btn btn-primary" onClick={handleDownload}>
                <i className="fas fa-save"></i> Save Project
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Editor Section */}
          <div className="editor-container-section">
            <div className="editor-body">
              <div className="image-container">
                {!image ? (
                  <div className="image-placeholder">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <h3>Upload an image to get started</h3>
                    <p>Drag & drop your image here or click to browse</p>
                    <input type="file" id="image-upload" accept="image/*" style={{ display: 'none' }} />
                    <button className="btn btn-primary" style={{ marginTop: '15px' }}>
                      Select Image
                    </button>
                  </div>
                ) : (
                  <div className="canvas-wrapper">
                    <canvas
                      ref={canvasRef}
                      className="preview-canvas"
                    />
                  </div>
                )}
              </div>
              
              {/* Tools Section */}
              <div className="tools-container">
                <div className="tools-grid">
                  <div className="tool-card">
                    <i className="fas fa-crop-alt"></i>
                    <h3>Crop & Rotate</h3>
                  </div>
                  <div className="tool-card">
                    <i className="fas fa-adjust"></i>
                    <h3>Filters</h3>
                  </div>
                  <div className="tool-card">
                    <i className="fas fa-sliders-h"></i>
                    <h3>Adjustments</h3>
                  </div>
                  <div className="tool-card">
                    <i className="fas fa-paint-brush"></i>
                    <h3>Brush</h3>
                  </div>
                  <div className="tool-card">
                    <i className="fas fa-font"></i>
                    <h3>Text</h3>
                  </div>
                  <div className="tool-card">
                    <i className="fas fa-shapes"></i>
                    <h3>Shapes</h3>
                  </div>
                  <div className="tool-card">
                    <i className="fas fa-magic"></i>
                    <h3>AI Enhance</h3>
                  </div>
                  <div className="tool-card">
                    <i className="fas fa-stamp"></i>
                    <h3>Stickers</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adjustments Panel */}
          <div className="adjustments-panel">
            <div className="panel-header">
              <h3>Adjustments</h3>
              <i className="fas fa-sliders-h"></i>
            </div>
            
            {/* Quick Presets */}
            <div className="presets-section">
              <h4>Quick Presets</h4>
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
                  <DraggableSlider
                    label="Brightness"
                    value={adjustments.brightness}
                    min={0}
                    max={200}
                    defaultValue={100}
                    onChange={(value) => handleAdjustmentChange('brightness', value)}
                    icon="fas fa-sun"
                  />
                  <DraggableSlider
                    label="Contrast"
                    value={adjustments.contrast}
                    min={0}
                    max={200}
                    defaultValue={100}
                    onChange={(value) => handleAdjustmentChange('contrast', value)}
                    icon="fas fa-circle"
                  />
                  <DraggableSlider
                    label="Saturation"
                    value={adjustments.saturation}
                    min={0}
                    max={200}
                    defaultValue={100}
                    onChange={(value) => handleAdjustmentChange('saturation', value)}
                    icon="fas fa-palette"
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
                    icon="fas fa-eye"
                  />
                  <DraggableSlider
                    label="Temperature"
                    value={adjustments.temperature}
                    min={-100}
                    max={100}
                    defaultValue={0}
                    onChange={(value) => handleAdjustmentChange('temperature', value)}
                    icon="fas fa-sync-alt"
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
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className="tab-panel">
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
              )}

              {/* Background Tab */}
              {activeTab === 'background' && (
                <div className="tab-panel">
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
              <button onClick={resetAll} className="btn btn-outline">
                <i className="fas fa-redo"></i> Reset All
              </button>
              <button onClick={handleDownload} className="btn btn-primary">
                Download Image
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --primary: #4361ee;
          --primary-dark: #3a56d4;
          --secondary: #7209b7;
          --dark: #1a1a2e;
          --light: #f8f9fa;
          --gray: #6c757d;
          --success: #4cc9f0;
        }

        .editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          color: var(--light);
        }

        .editor-container {
          background: var(--dark);
          border-radius: 12px;
          width: 100%;
          max-width: 1400px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Header */
        .editor-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 700;
          color: white;
        }

        .logo i {
          color: var(--primary);
        }

        .editor-actions {
          display: flex;
          gap: 15px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
        }

        .btn-outline:hover {
          background: rgba(67, 97, 238, 0.1);
        }

        /* Main Content */
        .main-content {
          display: flex;
          flex: 1;
          padding: 20px;
          gap: 30px;
          overflow: hidden;
        }

        /* Editor Section */
        .editor-container-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .editor-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .image-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .image-placeholder {
          text-align: center;
          color: var(--gray);
        }

        .image-placeholder i {
          font-size: 60px;
          margin-bottom: 15px;
          color: var(--primary);
        }

        .canvas-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-canvas {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* Tools Container */
        .tools-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 20px;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .tool-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          color: var(--light);
        }

        .tool-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-3px);
        }

        .tool-card i {
          font-size: 24px;
          margin-bottom: 10px;
          color: var(--primary);
        }

        .tool-card h3 {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        /* Adjustments Panel */
        .adjustments-panel {
          width: 350px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .panel-header i {
          color: var(--primary);
        }

        /* Presets Section */
        .presets-section {
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .presets-section h4 {
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
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          color: var(--light);
        }

        .preset-btn:hover {
          border-color: var(--primary);
          background: rgba(67, 97, 238, 0.2);
        }

        /* Tabs Navigation */
        .tabs-navigation {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .tab-btn:hover {
          color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Controls Content */
        .controls-content {
          flex: 1;
          overflow-y: auto;
        }

        .tab-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Enhanced Slider Styles */
        .adjustment-control {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .control-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .control-header span:first-child {
          font-size: 14px;
          font-weight: 500;
        }

        .value-display {
          width: 50px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--primary);
          background: rgba(67, 97, 238, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .slider-container i {
          color: var(--primary);
          font-size: 14px;
        }

        .slider-track {
          position: relative;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          cursor: pointer;
          transition: background-color 0.2s;
          flex: 1;
        }

        .slider-track:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .slider-track.dragging {
          background: rgba(255, 255, 255, 0.4);
        }

        .slider-progress {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
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
          border: 2px solid var(--primary);
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
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          color: var(--light);
        }

        .type-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .color-picker {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .color-input {
          width: 100%;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.1);
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
          border-color: var(--primary);
          transform: scale(1.1);
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 12px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-buttons .btn {
          flex: 1;
        }

        /* Mobile Optimizations */
        @media (max-width: 992px) {
          .main-content {
            flex-direction: column;
          }
          
          .adjustments-panel {
            width: 100%;
            max-height: 400px;
          }
        }

        @media (max-width: 768px) {
          .editor-overlay {
            padding: 0;
          }

          .editor-container {
            height: 100vh;
            border-radius: 0;
          }

          .tools-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .presets-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .type-buttons {
            flex-direction: column;
          }
        }

        /* Scrollbar Styling */
        .adjustments-panel::-webkit-scrollbar,
        .controls-content::-webkit-scrollbar {
          width: 4px;
        }

        .adjustments-panel::-webkit-scrollbar-track,
        .controls-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .adjustments-panel::-webkit-scrollbar-thumb,
        .controls-content::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 2px;
        }

        .adjustments-panel::-webkit-scrollbar-thumb:hover,
        .controls-content::-webkit-scrollbar-thumb:hover {
          background: var(--primary-dark);
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;
