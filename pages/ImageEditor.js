import { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ imageUrl, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('filters');
  const [image, setImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

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
    gradient: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    pattern: 'none'
  });

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    aspectRatio: 'free',
    isCropping: false
  });

  const [size, setSize] = useState({
    width: 100,
    height: 100,
    lockAspectRatio: true
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
        setEditedImage(img);
        drawImageOnCanvas(img);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const drawImageOnCanvas = (img, applyFilters = true) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

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
    { name: 'Sunset', value: 'linear-gradient(45deg, #667eea, #764ba2)' },
    { name: 'Coral', value: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { name: 'Ocean', value: 'linear-gradient(45deg, #4facfe, #00f2fe)' },
    { name: 'Emerald', value: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    { name: 'Fire', value: 'linear-gradient(45deg, #fa709a, #fee140)' },
    { name: 'Royal', value: 'linear-gradient(135deg, #667eea, #764ba2)' }
  ];

  const FilterSlider = ({ label, value, min, max, onChange, unit = '%' }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{ 
          color: '#374151', 
          fontSize: '14px', 
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {label}
        </span>
        <span style={{ 
          color: '#6b7280', 
          fontSize: '12px', 
          fontWeight: '600',
          background: '#f3f4f6',
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '10px',
          background: 'linear-gradient(90deg, #e5e7eb 0%, #3b82f6 100%)',
          outline: 'none',
          WebkitAppearance: 'none',
          cursor: 'pointer'
        }}
      />
    </div>
  );

  const MobileToolbar = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 1000
    }}>
      {[
        { id: 'filters', icon: '🎨', label: 'Filters' },
        { id: 'adjust', icon: '⚙️', label: 'Adjust' },
        { id: 'crop', icon: '✂️', label: 'Crop' },
        { id: 'background', icon: '🖼️', label: 'Background' },
        { id: 'effects', icon: '✨', label: 'Effects' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            background: activeTab === tab.id ? '#3b82f6' : 'transparent',
            color: activeTab === tab.id ? 'white' : '#6b7280',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '60px',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '16px' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '0' : '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        background: 'white',
        borderRadius: isMobile ? '0' : '24px',
        width: isMobile ? '100%' : '95%',
        maxWidth: '1400px',
        height: isMobile ? '100%' : '90%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '16px' : '24px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ✎
            </div>
            <h2 style={{ 
              margin: 0, 
              color: '#1f2937', 
              fontSize: isMobile ? '20px' : '24px', 
              fontWeight: '700' 
            }}>
              Image Editor
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isMobile && (
              <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                {showMobilePreview ? 'Tools' : 'Preview'}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: isMobile ? '18px' : '20px',
                cursor: 'pointer',
                color: '#6b7280',
                fontWeight: 'bold',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          flexDirection: isMobile && showMobilePreview ? 'column-reverse' : 'row'
        }}>
          {/* Sidebar - Editing Tools */}
          {(!isMobile || !showMobilePreview) && (
            <div style={{
              width: isMobile ? '100%' : '360px',
              borderRight: isMobile ? 'none' : '1px solid #f3f4f6',
              padding: isMobile ? '16px' : '24px',
              overflowY: 'auto',
              background: 'white'
            }}>
              {/* Desktop Tab Navigation */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px',
                  borderBottom: '1px solid #f3f4f6',
                  paddingBottom: '16px'
                }}>
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
                      style={{
                        background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                        color: activeTab === tab.id ? 'white' : '#6b7280',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        flex: 1,
                        justifyContent: 'center'
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Filter Tools */}
              {activeTab === 'filters' && (
                <div>
                  <h3 style={{ 
                    color: '#1f2937', 
                    marginBottom: '20px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    Filters & Effects
                  </h3>
                  
                  {/* Preset Filters */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ 
                      color: '#6b7280', 
                      fontSize: '14px', 
                      marginBottom: '12px',
                      fontWeight: '600'
                    }}>
                      Quick Presets
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px'
                    }}>
                      {Object.entries(presetFilters).map(([preset, config]) => (
                        <button
                          key={preset}
                          onClick={() => applyPreset(preset)}
                          style={{
                            background: '#f8fafc',
                            border: '2px solid #e5e7eb',
                            padding: '12px 8px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: '600',
                            color: '#374151',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Sliders */}
                  <div style={{ maxHeight: isMobile ? '300px' : '400px', overflowY: 'auto' }}>
                    {[
                      { key: 'brightness', label: 'Brightness', min: 0, max: 200 },
                      { key: 'contrast', label: 'Contrast', min: 0, max: 200 },
                      { key: 'saturation', label: 'Saturation', min: 0, max: 200 },
                      { key: 'hue', label: 'Hue Rotation', min: -180, max: 180, unit: '°' },
                      { key: 'blur', label: 'Blur', min: 0, max: 20, unit: 'px' },
                      { key: 'vignette', label: 'Vignette', min: 0, max: 50 },
                      { key: 'sepia', label: 'Sepia', min: 0, max: 100 },
                      { key: 'invert', label: 'Invert', min: 0, max: 100 }
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
                <div>
                  <h3 style={{ 
                    color: '#1f2937', 
                    marginBottom: '20px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    Fine Tune
                  </h3>
                  
                  <div style={{ maxHeight: isMobile ? '300px' : '400px', overflowY: 'auto' }}>
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
                <div>
                  <h3 style={{ 
                    color: '#1f2937', 
                    marginBottom: '20px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    Background
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#374151', 
                      marginBottom: '12px', 
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Background Type
                    </label>
                    <select
                      value={background.type}
                      onChange={(e) => handleBackgroundChange('type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="transparent">Transparent</option>
                      <option value="color">Solid Color</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>

                  {background.type === 'color' && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        color: '#374151', 
                        marginBottom: '12px', 
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        Color Picker
                      </label>
                      <input
                        type="color"
                        value={background.color}
                        onChange={(e) => handleBackgroundChange('color', e.target.value)}
                        style={{
                          width: '100%',
                          height: '60px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          padding: '8px'
                        }}
                      />
                    </div>
                  )}

                  {background.type === 'gradient' && (
                    <div>
                      <h4 style={{ 
                        color: '#6b7280', 
                        fontSize: '14px', 
                        marginBottom: '12px',
                        fontWeight: '600'
                      }}>
                        Gradient Presets
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px'
                      }}>
                        {gradientPresets.map((gradient, index) => (
                          <div
                            key={index}
                            onClick={() => handleBackgroundChange('gradient', gradient.value)}
                            style={{
                              width: '100%',
                              aspectRatio: '1',
                              background: gradient.value,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              border: background.gradient === gradient.value ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
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
                <div>
                  <h3 style={{ 
                    color: '#1f2937', 
                    marginBottom: '20px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    Advanced Effects
                  </h3>
                  
                  <div style={{ maxHeight: isMobile ? '300px' : '400px', overflowY: 'auto' }}>
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
                <div>
                  <h3 style={{ 
                    color: '#1f2937', 
                    marginBottom: '20px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    Crop & Resize
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#374151', 
                      marginBottom: '12px', 
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Aspect Ratio
                    </label>
                    <select
                      value={crop.aspectRatio}
                      onChange={(e) => setCrop(prev => ({ ...prev, aspectRatio: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="free">Free Form</option>
                      <option value="1:1">Square (1:1)</option>
                      <option value="4:3">Landscape (4:3)</option>
                      <option value="3:4">Portrait (3:4)</option>
                      <option value="16:9">Widescreen (16:9)</option>
                      <option value="9:16">Vertical (9:16)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <FilterSlider
                      label="Width"
                      value={size.width}
                      min={10}
                      max={200}
                      onChange={(value) => setSize(prev => ({ ...prev, width: value }))}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <FilterSlider
                      label="Height"
                      value={size.height}
                      min={10}
                      max={200}
                      onChange={(value) => setSize(prev => ({ ...prev, height: value }))}
                    />
                  </div>

                  <button
                    onClick={() => setCrop(prev => ({ ...prev, isCropping: !prev.isCropping }))}
                    style={{
                      background: crop.isCropping ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      width: '100%',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {crop.isCropping ? 'Cancel Crop' : 'Start Cropping'}
                  </button>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  width: '100%',
                  marginTop: '20px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                Reset All Changes
              </button>
            </div>
          )}

          {/* Preview Area */}
          {(!isMobile || showMobilePreview) && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '16px' : '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              position: 'relative',
              minHeight: isMobile ? '60vh' : 'auto'
            }}>
              <div style={{
                maxWidth: '100%',
                maxHeight: '100%',
                overflow: 'auto',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                padding: isMobile ? '16px' : '24px',
                border: '1px solid #f3f4f6'
              }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: isMobile ? '50vh' : '60vh',
                    display: 'block',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }}
                />
                {crop.isCropping && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '2px dashed #3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    cursor: 'move'
                  }} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Toolbar */}
        {isMobile && <MobileToolbar />}

        {/* Footer Actions */}
        <div style={{
          padding: isMobile ? '16px' : '24px',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          gap: '12px',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          background: 'white'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              padding: isMobile ? '12px 16px' : '14px 28px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              flex: isMobile ? 1 : 'auto',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9ca3af';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: isMobile ? '12px 16px' : '14px 28px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              flex: isMobile ? 1 : 'auto',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            {isMobile ? 'Download' : 'Download Edited Image'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
