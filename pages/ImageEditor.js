import { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ imageUrl, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('filters');
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Editing states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    exposure: 0,
    vignette: 0,
    sepia: 0
  });

  const [background, setBackground] = useState({
    type: 'transparent',
    color: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
    canvas.width = img.width;
    canvas.height = img.height;
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
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      hue-rotate(${filters.hue}deg)
      blur(${filters.blur}px)
      sepia(${filters.sepia}%)
    `;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply vignette
    if (filters.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Update canvas when filters change
  useEffect(() => {
    if (image) {
      drawImageOnCanvas(image);
    }
  }, [filters, background, image]);

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
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

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      exposure: 0,
      vignette: 0,
      sepia: 0
    });
  };

  const presetFilters = {
    vintage: { brightness: 90, contrast: 110, saturation: 80, hue: -30, vignette: 20, sepia: 30 },
    dramatic: { brightness: 80, contrast: 120, saturation: 90, vignette: 30 },
    bright: { brightness: 120, contrast: 110, saturation: 110 },
    bw: { brightness: 100, contrast: 120, saturation: 0, sepia: 0 }
  };

  const applyPreset = (preset) => {
    setFilters(prev => ({ ...prev, ...presetFilters[preset] }));
  };

  const gradientPresets = [
    { name: 'Sunset', value: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { name: 'Coral', value: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    { name: 'Emerald', value: 'linear-gradient(135deg, #43e97b, #38f9d7)' }
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

  return (
    <div className="image-editor-overlay">
      <div className="image-editor-container">
        {/* Header */}
        <div className="editor-header">
          <div className="header-left">
            <div className="editor-logo">✎</div>
            <div className="header-text">
              <h2>Image Editor</h2>
              <p>Edit your image with professional tools</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Main Content */}
        <div className={`editor-main ${isMobile ? 'mobile' : ''}`}>
          {/* Sidebar - Editing Tools */}
          <div className="editor-sidebar">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              {[
                { id: 'filters', icon: '🎨', label: 'Filters' },
                { id: 'adjust', icon: '⚙️', label: 'Adjust' },
                { id: 'background', icon: '🖼️', label: 'Background' }
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
                      {Object.keys(presetFilters).map(preset => (
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
                      { key: 'sepia', label: 'Sepia', min: 0, max: 100 }
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
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .image-editor-container {
          background: white;
          border-radius: 12px;
          width: 95%;
          max-width: 1200px;
          height: 90%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          overflow: hidden;
        }

        .editor-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .editor-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          font-weight: bold;
        }

        .header-text h2 {
          margin: 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
        }

        .header-text p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .close-button {
          background: #f3f4f6;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
          font-weight: bold;
        }

        .editor-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .editor-main.mobile {
          flex-direction: column;
        }

        .editor-sidebar {
          width: 350px;
          border-right: 1px solid #e5e7eb;
          padding: 20px;
          overflow-y: auto;
          background: white;
        }

        .editor-main.mobile .editor-sidebar {
          width: 100%;
          border-right: none;
          border-bottom: 1px solid #e5e7eb;
          max-height: 40vh;
        }

        .tab-navigation {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tab-button {
          background: transparent;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          background: #f9fafb;
        }

        .tab-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .tools-section {
          margin-bottom: 20px;
        }

        .tools-section h3 {
          color: #1f2937;
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 700;
        }

        .tools-section h4 {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .preset-button {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 10px 8px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          text-transform: capitalize;
          font-weight: 600;
          color: #374151;
          transition: all 0.2s ease;
        }

        .preset-button:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .filter-slider {
          margin-bottom: 16px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .slider-label {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        }

        .slider-value {
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 8px;
        }

        .slider-input {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          cursor: pointer;
        }

        .background-type, .color-picker-section {
          margin-bottom: 16px;
        }

        .background-type label, .color-picker-section label {
          display: block;
          color: #374151;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .background-select, .color-picker {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .color-picker {
          height: 50px;
          padding: 8px;
        }

        .gradients-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .gradient-preset {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .gradient-preset.active {
          border-color: #3b82f6;
        }

        .reset-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          width: 100%;
          margin-top: 20px;
        }

        .editor-preview {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #f8fafc;
        }

        .editor-main.mobile .editor-preview {
          min-height: 50vh;
        }

        .preview-container {
          max-width: 100%;
          max-height: 100%;
          overflow: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 16px;
        }

        .preview-canvas {
          max-width: 100%;
          max-height: 60vh;
          display: block;
          border-radius: 4px;
        }

        .editor-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          background: white;
        }

        .editor-main.mobile .editor-footer {
          flex-direction: column;
        }

        .footer-button {
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          border: none;
        }

        .footer-button.cancel {
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .footer-button.cancel:hover {
          background: #f9fafb;
        }

        .footer-button.download {
          background: #10b981;
          color: white;
        }

        .footer-button.download:hover {
          background: #059669;
        }

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
            padding: 16px;
          }

          .preview-container {
            padding: 12px;
          }

          .editor-footer {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;
