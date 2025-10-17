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
        pass: process.env.EMAIL_PASS, // Use app password for Gmail
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Quizontal Image Background Removal ! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .features { margin: 20px 0; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #3b82f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Quizontal Image Background Removal ! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${displayName || username || 'there'},</h2>
              <p>Thank you for signing up! We're excited to have you on board.</p>
              
              <div class="features">
                <h3>Get started with these features:</h3>
                <div class="feature">
                  <strong>🎨 Background Removal</strong>
                  <p>Remove backgrounds from your images with AI-powered technology</p>
                </div>
                <div class="feature">
                  <strong>✏️ Image Editing</strong>
                  <p>Edit and enhance your photos with our powerful tools</p>
                </div>
                <div class="feature">
                  <strong>☁️ Cloud Storage</strong>
                  <p>Securely store and access your images from anywhere</p>
                </div>
              </div>

              <p>Ready to get started?</p>
              <a href="${process.env.NEXTAUTH_URL || 'https://your-app.com'}" class="button">
                Start Creating Now
              </a>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                If you have any questions or need help, feel free to reply to this email.<br>
                We're here to help you succeed!
              </p>

              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                Best regards,<br>
                <strong>Quizontal</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Quizontal Image Background Removal !

Hello ${displayName || username || 'there'},

Thank you for signing up! We're excited to have you on board.

Get started with these features:
🎨 Background Removal - Remove backgrounds from your images with AI-powered technology
✏️ Image Editing - Edit and enhance your photos with our powerful tools
☁️ Cloud Storage - Securely store and access your images from anywhere

Ready to get started? Visit: ${process.env.NEXTAUTH_URL || 'https://your-app.com'}

If you have any questions or need help, feel free to reply to this email.

Best regards,
Quizontal`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log('Welcome email sent successfully to:', email);
    res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Failed to send welcome email: ' + error.message });
  }
}
