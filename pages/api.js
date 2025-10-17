import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Api() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Set active page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-item');
    
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href');
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }, []);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const copyCode = (button) => {
    const codeBlock = button.parentElement;
    const code = codeBlock.querySelector('pre').innerText;
    
    navigator.clipboard.writeText(code).then(() => {
      button.innerHTML = '✅ Copied!';
      setTimeout(() => {
        button.innerHTML = '📋 Copy';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
      button.innerHTML = '❌ Error';
      setTimeout(() => {
        button.innerHTML = '📋 Copy';
      }, 2000);
    });
  };

  return (
    <>
      <Head>
        <title>API - Quizontal AI Background Remover</title>
        <meta name="description" content="Integrate Quizontal's AI background removal into your applications with our simple REST API." />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Navigation */}
      <nav>
        <div className="nav-container">
          <Link href="/" className="logo">
            <div className="logo-icon">Q</div>
            <div className="logo-text">Quizontal<span className="logo-accent">RBG</span></div>
          </Link>
          
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/upload">Upload</Link>
            <Link href="/examples">Examples</Link>
            <Link href="/api" className="active">API</Link>
            <Link href="/about">About</Link>
          </div>
          
          <div className="auth-buttons">
            <a href="#" className="btn btn-outline">Log in</a>
            <a href="#" className="btn btn-primary">Sign up</a>
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}></div>
      <div className={`mobile-sidebar ${isMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">Q</div>
            <div>
              <div className="logo-text">Quizontal<span className="logo-accent">RBG</span></div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                AI Background Remover
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          <Link href="/" className="mobile-nav-item">Home</Link>
          <Link href="/upload" className="mobile-nav-item">Upload</Link>
          <Link href="/examples" className="mobile-nav-item">Examples</Link>
          <Link href="/api" className="mobile-nav-item">API</Link>
          <Link href="/about" className="mobile-nav-item">About</Link>
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="#" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Log in</a>
            <a href="#" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign up</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="container">
          {/* Page Header */}
          <section className="page-header">
            <h1 className="page-title">API Documentation</h1>
            <p className="page-subtitle">
              Integrate Quizontal&apos;s AI background removal into your applications with our simple REST API.
            </p>
          </section>

          {/* Quick Start */}
          <section className="content-section slide-up">
            <h2 className="section-title">Quick Start</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.7', fontSize: 'clamp(14px, 2vw, 1rem)' }}>
              Get started with our API in minutes. The Quizontal API provides programmatic access to 
              our AI-powered background removal technology. All API endpoints are free to use and 
              require no authentication for basic usage.
            </p>
            
            <div className="code-block">
              <button className="copy-btn" onClick={(e) => copyCode(e.target)}>📋 Copy</button>
              <pre><span className="code-keyword">from</span> gradio_client <span className="code-keyword">import</span> Client, handle_file

<span className="code-comment"># Initialize the client</span>
client = Client(<span className="code-string">&quot;danuka21/quizontal-Background-Remover-C1&quot;</span>)

<span className="code-comment"># Remove background from an image</span>
result = client.predict(
    image=handle_file(<span className="code-string">&apos;https://example.com/image.png&apos;</span>),
    api_name=<span className="code-string">&quot;/image&quot;</span>
)
<span className="code-keyword">print</span>(result)</pre>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="content-section slide-up">
            <h2 className="section-title">API Endpoints</h2>
            
            <div className="endpoint-card">
              <div className="endpoint-header">
                <span className="endpoint-method">POST</span>
                <span className="endpoint-path">/image</span>
              </div>
              <p className="endpoint-description">
                Remove background from a single image. Supports PNG, JPG, and WEBP formats up to 25MB.
              </p>
              
              <h4 style={{ color: '#1e293b', margin: '1.5rem 0 1rem', fontSize: 'clamp(1.1rem, 3vw, 1.25rem)' }}>Parameters</h4>
              <div className="parameter-table-container">
                <table className="parameter-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>image</td>
                      <td>File</td>
                      <td><span className="param-required">Yes</span></td>
                      <td>Image file to process (PNG, JPG, WEBP)</td>
                    </tr>
                    <tr>
                      <td>api_name</td>
                      <td>String</td>
                      <td><span className="param-required">Yes</span></td>
                      <td>Must be &quot;/image&quot;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h4 style={{ color: '#1e293b', margin: '1.5rem 0 1rem', fontSize: 'clamp(1.1rem, 3vw, 1.25rem)' }}>Response</h4>
              <div className="code-block">
                <button className="copy-btn" onClick={(e) => copyCode(e.target)}>📋 Copy</button>
                <pre>{`{
  "data": [
    [
      {
        "url": "https://processed-image-url.com/result.png",
        "size": [800, 600],
        "original_name": "input.jpg"
      }
    ]
  ],
  "duration": 2.1
}`}</pre>
              </div>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="content-section slide-up">
            <h2 className="section-title">Usage Examples</h2>
            
            <div className="examples-grid">
              <div className="example-card">
                <div className="example-icon">🐍</div>
                <h3 className="example-title">Python</h3>
                <div className="code-block" style={{ margin: '1rem 0' }}>
                  <button className="copy-btn" onClick={(e) => copyCode(e.target)}>📋 Copy</button>
                  <pre><span className="code-keyword">import</span> requests
<span className="code-keyword">from</span> gradio_client <span className="code-keyword">import</span> Client

client = Client(<span className="code-string">&quot;danuka21/quizontal-Background-Remover-C1&quot;</span>)
result = client.predict(
    image=<span className="code-string">&quot;path/to/image.jpg&quot;</span>,
    api_name=<span className="code-string">&quot;/image&quot;</span>
)</pre>
                </div>
              </div>
              
              <div className="example-card">
                <div className="example-icon">🟨</div>
                <h3 className="example-title">JavaScript</h3>
                <div className="code-block" style={{ margin: '1rem 0' }}>
                  <button className="copy-btn" onClick={(e) => copyCode(e.target)}>📋 Copy</button>
                  <pre><span className="code-comment">// Using fetch API</span>
<span className="code-keyword">const</span> formData = <span className="code-keyword">new</span> FormData();
formData.append(<span className="code-string">&apos;image&apos;</span>, imageFile);

<span className="code-keyword">const</span> response = <span className="code-keyword">await</span> fetch(
  <span className="code-string">&apos;https://huggingface.co/spaces/danuka21/quizontal-Background-Remover-C1&apos;</span>,
  {
    method: <span className="code-string">&apos;POST&apos;</span>,
    body: formData
  }
);</pre>
                </div>
              </div>
              
              <div className="example-card">
                <div className="example-icon">📱</div>
                <h3 className="example-title">Mobile Apps</h3>
                <div className="code-block" style={{ margin: '1rem 0' }}>
                  <button className="copy-btn" onClick={(e) => copyCode(e.target)}>📋 Copy</button>
                  <pre><span className="code-comment">// Swift example</span>
<span className="code-keyword">let</span> client = Client(
  src: <span className="code-string">&quot;danuka21/quizontal-Background-Remover-C1&quot;</span>
)
<span className="code-keyword">let</span> result = client.predict(
  inputs: [<span className="code-string">&quot;image&quot;</span>: imageData],
  endpoint: <span className="code-string">&quot;/image&quot;</span>
)</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits & Pricing */}
          <section className="content-section slide-up">
            <h2 className="section-title">Rate Limits & Pricing</h2>
            <div style={{ background: '#f0f9ff', padding: 'clamp(1.5rem, 3vw, 2rem)', borderRadius: '12px', border: '1px solid #bae6fd' }}>
              <h3 style={{ color: '#0369a1', marginBottom: '1rem', fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>🎉 Completely Free!</h3>
              <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: 'clamp(14px, 2vw, 1rem)' }}>
                The Quizontal API is completely free to use with no rate limits for individual users. 
                We believe in making AI accessible to everyone. For high-volume commercial use, 
                please contact us for enterprise solutions.
              </p>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Requests</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0$</div>
                  <div className="stat-label">Cost</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">25MB</div>
                  <div className="stat-label">Max File Size</div>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="content-section slide-up">
            <h2 className="section-title">Support</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.7', fontSize: 'clamp(14px, 2vw, 1rem)' }}>
              Need help integrating our API? Check out our documentation or contact our support team.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="#" className="btn btn-primary" style={{ fontSize: 'clamp(14px, 2vw, 1rem)', padding: '10px 20px' }}>View Full Documentation</a>
              <a href="#" className="btn btn-outline" style={{ fontSize: 'clamp(14px, 2vw, 1rem)', padding: '10px 20px' }}>Contact Support</a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon">Q</div>
            <div className="logo-text">Quizontal<span className="logo-accent">RBG</span></div>
          </div>
          <p className="footer-text">
            AI-powered background removal made simple and free
          </p>
          <p className="footer-copyright">
            &copy; 2024 QuizontalRBG. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
          color: #1e293b;
          padding: 0;
          margin: 0;
          scroll-behavior: smooth;
          overflow-x: hidden;
          width: 100%;
        }

        /* Navigation */
        nav {
          border-bottom: 1px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          width: 100%;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem clamp(1rem, 3vw, 2rem);
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: white;
        }

        .logo-text {
          font-size: clamp(18px, 4vw, 24px);
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .logo-accent {
          color: #3b82f6;
        }

        .nav-links {
          display: flex;
          gap: clamp(0.75rem, 2vw, 1.5rem);
          align-items: center;
        }

        .nav-links a {
          color: #64748b;
          text-decoration: none;
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 500;
          transition: all 0.3s;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .nav-links a:hover,
        .nav-links a.active {
          color: #3b82f6;
          background: #f1f5f9;
        }

        .auth-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-left: 0.5rem;
        }

        .btn {
          padding: 6px clamp(12px, 3vw, 16px);
          border-radius: 6px;
          font-weight: 600;
          font-size: clamp(12px, 2vw, 14px);
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .btn-outline:hover {
          background: #f8fafc;
          border-color: #9ca3af;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        /* Mobile Menu */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          gap: 4px;
        }

        .mobile-menu-toggle span {
          width: 20px;
          height: 2px;
          background: #64748b;
          transition: all 0.3s;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 998;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
        }

        .sidebar-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          right: -100%;
          width: 300px;
          height: 100%;
          background: white;
          z-index: 999;
          transition: right 0.3s;
          display: flex;
          flex-direction: column;
          box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        }

        .mobile-sidebar.active {
          right: 0;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .mobile-nav-item {
          display: block;
          padding: 1rem 1.5rem;
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
          border-left: 3px solid transparent;
        }

        .mobile-nav-item:hover,
        .mobile-nav-item.active {
          color: #3b82f6;
          background: #f8fafc;
          border-left-color: #3b82f6;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        /* Main Content */
        main {
          padding: clamp(2rem, 4vw, 3rem) 0;
          width: 100%;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 3vw, 2rem);
          width: 100%;
        }

        .page-header {
          text-align: center;
          margin-bottom: clamp(2rem, 4vw, 3rem);
          padding: clamp(1rem, 3vw, 2rem) 0;
        }

        .page-title {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .page-subtitle {
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .content-section {
          background: white;
          border-radius: 20px;
          padding: clamp(1.5rem, 4vw, 2.5rem);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          border: 1px solid #f1f5f9;
        }

        .section-title {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        /* Code Blocks */
        .code-block {
          position: relative;
          background: #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .code-block pre {
          color: #e2e8f0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: clamp(12px, 2vw, 14px);
          line-height: 1.5;
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .copy-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .copy-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .code-keyword {
          color: #f472b6;
        }

        .code-string {
          color: #86efac;
        }

        .code-comment {
          color: #94a3b8;
          font-style: italic;
        }

        /* Endpoint Cards */
        .endpoint-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid #e2e8f0;
        }

        .endpoint-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .endpoint-method {
          background: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
        }

        .endpoint-path {
          font-family: monospace;
          color: #1e293b;
          font-weight: 600;
          font-size: 16px;
        }

        .endpoint-description {
          color: #64748b;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        /* Parameter Table */
        .parameter-table-container {
          overflow-x: auto;
          margin: 1rem 0;
        }

        .parameter-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .parameter-table th {
          background: #f1f5f9;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
        }

        .parameter-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #64748b;
        }

        .param-required {
          background: #fef2f2;
          color: #dc2626;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Examples Grid */
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .example-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid #f1f5f9;
          text-align: center;
        }

        .example-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .example-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .stat-card {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #64748b;
          font-weight: 500;
          font-size: 14px;
        }

        /* Footer */
        footer {
          border-top: 1px solid #e2e8f0;
          padding: 3rem 1rem;
          background: #f8fafc;
          margin-top: auto;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .footer-text {
          color: #64748b;
          margin: 0.5rem 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .footer-copyright {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 1rem;
        }

        /* Animations */
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

        .slide-up {
          animation: slideUp 0.6s ease-out;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nav-links,
          .auth-buttons {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .examples-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .parameter-table {
            font-size: 14px;
          }

          .parameter-table th,
          .parameter-table td {
            padding: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .endpoint-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
