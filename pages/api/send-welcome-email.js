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

    // Formal Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Successfully Signed Up to Quizontal !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Quizontal</title>
          <style>
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e0e0e0;
            }
            
            .header {
              background: #2c3e50;
              padding: 30px 40px;
              color: #ffffff;
            }
            
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #ffffff;
              margin-bottom: 10px;
            }
            
            .company-name {
              font-size: 20px;
              font-weight: 600;
              color: #ffffff;
            }
            
            .content {
              padding: 40px;
            }
            
            .greeting {
              font-size: 18px;
              color: #2c3e50;
              margin-bottom: 25px;
              font-weight: 600;
            }
            
            .message {
              font-size: 15px;
              color: #555555;
              line-height: 1.7;
              margin-bottom: 20px;
            }
            
            .features {
              background: #f8f9fa;
              border-left: 4px solid #2c3e50;
              padding: 20px;
              margin: 25px 0;
            }
            
            .feature-item {
              margin-bottom: 12px;
              font-size: 14px;
              color: #555555;
            }
            
            .feature-item strong {
              color: #2c3e50;
            }
            
            .cta-section {
              text-align: center;
              margin: 30px 0;
              padding: 25px;
              background: #f8f9fa;
              border: 1px solid #e9ecef;
            }
            
            .cta-button {
              display: inline-block;
              background: #2c3e50;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 600;
              font-size: 15px;
            }
            
            .divider {
              height: 1px;
              background: #e0e0e0;
              margin: 30px 0;
            }
            
            .support {
              background: #e8f4fd;
              border: 1px solid #b6d7e8;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            
            .support-title {
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            
            .footer {
              background: #f8f9fa;
              padding: 25px 40px;
              border-top: 1px solid #e0e0e0;
              font-size: 13px;
              color: #666666;
            }
            
            .contact-info {
              margin-top: 15px;
            }
            
            .contact-item {
              margin-bottom: 5px;
            }
            
            @media (max-width: 600px) {
              .header {
                padding: 25px 20px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .footer {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">Quizontal</div>
              <div class="company-name">Image Background Removal Platform</div>
            </div>
            
            <!-- Content -->
            <div class="content">
              <div class="greeting">
                Dear ${displayName || username || 'Valued Customer'},
              </div>
              
              <div class="message">
                Thank you for registering with Quizontal. Your account has been successfully created and is ready for use.
              </div>
              
              <div class="message">
                We are pleased to welcome you to our professional image processing platform. Your account provides access to our suite of AI-powered tools designed to meet your image editing needs.
              </div>
              
              <!-- Features Section -->
              <div class="features">
                <div class="feature-item">
                  <strong>AI-Powered Background Removal:</strong> Automatically remove backgrounds from images with precision and accuracy.
                </div>
                <div class="feature-item">
                  <strong>Professional Image Editing:</strong> Access advanced editing tools to enhance your images.
                </div>
                <div class="feature-item">
                  <strong>Secure Cloud Storage:</strong> Your processed images are stored securely and accessible from any device.
                </div>
                <div class="feature-item">
                  <strong>Batch Processing:</strong> Process multiple images simultaneously for improved efficiency.
                </div>
              </div>
              
              <div class="message">
                To begin using our services, please access your account dashboard using the button below:
              </div>
              
              <!-- CTA Section -->
              <div class="cta-section">
                <a href="${process.env.NEXTAUTH_URL || 'https://your-app.com'}" class="cta-button">
                  Access Your Account
                </a>
                <div style="margin-top: 15px; font-size: 14px; color: #666;">
                  Or visit: ${process.env.NEXTAUTH_URL || 'https://your-app.com'}
                </div>
              </div>
              
              <div class="divider"></div>
              
              <!-- Account Information -->
              <div class="message">
                <strong>Account Information:</strong><br>
                • Email Address: ${email}<br>
                • Username: ${username || 'Not specified'}<br>
                • Registration Date: ${new Date().toLocaleDateString()}
              </div>
              
              <!-- Support Section -->
              <div class="support">
                <div class="support-title">Technical Support & Assistance</div>
                <div class="message" style="margin-bottom: 0; font-size: 14px;">
                  Should you require any assistance or have questions regarding our platform, please don't hesitate to contact our support team. We're committed to ensuring you have the best possible experience with our services.
                </div>
              </div>
              
              <div class="message">
                We recommend reviewing our terms of service and privacy policy to understand how we protect and manage your data.
              </div>
              
              <div class="message">
                Thank you for choosing Quizontal. We look forward to serving your image processing needs.
              </div>
              
              <div class="message">
                Sincerely,<br>
                <strong>The Quizontal Team</strong>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div style="margin-bottom: 15px;">
                <strong>Quizontal - Professional Image Processing</strong>
              </div>
              
              <div class="contact-info">
                <div class="contact-item">Email: support@quizontal.com</div>
                <div class="contact-item">Website: www.quizontal.com</div>
                <div class="contact-item">Business Hours: Mon-Fri, 9:00 AM - 6:00 PM EST</div>
              </div>
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <div style="margin-bottom: 5px;">
                  This email was sent to ${email} as part of your account registration.
                </div>
                <div>
                  <a href="${process.env.NEXTAUTH_URL || 'https://your-app.com'}/unsubscribe" style="color: #666; text-decoration: none;">
                    Unsubscribe from marketing emails
                  </a> | 
                  <a href="${process.env.NEXTAUTH_URL || 'https://your-app.com'}/privacy" style="color: #666; text-decoration: none;">
                    Privacy Policy
                  </a>
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #999;">
                  © ${new Date().getFullYear()} Quizontal. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Successfully Signed Up to Quizontal !

Dear ${displayName || username || 'Valued Customer'},

Thank you for registering with Quizontal. Your account has been successfully created and is ready for use.

We are pleased to welcome you to our professional image processing platform. Your account provides access to our suite of AI-powered tools designed to meet your image editing needs.

ACCOUNT FEATURES:
• AI-Powered Background Removal: Automatically remove backgrounds from images with precision and accuracy.
• Professional Image Editing: Access advanced editing tools to enhance your images.
• Secure Cloud Storage: Your processed images are stored securely and accessible from any device.
• Batch Processing: Process multiple images simultaneously for improved efficiency.

To begin using our services, please access your account dashboard:
${process.env.NEXTAUTH_URL || 'https://your-app.com'}

ACCOUNT INFORMATION:
• Email Address: ${email}
• Username: ${username || 'Not specified'}
• Registration Date: ${new Date().toLocaleDateString()}

TECHNICAL SUPPORT & ASSISTANCE:
Should you require any assistance or have questions regarding our platform, please don't hesitate to contact our support team. We're committed to ensuring you have the best possible experience with our services.

We recommend reviewing our terms of service and privacy policy to understand how we protect and manage your data.

Thank you for choosing Quizontal. We look forward to serving your image processing needs.

Sincerely,
The Quizontal Team

---
Quizontal - Professional Image Processing
Email: quizontal.business@gmail.com
Website: rbg.quizontal.com
Business Hours: Mon-Fri, 9:00 AM - 6:00 PM EST

This email was sent to ${email} as part of your account registration.
Unsubscribe from marketing emails: ${process.env.NEXTAUTH_URL || 'https://your-app.com'}/unsubscribe
Privacy Policy: ${process.env.NEXTAUTH_URL || 'https://your-app.com'}/privacy

© ${new Date().getFullYear()} Quizontal. All rights reserved.`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log('Formal welcome email sent successfully to:', email);
    res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Failed to send welcome email: ' + error.message });
  }
}
