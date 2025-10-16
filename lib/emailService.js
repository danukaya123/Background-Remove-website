import nodemailer from 'nodemailer';

// For production, you'd use a service like SendGrid, Mailgun, etc.
// This is a basic implementation using Gmail

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendWelcomeEmail = async (userEmail, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Welcome to QuizontalRBG! 🎉',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 16px;">
              Q
            </div>
            <span style="font-size: 24px; font-weight: 800; color: #1e293b;">
              Quizontal<span style="color: #3b82f6;">RBG</span>
            </span>
          </div>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h1 style="color: #1e293b; font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 20px;">
            Welcome to QuizontalRBG, ${username}! 🎉
          </h1>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for joining our community! We're excited to have you on board and can't wait to see the amazing images you'll create with our AI-powered background removal tool.
          </p>
          
          <div style="background: linear-gradient(135deg, #3b82f61a, #1d4ed81a); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin-bottom: 10px;">What you can do now:</h3>
            <ul style="color: #64748b; padding-left: 20px;">
              <li>Remove backgrounds from unlimited images</li>
              <li>Edit your images with our advanced tools</li>
              <li>Download high-quality results</li>
              <li>Access your editing history</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.WEBSITE_URL}" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
              Start Editing Now
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} QuizontalRBG. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};
