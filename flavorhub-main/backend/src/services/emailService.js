const nodemailer = require('nodemailer');

// Create transporter based on environment configuration
const createTransporter = () => {
    // For production, use real SMTP settings
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // For Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }

    // Fallback: Log emails to console in development
    console.log('⚠️  Email service: No SMTP configuration found. Emails will be logged to console.');
    return null;
};

const transporter = createTransporter();

/**
 * Send welcome email to newly registered user
 * @param {Object} user - User object with email and fullName
 */
const sendWelcomeEmail = async (user) => {
    const { email, fullName } = user;
    const displayName = fullName || 'Food Lover';

    const mailOptions = {
        from: `"FlavorHub" <${process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@flavorhub.com'}>`,
        to: email,
        subject: '🍽️ Welcome to FlavorHub - Your Culinary Journey Begins!',
        html: getWelcomeEmailTemplate(displayName),
        text: getWelcomeEmailText(displayName)
    };

    try {
        if (transporter) {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent to ${email}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } else {
            // Log to console if no transporter configured
            console.log('\n📧 ================================');
            console.log('📧 WELCOME EMAIL (Development Mode)');
            console.log('📧 ================================');
            console.log(`📧 To: ${email}`);
            console.log(`📧 Subject: ${mailOptions.subject}`);
            console.log(`📧 Name: ${displayName}`);
            console.log('📧 ================================\n');
            return { success: true, mode: 'development' };
        }
    } catch (error) {
        console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * HTML template for welcome email
 */
const getWelcomeEmailTemplate = (displayName) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FlavorHub</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 48px 48px 32px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">🍽️ FlavorHub</h1>
                            <p style="margin: 12px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Where Every Bite Tells a Story</p>
                        </td>
                    </tr>
                    
                    <!-- Welcome Message -->
                    <tr>
                        <td style="padding: 48px 48px 24px;">
                            <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 600; color: #1a1a2e;">Welcome, ${displayName}! 🎉</h2>
                            <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #4a4a68;">
                                Thank you for joining the FlavorHub family! We're thrilled to have you on board and can't wait to take you on a delicious culinary journey.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Features -->
                    <tr>
                        <td style="padding: 0 48px 32px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 20px; background-color: #fef7f0; border-radius: 12px; margin-bottom: 16px;">
                                        <table role="presentation" style="border-collapse: collapse;">
                                            <tr>
                                                <td style="width: 48px; vertical-align: top;">
                                                    <span style="font-size: 28px;">🍕</span>
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a2e;">Explore Our Menu</h3>
                                                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Discover authentic flavors from around the world</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr><td style="height: 12px;"></td></tr>
                                <tr>
                                    <td style="padding: 20px; background-color: #f0fdf4; border-radius: 12px;">
                                        <table role="presentation" style="border-collapse: collapse;">
                                            <tr>
                                                <td style="width: 48px; vertical-align: top;">
                                                    <span style="font-size: 28px;">🚚</span>
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a2e;">Fast Delivery</h3>
                                                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Hot and fresh food delivered right to your door</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr><td style="height: 12px;"></td></tr>
                                <tr>
                                    <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px;">
                                        <table role="presentation" style="border-collapse: collapse;">
                                            <tr>
                                                <td style="width: 48px; vertical-align: top;">
                                                    <span style="font-size: 28px;">⭐</span>
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a2e;">Track Orders</h3>
                                                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Real-time updates on your delicious order</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 48px 48px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/menu" 
                               style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                                Start Ordering Now 🍴
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 48px; background-color: #f8f9fa; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                                Need help? Contact us at <a href="mailto:support@flavorhub.com" style="color: #f97316; text-decoration: none;">support@flavorhub.com</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                © ${new Date().getFullYear()} FlavorHub. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

/**
 * Plain text version of welcome email
 */
const getWelcomeEmailText = (displayName) => {
    return `
Welcome to FlavorHub, ${displayName}! 🎉

Thank you for joining the FlavorHub family! We're thrilled to have you on board and can't wait to take you on a delicious culinary journey.

What you can do with FlavorHub:
🍕 Explore Our Menu - Discover authentic flavors from around the world
🚚 Fast Delivery - Hot and fresh food delivered right to your door
⭐ Track Orders - Real-time updates on your delicious order

Start ordering now: ${process.env.FRONTEND_URL || 'http://localhost:8080'}/menu

Need help? Contact us at support@flavorhub.com

© ${new Date().getFullYear()} FlavorHub. All rights reserved.
    `.trim();
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
    if (!transporter) {
        console.log('📧 Email service running in development mode (console logging)');
        return true;
    }

    try {
        await transporter.verify();
        console.log('✅ Email service is ready');
        return true;
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    verifyEmailConfig
};
