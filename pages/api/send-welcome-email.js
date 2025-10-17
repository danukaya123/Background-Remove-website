import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, displayName, username } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enhanced Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '🚀 Successfully Signed Up to Quizontal !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Quizontal</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.7;
              color: #334155;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              margin: 0;
              padding: 20px;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
              border: 1px solid #f1f5f9;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 50px 40px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><polygon points="1000,100 1000,0 0,100"/></svg>');
              background-size: cover;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
              border-radius: 20px;
              margin: 0 auto 25px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: 800;
              color: #764ba2;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            
            .header h1 {
              color: white;
              font-size: 32px;
              font-weight: 800;
              margin-bottom: 10px;
              letter-spacing: -0.5px;
              position: relative;
              z-index: 2;
            }
            
            .header p {
              color: rgba(255, 255, 255, 0.9);
              font-size: 18px;
              font-weight: 400;
              position: relative;
              z-index: 2;
            }
            
            .content {
              padding: 50px 40px;
            }
            
            .welcome-section {
              text-align: center;
              margin-bottom: 40px;
            }
            
            .welcome-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            
            .welcome-section h2 {
              font-size: 28px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 15px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            .welcome-section p {
              font-size: 18px;
              color: #64748b;
              line-height: 1.6;
            }
            
            .features-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin: 40px 0;
            }
            
            .feature-card {
              background: white;
              padding: 30px 25px;
              border-radius: 16px;
              text-align: center;
              border: 1px solid #f1f5f9;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            
            .feature-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .feature-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .feature-icon {
              width: 70px;
              height: 70px;
              margin: 0 auto 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              color: white;
            }
            
            .feature-card h3 {
              font-size: 18px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 12px;
            }
            
            .feature-card p {
              font-size: 14px;
              color: #64748b;
              line-height: 1.5;
            }
            
            .cta-section {
              text-align: center;
              margin: 40px 0;
              padding: 40px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 20px;
              border: 1px solid #e2e8f0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 18px 45px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 700;
              font-size: 18px;
              transition: all 0.3s ease;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
              margin: 20px 0;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
            }
            
            .stats-section {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 30px 0;
              text-align: center;
            }
            
            .stat-item {
              padding: 20px;
            }
            
            .stat-number {
              font-size: 28px;
              font-weight: 800;
              color: #667eea;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .footer {
              text-align: center;
              padding: 30px 40px;
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 10px;
            }
            
            .social-links {
              display: flex;
              justify-content: center;
              gap: 15px;
              margin: 20px 0;
            }
            
            .social-link {
              width: 40px;
              height: 40px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #64748b;
              text-decoration: none;
              transition: all 0.3s ease;
              border: 1px solid #e2e8f0;
            }
            
            .social-link:hover {
              background: #667eea;
              color: white;
              transform: translateY(-2px);
            }
            
            .support-section {
              background: #fef7ff;
              border: 1px solid #e9d5ff;
              border-radius: 16px;
              padding: 25px;
              margin: 30px 0;
              text-align: center;
            }
            
            .support-icon {
              font-size: 32px;
              margin-bottom: 15px;
            }
            
            @media (max-width: 600px) {
              .header {
                padding: 40px 20px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .features-grid {
                grid-template-columns: 1fr;
              }
              
              .stats-section {
                grid-template-columns: 1fr;
              }
              
              .header h1 {
                font-size: 24px;
              }
              
              .cta-section {
                padding: 30px 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header Section -->
            <div class="header">
              <div class="logo">Q</div>
              <h1>Welcome to Quizontal! 🎉</h1>
              <p>Your journey to stunning background-free images begins now</p>
            </div>
            
            <!-- Main Content -->
            <div class="content">
              <!-- Welcome Message -->
              <div class="welcome-section">
                <div class="welcome-icon">👋</div>
                <h2>Hello ${displayName || username || 'there'}!</h2>
                <p>Welcome to the future of image editing. We're thrilled to have you join our community of creators transforming their visuals with AI-powered magic.</p>
              </div>
              
              <!-- Stats Section -->
              <div class="stats-section">
                <div class="stat-item">
                  <div class="stat-number">10K+</div>
                  <div class="stat-label">Images Processed</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">99.9%</div>
                  <div class="stat-label">Accuracy Rate</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">⚡</div>
                  <div class="stat-label">Instant Results</div>
                </div>
              </div>
              
              <!-- Features Grid -->
              <div class="features-grid">
                <div class="feature-card">
                  <div class="feature-icon">🎨</div>
                  <h3>AI Background Removal</h3>
                  <p>Remove backgrounds instantly with our advanced AI technology. Perfect for product photos, portraits, and creative projects.</p>
                </div>
                
                <div class="feature-card">
                  <div class="feature-icon">✨</div>
                  <h3>Smart Enhancements</h3>
                  <p>Automatically enhance image quality, adjust lighting, and optimize colors for professional-looking results every time.</p>
                </div>
                
                <div class="feature-card">
                  <div class="feature-icon">🚀</div>
                  <h3>Lightning Fast</h3>
                  <p>Process images in seconds, not minutes. Our optimized algorithms deliver results faster than ever before.</p>
                </div>
              </div>
              
              <!-- CTA Section -->
              <div class="cta-section">
                <h3 style="font-size: 24px; margin-bottom: 15px; color: #1e293b;">Ready to Transform Your Images?</h3>
                <p style="color: #64748b; margin-bottom: 25px;">Upload your first image and experience the magic of AI-powered background removal.</p>
                <a href="${process.env.NEXTAUTH_URL || 'https://your-app.com'}" class="cta-button">
                  Start Creating Now 🚀
                </a>
              </div>
              
              <!-- Support Section -->
              <div class="support-section">
                <div class="support-icon">💫</div>
                <h4 style="color: #7c3aed; margin-bottom: 10px;">Need Help? We're Here!</h4>
                <p style="color: #64748b; margin-bottom: 15px;">Check out our tutorials, FAQs, or contact our support team for assistance.</p>
                <a href="${process.env.NEXTAUTH_URL || 'https://your-app.com'}/help" style="color: #7c3aed; text-decoration: none; font-weight: 600;">Visit Help Center →</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="social-links">
                <a href="#" class="social-link">📘</a>
                <a href="#" class="social-link">🐦</a>
                <a href="#" class="social-link">📷</a>
                <a href="#" class="social-link">💼</a>
              </div>
              <p><strong>Quizontal - AI Image Background Removal</strong></p>
              <p>Transform your images in seconds with cutting-edge AI technology</p>
              <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                © 2024 Quizontal. All rights reserved.<br>
                If you have any questions, simply reply to this email.<br>
                <a href="${process.env.NEXTAUTH_URL || 'https://your-app.com'}/unsubscribe" style="color: #94a3b8;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Quizontal - Transform Your Images Instantly!

Hello ${displayName || username || 'there'}!

🎉 Welcome to Quizontal! We're thrilled to have you join our community of creators transforming their visuals with AI-powered magic.

WHAT YOU GET:
🎨 AI Background Removal - Remove backgrounds instantly with advanced AI technology
✨ Smart Enhancements - Automatically enhance image quality and colors
🚀 Lightning Fast - Process images in seconds, not minutes

QUICK STATS:
✓ 10,000+ Images Processed
✓ 99.9% Accuracy Rate
✓ Instant Results

READY TO GET STARTED?
Upload your first image and experience the magic: ${process.env.NEXTAUTH_URL || 'https://your-app.com'}

NEED HELP?
Check out our tutorials and FAQs: ${process.env.NEXTAUTH_URL || 'https://your-app.com'}/help
Or simply reply to this email - we're here to help!

Best regards,
The Quizontal Team

---
Quizontal - AI Image Background Removal
Transform your images in seconds with cutting-edge AI technology
© 2024 Quizontal. All rights reserved.`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log('Enhanced welcome email sent successfully to:', email);
    res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Failed to send welcome email: ' + error.message });
  }
}
