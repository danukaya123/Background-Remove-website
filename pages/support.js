'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext'; // Add this import
import Head from 'next/head';

export default function Support() {
  const pageMeta = {
    title: 'Support - Quizontal AI Background Remover',
    description: 'Get help and support for Quizontal AI background removal. Contact our team, access documentation, and get your questions answered.',
    image: 'https://rbg.quizontal.cc/og-image.jpg',
    url: 'https://rbg.quizontal.cc/support'
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const sidebarRef = useRef(null);
  const pathname = usePathname();
  
  // Use the same AuthContext as your other pages
  const { currentUser, userProfile, logout } = useAuth();

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && 
          !event.target.closest('.mobile-sidebar') && 
          !event.target.closest('.menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Pre-fill form with user data when user is logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ 
        ...prev, 
        email: currentUser.email || '',
        name: userProfile?.username || ''
      }));
    }
  }, [currentUser, userProfile]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Use the same logout function as your other pages
  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(''), 5000);
    }, 2000);
  };

  // Updated contact methods with Font Awesome icons
  const contactMethods = [
    {
      icon: 'fas fa-envelope',
      title: 'Email Us',
      description: 'Send us an email anytime',
      contact: 'business.quizontal@gmail.com',
      link: 'mailto:business.quizontal@gmail.com',
      color: '#3b82f6'
    },
    {
      icon: 'fab fa-whatsapp',
      title: 'WhatsApp',
      description: 'Chat with us directly',
      contact: '+94 77 491 5917',
      link: 'https://wa.me/94774915917',
      color: '#25D366'
    },
    {
      icon: 'fab fa-facebook',
      title: 'Facebook',
      description: 'Message us on Facebook',
      contact: '@danuka dissanayake',
      link: 'https://web.facebook.com/danuka.disanayaka.3701/',
      color: '#1877F2'
    },
    {
      icon: 'fab fa-youtube',
      title: 'Youtube',
      description: 'Follow us for updates',
      contact: '@quizontal',
      link: 'https://www.youtube.com/@quizontal',
      color: '#1DA1F2'
    }
  ];

  const faqs = [
    {
      question: "How long does background removal take?",
      answer: "Typically 2-5 seconds depending on image size and server load. Our AI processes images in real-time for the fastest results."
    },
    {
      question: "Is there a limit to how many images I can process?",
      answer: "No! Quizontal is completely free with no limits for individual users. Process as many images as you need."
    },
    {
      question: "What image formats are supported?",
      answer: "We support PNG, JPG, JPEG, and WEBP formats. Maximum file size is 25MB per image."
    },
    {
      question: "How accurate is the background removal?",
      answer: "Our AI achieves 99%+ accuracy for most images, with excellent edge detection for hair, transparent objects, and complex backgrounds."
    },
    {
      question: "Do you store my images?",
      answer: "No, we automatically delete processed images from our servers. Your privacy and data security are our top priorities."
    },
    {
      question: "Can I use this for commercial purposes?",
      answer: "Yes! Quizontal is free for both personal and commercial use. No attribution required."
    }
  ];

  return (
    <div className="support-page">
      <Head>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
        <meta property="og:title" content={pageMeta.title} />
        <meta property="og:description" content={pageMeta.description} />
        <meta property="og:image" content={pageMeta.image} />
        <meta property="og:url" content={pageMeta.url} />
        <meta name="twitter:title" content={pageMeta.title} />
        <meta name="twitter:description" content={pageMeta.description} />
        <meta name="twitter:image" content={pageMeta.image} />
        
        {/* Font Awesome CDN */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </Head>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          scroll-behavior: smooth;
          overflow-x: hidden;
          width: 100%;
        }

        .support-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
          color: #1e293b;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0;
          margin: 0;
          width: 100%;
          overflow-x: hidden;
        }

        /* Enhanced Responsive Animations */
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
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

        /* Enhanced Responsive Design */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          
          .mobile-only {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
          
          .mobile-sidebar {
            display: none !important;
          }
        }

        /* Main Content */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          width: 100%;
          overflow-x: hidden;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 4rem 0 2rem;
          width: 100%;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .page-subtitle {
          font-size: 1.2rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .content-section {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          border: 1px solid #f1f5f9;
          width: 100%;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        /* IMPROVED: Contact Card Styles with Larger Image */
        .contact-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 3rem;
          color: white;
          text-align: center;
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .contact-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }

        /* LARGER AUTHOR IMAGE */
        .author-image {
          width: 180px; /* Increased from 120px */
          height: 240px; /* Increased from 160px */
          border-radius: 20px; /* Slightly larger radius */
          object-fit: cover;
          border: 4px solid rgba(255,255,255,0.3); /* Thicker border */
          margin: 0 auto 2rem; /* More margin bottom */
          display: block;
          box-shadow: 0 15px 40px rgba(0,0,0,0.4); /* Enhanced shadow */
        }

        .author-name {
          font-size: 1.75rem; /* Slightly larger */
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .author-role {
          font-size: 1.1rem; /* Slightly larger */
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .author-bio {
          font-size: 1rem; /* Slightly larger */
          line-height: 1.6;
          opacity: 0.8;
          margin-bottom: 2rem;
          max-width: 450px; /* Slightly wider */
          margin-left: auto;
          margin-right: auto;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .social-link {
          width: 50px; /* Slightly larger */
          height: 50px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15); /* Slightly more visible */
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3); /* Thicker border */
          font-size: 1.2rem; /* Larger icons */
        }

        .social-link:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-3px); /* More lift on hover */
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        /* IMPROVED: Contact Methods Grid with Font Awesome */
        .contact-methods-grid {
          
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .contact-method {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .contact-method:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        .method-icon {
          margin-bottom: 1rem;
        }

        .method-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .method-description {
          color: #64748b;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .method-contact {
          font-weight: 600;
          color: #3b82f6;
          text-decoration: none;
          transition: all 0.3s;
        }

        .method-contact:hover {
          color: #1d4ed8;
        }

        /* IMPROVED: Auth Section Styles */
        .auth-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          white-space: nowrap;
        }

        .user-email {
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
        }

        .auth-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem;
          margin-top: 0.5rem;
          min-width: 220px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        /* Form Styles */
        .contact-form {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid #f1f5f9;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #1e293b;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .status-message {
          padding: 1rem;
          border-radius: 10px;
          margin-top: 1rem;
          text-align: center;
          font-weight: 600;
        }

        .status-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        /* FAQ Styles */
        .faq-grid {
          display: grid;
          gap: 1rem;
          margin-top: 2rem;
        }

        .faq-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .faq-item:hover {
          border-color: #3b82f6;
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.1);
        }

        .faq-question {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .faq-answer {
          color: #64748b;
          line-height: 1.6;
        }

        /* Support Buttons */
        .support-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 2rem;
        }

        .support-btn {
          padding: 12px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 50px;
        }

        .support-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .support-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb, #1e40af);
        }

        .support-btn-outline {
          background: transparent;
          border: 2px solid #3b82f6;
          color: #3b82f6;
          font-weight: 600;
        }

        .support-btn-outline:hover {
          background: #3b82f6;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        /* Footer Section */
        footer {
          border-top: 1px solid #e2e8f0;
          padding: 4rem 2rem 3rem;
          background: #f8fafc;
          margin-top: 6rem;
          width: 100%;
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
          gap: 12px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .footer-logo-icon {
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

        .footer-logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .footer-logo-accent {
          color: #3b82f6;
        }

        .footer-text {
          color: #64748b;
          margin: 1rem 0;
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 2rem 0;
          flex-wrap: wrap;
        }

        .footer-link {
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
          padding: 8px 12px;
          border-radius: 6px;
        }

        .footer-link:hover {
          color: #3b82f6;
          background: #f1f5f9;
        }

        .footer-copyright {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        /* Mobile Sidebar Styles */
        .mobile-sidebar {
          animation: slideInLeft 0.3s ease-out;
        }
        
        .mobile-sidebar.closing {
          animation: slideOutLeft 0.3s ease-in;
        }
        
        .sidebar-overlay {
          animation: overlayFadeIn 0.3s ease-out;
        }
        
        .sidebar-overlay.closing {
          animation: overlayFadeOut 0.3s ease-in;
        }

        /* IMPROVED: Responsive Design for Mobile */
        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .page-header {
            padding: 2rem 0 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .page-subtitle {
            font-size: 1rem;
            padding: 0 1rem;
          }

          .content-section {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .contact-card {
            padding: 2rem 1.5rem;
          }

          .author-image {
            width: 180px; /* Adjusted for mobile */
            height: 240px;
          }

          .contact-methods-grid {
           
          }

          .contact-form {
            padding: 1.5rem;
          }

          .support-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .support-btn {
            width: 100%;
            max-width: 280px;
            padding: 14px 24px;
          }

          footer {
            padding: 3rem 1rem 2rem;
          }

          .footer-logo {
            gap: 8px;
          }

          .footer-logo-icon {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }

          .footer-logo-text {
            font-size: 1.3rem;
          }

          .footer-text {
            font-size: 1rem;
            padding: 0 1rem;
          }

          .footer-links {
            gap: 1rem;
            margin: 1.5rem 0;
          }

          .footer-link {
            font-size: 0.9rem;
            padding: 6px 10px;
          }

          /* Mobile auth improvements */
          .auth-section {
            gap: 0.5rem;
          }

          .user-name {
            font-size: 13px;
          }

          .user-email {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.75rem;
          }

          .content-section {
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .contact-card {
            padding: 1.5rem 1rem;
          }

          .author-image {
            width: 180px;
            height: 240px;
          }

          .social-links {
            gap: 0.75rem;
          }

          .social-link {
            width: 45px;
            height: 45px;
            font-size: 1.1rem;
          }

          .support-btn {
            padding: 16px 24px;
            font-size: 1.1rem;
          }
        }

        @media (min-width: 1200px) {
          .nav-container {
            max-width: 1200px;
          }
        }
      `}</style>

      {/* Navigation */}
      {/* Navigation - This will now show user account when logged in */}
      <nav
        style={{
          borderBottom: "1px solid #e2e8f0",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="nav-container"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: 'none' }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "16px",
                color: "white",
              }}
            >
              Q
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#1e293b",
                letterSpacing: "-0.5px",
              }}
            >
              Quizontal<span style={{ color: "#3b82f6" }}>RBG</span>
            </span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="desktop-only nav-links" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {[
    { name: 'Home', href: 'https://rbg.quizontal.cc' },
    { name: 'Upload', href: 'https://rbg.quizontal.cc' },
    { name: 'Features', href: 'https://rbg.quizontal.cc' },
    { name: 'Examples', href: 'https://rbg.quizontal.cc' },
    { name: 'API Documentation', href: '/api-documentation' },
    { name: 'About', href: '/about' },
    { name: 'Support', href: '/support' },
    { name: 'Blog', href: 'https://blog.quizontal.cc' }
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                style={{ 
                  color: pathname === item.href ? "#3b82f6" : "#64748b", 
                  textDecoration: "none", 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  transition: "all 0.3s",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                  background: pathname === item.href ? "#f1f5f9" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.color = "#3b82f6";
                    e.currentTarget.style.background = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginLeft: "0.5rem" }}>
              {currentUser ? (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* User Profile Dropdown */}
                  <div style={{ position: "relative" }}>
                    <button
                      style={{
                        background: "transparent",
                        border: "1px solid #d1d5db",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        color: "#374151",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.borderColor = "#9ca3af";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        {userProfile?.username?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {userProfile?.username || currentUser?.email || "User"}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "0.75rem",
                          marginTop: "0.5rem",
                          minWidth: "200px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          zIndex: 1000,
                        }}
                      >
                        <div style={{ padding: "0.5rem 0.75rem", color: "#64748b", fontSize: "14px", borderBottom: "1px solid #f1f5f9" }}>
                          Signed in as<br />
                          <strong style={{ color: "#1e293b" }}>{currentUser?.email || "User"}</strong>
                        </div>
                        {userProfile && (
                          <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>Username:</div>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{userProfile.username}</div>
                            {userProfile.phoneNumber && (
                              <>
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Phone:</div>
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{userProfile.phoneNumber}</div>
                              </>
                            )}
                          </div>
                        )}
                        <button
                          onClick={handleLogout}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            padding: "0.75rem",
                            textAlign: "left",
                            color: "#dc2626",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            borderRadius: "6px",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    style={{
                      background: "transparent",
                      border: "1px solid #d1d5db",
                      padding: "6px 16px",
                      borderRadius: "6px",
                      color: "#374151",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      whiteSpace: "nowrap",
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#9ca3af";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      border: "none",
                      padding: "6px 16px",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      boxShadow: "0 2px 10px rgba(59, 130, 246, 0.3)",
                      whiteSpace: "nowrap",
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 10px rgba(59, 130, 246, 0.3)";
                    }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="mobile-only">
            <button
              className="menu-toggle"
              onClick={toggleMobileMenu}
              style={{
                background: "transparent",
                border: "none",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                zIndex: 1001,
                position: "relative",
              }}
            >
              <span style={{ 
                width: "24px", 
                height: "2px", 
                background: "#1e293b",
                transition: "all 0.3s",
                transform: mobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
              }}></span>
              <span style={{ 
                width: "24px", 
                height: "2px", 
                background: "#1e293b",
                transition: "all 0.3s",
                opacity: mobileMenuOpen ? "0" : "1"
              }}></span>
              <span style={{ 
                width: "24px", 
                height: "2px", 
                background: "#1e293b",
                transition: "all 0.3s",
                transform: mobileMenuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none"
              }}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className={`sidebar-overlay ${!mobileMenuOpen ? 'closing' : ''}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Navigation */}
      <div
        ref={sidebarRef}
        className={`mobile-sidebar ${!mobileMenuOpen ? 'closing' : ''}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(85vw, 320px)",
          background: "white",
          zIndex: 1000,
          boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
          display: mobileMenuOpen ? "flex" : "none",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #f8fafc, #ffffff)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
                color: "white",
              }}
            >
              Q
            </div>
            <div>
              <div style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#1e293b",
              }}>
                Quizontal<span style={{ color: "#3b82f6" }}>RBG</span>
              </div>
              <div style={{
                fontSize: "12px",
                color: "#64748b",
                marginTop: "2px"
              }}>
                AI Background Remover
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: "1rem 0" }}>
          {[
    { name: 'Home', href: 'https://rbg.quizontal.cc' },
    { name: 'Upload', href: 'https://rbg.quizontal.cc' },
    { name: 'Features', href: 'https://rbg.quizontal.cc' },
    { name: 'Examples', href: 'https://rbg.quizontal.cc' },
    { name: 'API Documentation', href: '/api-documentation' },
    { name: 'About', href: '/about' },
    { name: 'Support', href: '/support' },
    { name: 'Blog', href: 'https://blog.quizontal.cc' }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="mobile-nav-item"
              style={{
                display: "block",
                color: pathname === item.href ? "#3b82f6" : "#64748b",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                transition: "all 0.2s",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
                background: pathname === item.href ? "#f1f5f9" : "transparent",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}   
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div style={{
          padding: "1.5rem",
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc"
        }}>
          {currentUser ? (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
                  Signed in as
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>
                  {userProfile?.username || currentUser.email}
                </div>
                {userProfile?.phoneNumber && (
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                    {userProfile.phoneNumber}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid #dc2626",
                  color: "#dc2626",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                href="/login"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  border: "none",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 2px 10px rgba(59, 130, 246, 0.3)",
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="container">
          <section className="page-header">
            <h1 className="page-title">Support Center</h1>
            <p className="page-subtitle">
              Get help, contact our team, and find answers to your questions about Quizontal AI background removal.
            </p>
          </section>

          {/* Author Contact Card */}
          <section className="content-section slide-up">
            <div className="contact-card">
              <img 
                src="https://github.com/danukaya123/MY-NEW-WEB/blob/main/img/Danuka%20Disanayaka.jpg?raw=true" 
                alt="Danuka Dissanayake"
                className="author-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // Show fallback if image fails to load
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <h2 className="author-name">Danuka Dissanayake</h2>
              <p className="author-role">Founder & Lead Developer</p>
              <p className="author-bio">
                Hi! I'm the creator of Quizontal. I'm passionate about making AI accessible to everyone. 
                Feel free to reach out to me directly with any questions or feedback!
              </p>
              
              <div className="social-links">
                <a href="https://web.facebook.com/danuka.disanayaka.3701/" className="social-link" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://wa.me/94774915917" className="social-link" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href="mailto:business.quizontal@gmail.com" className="social-link">
                  <i className="fas fa-envelope"></i>
                </a>
                <a href="https://www.youtube.com/@quizontal" className="social-link" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </section>

          {/* Contact Methods */}
          <section className="content-section slide-up">
            <h2 className="section-title">Get In Touch</h2>
            <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: "1.7" }}>
              Choose your preferred method to contact us. We're here to help you with any questions 
              about Quizontal AI background removal.
            </p>
            
            <div className="contact-methods-grid">
              {contactMethods.map((method, index) => (
                <div key={index} className="contact-method">
                  <div className="method-icon">
                    <i className={method.icon} style={{ color: method.color, fontSize: '2.5rem' }}></i>
                  </div>
                  <h3 className="method-title">{method.title}</h3>
                  <p className="method-description">{method.description}</p>
                  <a href={method.link} className="method-contact" target="_blank" rel="noopener noreferrer">
                    {method.contact}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="content-section slide-up">
            <h2 className="section-title">Send us a Message</h2>
            <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: "1.7" }}>
              Prefer to send us a detailed message? Fill out the form below and we'll get back to you as soon as possible.
            </p>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="What is this regarding?"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i>
                    Send Message
                  </>
                )}
              </button>
              
              {submitStatus === 'success' && (
                <div className="status-message status-success">
                  <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
            </form>
          </section>

          {/* FAQ Section */}
          <section className="content-section slide-up">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: "1.7" }}>
              Quick answers to common questions about Quizontal AI background removal.
            </p>
            
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3 className="faq-question">
                    <i className="fas fa-question-circle" style={{ color: '#3b82f6', marginRight: '8px' }}></i>
                    {faq.question}
                  </h3>
                  <p className="faq-answer">
                    <i className="fas fa-arrow-right" style={{ color: '#64748b', marginRight: '8px', fontSize: '12px' }}></i>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: "#64748b", marginBottom: '1rem' }}>
                Still have questions? We're here to help!
              </p>
              <div className="support-buttons">
                <a href="mailto:business.quizontal@gmail.com" className="support-btn support-btn-primary">
                  <i className="fas fa-envelope"></i>
                  Email Support
                </a>
                <a href="https://wa.me/94774915917" className="support-btn support-btn-outline" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp"></i>
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-logo-icon">Q</div>
            <div className="footer-logo-text">Quizontal<span className="footer-logo-accent">RBG</span></div>
          </div>
          <p className="footer-text">
AI-powered background removal made simple and free.


          </p>
          <p className="footer-copyright">
            &copy; 2024 QuizontalRBG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
