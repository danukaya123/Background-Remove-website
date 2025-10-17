'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function About() {
  const pathname = usePathname();

  useEffect(() => {
    // Set active page in navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      // Remove active class from all links first
      link.classList.remove('active');
      
      // Add active class to current page link
      if (linkHref === pathname) {
        link.classList.add('active');
      }
    });
  }, [pathname]);

  return (
    <div className="page-container">
      <header>
        <div className="container">
          <nav className="navbar">
            <Link href="/" className="logo">
              <div className="logo-icon">Q</div>
              Quizontal<span>RBG</span>
            </Link>
            
            <ul className="nav-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/upload">Upload</Link></li>
              <li><Link href="/examples">Examples</Link></li>
              <li><Link href="/api">API</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
            
            <div className="auth-buttons">
              <a href="#" className="btn btn-outline">Log in</a>
              <a href="#" className="btn btn-primary">Sign up</a>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          <section className="page-header">
            <h1>About Quizontal</h1>
            <p>Learn about our mission to make AI-powered background removal accessible to everyone, for free.</p>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>Our Story</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Quizontal was born from a simple idea: everyone should have access to professional-quality 
                background removal technology without the high costs and complexity. Founded in 2023, our 
                mission has been to democratize AI-powered image editing tools.
              </p>
              <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                We believe that powerful technology should be accessible to students, small businesses, 
                content creators, and anyone who needs to edit images. That&apos;s why we&apos;ve built Quizontal 
                RBG - a completely free, no-watermark background removal service powered by cutting-edge 
                artificial intelligence.
              </p>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>Our Mission</h2>
            <div className="content-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Accessibility</h3>
                <p>Make professional background removal tools available to everyone, regardless of budget or technical expertise.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Performance</h3>
                <p>Deliver lightning-fast processing with pixel-perfect accuracy using advanced AI algorithms.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Privacy First</h3>
                <p>Process your images securely with automatic deletion and no data storage on our servers.</p>
              </div>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>Our Impact</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Images Processed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">2s</div>
                <div className="stat-label">Average Processing</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Free Forever</div>
              </div>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>The Technology</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Quizontal RBG leverages state-of-the-art deep learning models trained on millions of images 
                to deliver exceptional background removal results. Our AI understands complex image contexts, 
                handles fine details like hair and transparent objects, and maintains original image quality.
              </p>
              <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
                <h4 style={{ color: '#1e293b', marginBottom: '1rem' }}>Key Technical Features:</h4>
                <ul style={{ color: '#64748b', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                  <li>Advanced neural networks for precise edge detection</li>
                  <li>Real-time processing optimization</li>
                  <li>Support for all major image formats (PNG, JPG, WEBP)</li>
                  <li>Lossless quality preservation</li>
                  <li>Automatic image enhancement</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="content-section slide-up">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>Join Our Community</h2>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                We&apos;re constantly improving our technology and adding new features. Join thousands of users 
                who trust Quizontal for their image editing needs.
              </p>
              <Link href="/" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
                Start Removing Backgrounds Now
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon">Q</div>
            <span>Quizontal<span className="logo-accent">RBG</span></span>
          </div>
          <p className="footer-text">
            AI-powered background removal made simple and free
          </p>
          <p className="footer-copyright">
            &copy; 2024 QuizontalRBG. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        :root {
          --primary: #3b82f6;
          --primary-dark: #1d4ed8;
          --secondary: #6c757d;
          --light: #f8f9fa;
          --dark: #1e293b;
          --success: #10b981;
          --border-radius: 8px;
          --box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          --transition: all 0.3s ease;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
          color: var(--dark);
          line-height: 1.6;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header & Navigation */
        header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo:hover {
          color: #1e293b;
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

        .nav-links {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-links a {
          text-decoration: none;
          color: #64748b;
          font-weight: 500;
          font-size: 14px;
          transition: var(--transition);
          padding: 6px 10px;
          border-radius: 6px;
        }

        .nav-links a:hover,
        .nav-links a.active {
          color: var(--primary);
          background: #f1f5f9;
        }

        .auth-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-left: 0.5rem;
        }

        .btn {
          padding: 6px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition);
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
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

        /* Main Content */
        main {
          flex: 1;
          padding: 2rem 0;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem 0;
        }

        .page-header h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .page-header p {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Content Sections */
        .content-section {
          background: white;
          border-radius: 20px;
          padding: clamp(1.5rem, 4vw, 2.5rem);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          border: 1px solid #f1f5f9;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: var(--transition);
          border: 1px solid #f1f5f9;
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #64748b;
          line-height: 1.6;
        }

        /* Stats Section */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 15px;
          border: 1px solid #e2e8f0;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #64748b;
          font-weight: 500;
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

        .footer-logo .logo-icon {
          width: 24px;
          height: 24px;
          font-size: 12px;
        }

        .footer-logo span {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .footer-logo .logo-accent {
          color: #3b82f6;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem 0;
          }
          
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }
          
          .auth-buttons {
            margin-left: 0;
          }
          
          .content-grid,
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
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
      `}</style>
    </div>
  );
}
