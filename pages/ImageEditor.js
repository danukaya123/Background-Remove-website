import { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ imageUrl, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('filters');
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Crop state and refs
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    aspectRatio: 'free',
    isDragging: false,
    dragHandle: null
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

  // Editing states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sharpen: 0,
    exposure: 0,
    temperature: 0,
    vignette: 0,
    gamma: 100,
    noise: 0,
    sepia: 0,
    invert: 0
  });

  const [background, setBackground] = useState({
    type: 'transparent',
    color: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  });

  const [effects, setEffects] = useState({
    tiltShift: 0,
    lensBlur: 0,
    pixelate: 1,
    glow: 0,
    shadow: 0,
    filmGrain: 0
  });

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
    canvas.width = img.width;
    canvas.height = img.height;

    drawImageOnCanvas(img);
  };

  const drawImageOnCanvas = (img, applyFilters = true) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
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
    if (applyFilters) {
      ctx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        hue-rotate(${filters.hue}deg)
        blur(${filters.blur}px)
        sepia(${filters.sepia}%)
        invert(${filters.invert}%)
      `;
    }

    // Draw image
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

    // Film grain effect
    if (effects.filmGrain > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const intensity = effects.filmGrain / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * 255 * intensity;
        data[i] = Math.max(0, Math.min(255, data[i] + grain));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
      }
      ctx.putImageData(imageData, 0, 0);
    }
  };

  // Update canvas when filters change
  useEffect(() => {
    if (image) {
      drawImageOnCanvas(image);
    }
  }, [filters, background, effects, image]);

  // Crop functionality
  const startCrop = () => {
    setIsCropping(true);
    if (image) {
      setCrop(prev => ({
        ...prev,
        x: 50,
        y: 50,
        width: Math.min(200, image.width - 100),
        height: Math.min(200, image.height - 100)
      }));
    }
  };

  const handleCropMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setCrop(prev => ({ ...prev, isDragging: true, dragHandle: handle }));
  };

  const handleCropMouseMove = (e) => {
    if (!crop.isDragging || !image) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setCrop(prev => {
      const newCrop = { ...prev };
      const minSize = 20;

      switch (prev.dragHandle) {
        case 'top-left':
          newCrop.width += prev.x - mouseX;
          newCrop.height += prev.y - mouseY;
          newCrop.x = Math.max(0, mouseX);
          newCrop.y = Math.max(0, mouseY);
          newCrop.width = Math.max(minSize, newCrop.width);
          newCrop.height = Math.max(minSize, newCrop.height);
          break;
        case 'top-right':
          newCrop.width = Math.max(minSize, mouseX - prev.x);
          newCrop.height += prev.y - mouseY;
          newCrop.y = Math.max(0, mouseY);
          break;
        case 'bottom-left':
          newCrop.width += prev.x - mouseX;
          newCrop.height = Math.max(minSize, mouseY - prev.y);
          newCrop.x = Math.max(0, mouseX);
          break;
        case 'bottom-right':
          newCrop.width = Math.max(minSize, mouseX - prev.x);
          newCrop.height = Math.max(minSize, mouseY - prev.y);
          break;
        case 'move':
          newCrop.x = Math.max(0, Math.min(canvas.width - newCrop.width, mouseX - newCrop.width / 2));
          newCrop.y = Math.max(0, Math.min(canvas.height - newCrop.height, mouseY - newCrop.height / 2));
          break;
      }

      return newCrop;
    });
  };

  const handleCropMouseUp = () => {
    setCrop(prev => ({ ...prev, isDragging: false, dragHandle: null }));
  };

  const applyCrop = () => {
    if (!image || !isCropping) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const croppedImageData = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);

    // Create new canvas with cropped dimensions
    const newCanvas = document.createElement('canvas');
    newCanvas.width = crop.width;
    newCanvas.height = crop.height;
    const newCtx = newCanvas.getContext('2d');
    newCtx.putImageData(croppedImageData, 0, 0);

    // Update the main canvas
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(newCanvas, 0, 0);

    setIsCropping(false);
    setImage(newCanvas);
  };

  const cancelCrop = () => {
    setIsCropping(false);
    if (image) {
      drawImageOnCanvas(image);
    }
  };

  // Event listeners for crop
  useEffect(() => {
    if (isCropping) {
      document.addEventListener('mousemove', handleCropMouseMove);
      document.addEventListener('mouseup', handleCropMouseUp);
      document.addEventListener('touchmove', handleCropMouseMove);
      document.addEventListener('touchend', handleCropMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleCropMouseMove);
        document.removeEventListener('mouseup', handleCropMouseUp);
        document.removeEventListener('touchmove', handleCropMouseMove);
        document.removeEventListener('touchend', handleCropMouseUp);
      };
    }
  }, [isCropping, crop.isDragging]);

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const handleEffectChange = (effect, value) => {
    setEffects(prev => ({
      ...prev,
      [effect]: value
    }));
  };

  const handleBackgroundChange = (type, value) => {
    setBackground(prev => ({
      ...prev,
      type,
      [type]: value
    }));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `professional-edit-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sharpen: 0,
      exposure: 0,
      temperature: 0,
      vignette: 0,
      gamma: 100,
      noise: 0,
      sepia: 0,
      invert: 0
    });
    setEffects({
      tiltShift: 0,
      lensBlur: 0,
      pixelate: 1,
      glow: 0,
      shadow: 0,
      filmGrain: 0
    });
  };

  const presetFilters = {
    vintage: { brightness: 90, contrast: 110, saturation: 80, hue: -30, vignette: 20, sepia: 30 },
    dramatic: { brightness: 80, contrast: 120, saturation: 90, vignette: 30 },
    bright: { brightness: 120, contrast: 110, saturation: 110 },
    bw: { brightness: 100, contrast: 120, saturation: 0 },
    cinematic: { brightness: 85, contrast: 115, saturation: 95, vignette: 25, temperature: 15 },
    soft: { brightness: 105, contrast: 95, saturation: 90, blur: 0.5 },
    vibrant: { brightness: 105, contrast: 110, saturation: 130, hue: 10 }
  };

  const applyPreset = (preset) => {
    setFilters(prev => ({ ...prev, ...presetFilters[preset] }));
  };

  const gradientPresets = [
    { name: 'Sunset', value: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { name: 'Coral', value: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    { name: 'Emerald', value: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    { name: 'Fire', value: 'linear-gradient(135deg, #fa709a, #fee140)' },
    { name: 'Royal', value: 'linear-gradient(135deg, #667eea, #764ba2)' }
  ];

  const FilterSlider = ({ label, value, min, max, onChange, unit = '%' }) => (
    <div className="filter-slider">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="slider-input"
      />
    </div>
  );

  const CropOverlay = () => (
    <>
      {/* Crop rectangle */}
      <div
        className="crop-rectangle"
        style={{
          left: `${crop.x}px`,
          top: `${crop.y}px`,
          width: `${crop.width}px`,
          height: `${crop.height}px`
        }}
        onMouseDown={(e) => handleCropMouseDown(e, 'move')}
        onTouchStart={(e) => handleCropMouseDown(e, 'move')}
      >
        {/* Crop handles */}
        <div className="crop-handle top-left" onMouseDown={(e) => handleCropMouseDown(e, 'top-left')} />
        <div className="crop-handle top-right" onMouseDown={(e) => handleCropMouseDown(e, 'top-right')} />
        <div className="crop-handle bottom-left" onMouseDown={(e) => handleCropMouseDown(e, 'bottom-left')} />
        <div className="crop-handle bottom-right" onMouseDown={(e) => handleCropMouseDown(e, 'bottom-right')} />
      </div>
      
      {/* Crop overlay */}
      <div className="crop-overlay" />
    </>
  );

  return (
    <div className="image-editor-overlay">
      <div className="image-editor-container" ref={containerRef}>
        {/* Header */}
        <div className="editor-header">
          <div className="header-left">
            <div className="editor-logo">
              <span className="logo-icon">✎</span>
            </div>
            <div className="header-text">
              <h2>Professional Editor</h2>
              <p>Edit your image with premium tools</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="editor-main">
          {/* Sidebar - Editing Tools */}
          <div className="editor-sidebar">
            {/* Desktop Tab Navigation */}
            {!isMobile && (
              <div className="tab-navigation">
                {[
                  { id: 'filters', icon: '🎨', label: 'Filters' },
                  { id: 'adjust', icon: '⚙️', label: 'Adjust' },
                  { id: 'crop', icon: '✂️', label: 'Crop' },
                  { id: 'background', icon: '🖼️', label: 'Background' },
                  { id: 'effects', icon: '✨', label: 'Effects' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Tab Navigation */}
            {isMobile && (
              <div className="mobile-tab-navigation">
                {[
                  { id: 'filters', icon: '🎨', label: 'Filters' },
                  { id: 'adjust', icon: '⚙️', label: 'Adjust' },
                  { id: 'crop', icon: '✂️', label: 'Crop' },
                  { id: 'background', icon: '🖼️', label: 'Background' },
                  { id: 'effects', icon: '✨', label: 'Effects' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`mobile-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <span className="mobile-tab-icon">{tab.icon}</span>
                    <span className="mobile-tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tools Content */}
            <div className="tools-content">
              {/* Filter Tools */}
              {activeTab === 'filters' && (
                <div className="tools-section">
                  <h3>Filters & Effects</h3>
                  
                  {/* Preset Filters */}
                  <div className="presets-section">
                    <h4>Quick Presets</h4>
                    <div className="presets-grid">
                      {Object.entries(presetFilters).map(([preset, config]) => (
                        <button
                          key={preset}
                          onClick={() => applyPreset(preset)}
                          className="preset-button"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Sliders */}
                  <div className="sliders-container">
                    {[
                      { key: 'brightness', label: 'Brightness', min: 0, max: 200 },
                      { key: 'contrast', label: 'Contrast', min: 0, max: 200 },
                      { key: 'saturation', label: 'Saturation', min: 0, max: 200 },
                      { key: 'hue', label: 'Hue Rotation', min: -180, max: 180, unit: '°' },
                      { key: 'blur', label: 'Blur', min: 0, max: 20, unit: 'px' },
                      { key: 'vignette', label: 'Vignette', min: 0, max: 50 }
                    ].map(({ key, label, min, max, unit }) => (
                      <FilterSlider
                        key={key}
                        label={label}
                        value={filters[key]}
                        min={min}
                        max={max}
                        unit={unit}
                        onChange={(value) => handleFilterChange(key, value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Adjust Tools */}
              {activeTab === 'adjust' && (
                <div className="tools-section">
                  <h3>Fine Tune</h3>
                  <div className="sliders-container">
                    {[
                      { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
                      { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
                      { key: 'sharpen', label: 'Sharpen', min: 0, max: 100 },
                      { key: 'gamma', label: 'Gamma', min: 50, max: 200 }
                    ].map(({ key, label, min, max }) => (
                      <FilterSlider
                        key={key}
                        label={label}
                        value={filters[key]}
                        min={min}
                        max={max}
                        onChange={(value) => handleFilterChange(key, value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Background Tools */}
              {activeTab === 'background' && (
                <div className="tools-section">
                  <h3>Background</h3>
                  
                  <div className="background-type">
                    <label>Background Type</label>
                    <select
                      value={background.type}
                      onChange={(e) => handleBackgroundChange('type', e.target.value)}
                      className="background-select"
                    >
                      <option value="transparent">Transparent</option>
                      <option value="color">Solid Color</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>

                  {background.type === 'color' && (
                    <div className="color-picker-section">
                      <label>Color Picker</label>
                      <input
                        type="color"
                        value={background.color}
                        onChange={(e) => handleBackgroundChange('color', e.target.value)}
                        className="color-picker"
                      />
                    </div>
                  )}

                  {background.type === 'gradient' && (
                    <div className="gradient-section">
                      <h4>Gradient Presets</h4>
                      <div className="gradients-grid">
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
              )}

              {/* Effects Tools */}
              {activeTab === 'effects' && (
                <div className="tools-section">
                  <h3>Advanced Effects</h3>
                  <div className="sliders-container">
                    {[
                      { key: 'filmGrain', label: 'Film Grain', min: 0, max: 100 },
                      { key: 'glow', label: 'Glow Effect', min: 0, max: 50 },
                      { key: 'shadow', label: 'Drop Shadow', min: 0, max: 50 },
                      { key: 'pixelate', label: 'Pixelate', min: 1, max: 20, unit: 'px' }
                    ].map(({ key, label, min, max, unit }) => (
                      <FilterSlider
                        key={key}
                        label={label}
                        value={effects[key]}
                        min={min}
                        max={max}
                        unit={unit}
                        onChange={(value) => handleEffectChange(key, value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Crop Tools */}
              {activeTab === 'crop' && (
                <div className="tools-section">
                  <h3>Crop & Resize</h3>
                  
                  {!isCropping ? (
                    <>
                      <div className="crop-instructions">
                        <p>Click "Start Cropping" to begin cropping your image. Drag the corners to adjust the crop area.</p>
                      </div>
                      <button onClick={startCrop} className="crop-start-button">
                        Start Cropping
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="crop-controls">
                        <p>Drag the corners or edges to adjust the crop area</p>
                        <div className="crop-actions">
                          <button onClick={applyCrop} className="crop-apply-button">
                            Apply Crop
                          </button>
                          <button onClick={cancelCrop} className="crop-cancel-button">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Reset Button */}
              <button onClick={resetFilters} className="reset-button">
                Reset All Changes
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="editor-preview">
            <div className="preview-container">
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  className="preview-canvas"
                />
                {isCropping && <CropOverlay />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="editor-footer">
          <button onClick={onClose} className="footer-button cancel">
            Cancel
          </button>
          <button onClick={handleDownload} className="footer-button download">
            Download Image
          </button>
        </div>
      </div>

      <style jsx>{`
        .image-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .image-editor-container {
          background: white;
          border-radius: 24px;
          width: 95%;
          max-width: 1400px;
          height: 90%;
          display: flex;
          flex-direction: column;
          box-shadow: 
            0 32px 64px rgba(0, 0, 0, 0.08),
            0 16px 32px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        /* Header */
        .editor-header {
          padding: 24px 32px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .editor-logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .header-text h2 {
          margin: 0;
          color: #1a1a1a;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .header-text p {
          margin: 4px 0 0 0;
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        .close-button {
          background: rgba(0, 0, 0, 0.04);
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          font-weight: bold;
          min-width: 48px;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.08);
          color: #333;
        }

        /* Main Content */
        .editor-main {
          display: flex;
          flex: 1;
          overflow: hidden;
          ${isMobile ? 'flex-direction: column;' : ''}
        }

        /* Sidebar */
        .editor-sidebar {
          width: ${isMobile ? '100%' : '380px'};
          border-right: ${isMobile ? 'none' : '1px solid rgba(0, 0, 0, 0.06)'};
          padding: ${isMobile ? '20px' : '24px'};
          overflow-y: auto;
          background: ${isMobile ? 'rgba(250, 251, 252, 0.8)' : 'linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)'};
          
          /* Hide scrollbar for desktop */
          ${!isMobile ? `
            scrollbar-width: none;
            -ms-overflow-style: none;
            &::-webkit-scrollbar { display: none; }
          ` : ''}
        }

        /* Tab Navigation */
        .tab-navigation {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .tab-button {
          background: transparent;
          color: #666;
          border: 1px solid transparent;
          padding: 16px 20px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }

        .tab-button:hover {
          background: rgba(102, 126, 234, 0.08);
          color: #667eea;
          border-color: rgba(102, 126, 234, 0.2);
          transform: translateX(4px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          transform: translateX(4px);
        }

        .tab-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .mobile-tab-navigation {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          padding: 8px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .mobile-tab-button {
          flex: 1;
          background: transparent;
          color: #666;
          border: none;
          padding: 12px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-tab-button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .mobile-tab-icon {
          font-size: 16px;
        }

        /* Tools Content */
        .tools-content {
          flex: 1;
        }

        .tools-section {
          margin-bottom: 24px;
        }

        .tools-section h3 {
          color: #1a1a1a;
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 700;
        }

        .tools-section h4 {
          color: #666;
          font-size: 14px;
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        /* Filter Sliders */
        .filter-slider {
          margin-bottom: 20px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .slider-label {
          color: #333;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .slider-value {
          color: #667eea;
          font-size: 12px;
          font-weight: 700;
          background: rgba(102, 126, 234, 0.1);
          padding: 4px 8px;
          border-radius: 8px;
        }

        .slider-input {
          width: 100%;
          height: 6px;
          border-radius: 10px;
          background: linear-gradient(90deg, #e5e7eb 0%, #667eea 100%);
          outline: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          cursor: grab;
        }

        .slider-input::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }

        /* Presets */
        .presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .preset-button {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 12px 8px;
          border-radius: 12px;
          font-size: 13px;
          cursor: pointer;
          text-transform: capitalize;
          font-weight: 600;
          color: #333;
          transition: all 0.2s ease;
        }

        .preset-button:hover {
          border-color: #667eea;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        /* Background Tools */
        .background-type, .color-picker-section {
          margin-bottom: 20px;
        }

        .background-type label, .color-picker-section label {
          display: block;
          color: #333;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .background-select, .color-picker {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .background-select:focus, .color-picker:focus {
          border-color: #667eea;
          outline: none;
        }

        .color-picker {
          height: 60px;
          padding: 8px;
        }

        .gradients-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .gradient-preset {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 10px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .gradient-preset.active {
          border-color: #667eea;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .gradient-preset:hover {
          transform: scale(1.05);
        }

        /* Crop Tools */
        .crop-instructions, .crop-controls {
          margin-bottom: 20px;
        }

        .crop-instructions p, .crop-controls p {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .crop-start-button, .crop-apply-button, .crop-cancel-button {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          border: none;
        }

        .crop-start-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .crop-start-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .crop-actions {
          display: flex;
          gap: 8px;
        }

        .crop-apply-button {
          flex: 2;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .crop-cancel-button {
          flex: 1;
          background: rgba(0, 0, 0, 0.06);
          color: #666;
        }

        /* Reset Button */
        .reset-button {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          width: 100%;
          margin-top: 20px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          transition: all 0.2s ease;
        }

        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        /* Preview Area */
        .editor-preview {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${isMobile ? '20px' : '32px'};
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          ${isMobile ? 'min-height: 50vh;' : ''}
        }

        .preview-container {
          max-width: 100%;
          max-height: 100%;
          overflow: auto;
          background: white;
          border-radius: 20px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04);
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .canvas-wrapper {
          position: relative;
          display: inline-block;
        }

        .preview-canvas {
          max-width: 100%;
          max-height: ${isMobile ? '40vh' : '60vh'};
          display: block;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        /* Crop Overlay */
        .crop-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }

        .crop-rectangle {
          position: absolute;
          border: 2px solid #667eea;
          background: rgba(102, 126, 234, 0.1);
          cursor: move;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
        }

        .crop-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #667eea;
          border: 2px solid white;
          border-radius: 2px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .crop-handle.top-left {
          top: -6px;
          left: -6px;
          cursor: nw-resize;
        }

        .crop-handle.top-right {
          top: -6px;
          right: -6px;
          cursor: ne-resize;
        }

        .crop-handle.bottom-left {
          bottom: -6px;
          left: -6px;
          cursor: sw-resize;
        }

        .crop-handle.bottom-right {
          bottom: -6px;
          right: -6px;
          cursor: se-resize;
        }

        /* Footer */
        .editor-footer {
          padding: 24px 32px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
        }

        .footer-button {
          padding: 14px 32px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          min-width: 140px;
        }

        .footer-button.cancel {
          background: transparent;
          color: #666;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .footer-button.cancel:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #333;
          border-color: rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }

        .footer-button.download {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }

        .footer-button.download:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
        }

        /* Mobile Optimizations */
        @media (max-width: 767px) {
          .image-editor-overlay {
            padding: 0;
          }

          .image-editor-container {
            width: 100%;
            height: 100%;
            border-radius: 0;
          }

          .editor-header {
            padding: 20px;
          }

          .editor-sidebar {
            max-height: 40vh;
          }

          .preview-container {
            padding: 16px;
          }

          .editor-footer {
            padding: 20px;
            flex-direction: column;
          }

          .footer-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;
