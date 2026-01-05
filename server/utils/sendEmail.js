const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if placeholders are still present
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER.includes('your_gmail')) {
        console.error('ERROR: GMAIL_USER is not configured in .env file!');
        throw new Error('Email configuration missing: GMAIL_USER');
    }
    if (!process.env.GMAIL_PASS || process.env.GMAIL_PASS.includes('your_google_app_password')) {
        console.error('ERROR: GMAIL_PASS is not configured in .env file!');
        throw new Error('Email configuration missing: GMAIL_PASS');
    }

    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_PASS?.trim();

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Use 465 for secure, or 587 with secure: false
        secure: true, // Use SSL/TLS
        auth: {
            user: gmailUser,
            pass: gmailPass,
        },
        // Helpful for debugging connection issues
        debug: true,
        logger: true
    });

    const message = {
        from: `"Moneymate Support" <${gmailUser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message || `Your Moneymate code is: ${options.otp}`,
        html: options.html || `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #6366f1; margin: 0; font-size: 28px;">Moneymate</h1>
                </div>
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h2 style="color: #1f2937; margin-top: 0; text-align: center;">${options.subject}</h2>
                    <p style="color: #4b5563; line-height: 1.6;">Hello,</p>
                    ${options.otp ? `
                    <p style="color: #4b5563; line-height: 1.6;">Use the verification code below for your account. This code is valid for <strong>10 minutes</strong>.</p>
                    <div style="background-color: #eef2ff; border: 2px dashed #6366f1; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4338ca;">${options.otp}</span>
                    </div>
                    ` : `<p style="color: #4b5563; line-height: 1.6;">${options.message}</p>`}
                    
                    <p style="color: #9ca3af; font-size: 14px; text-align: center;">If you didn't request this, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Moneymate | Advanced Personal Finance Assistant
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Email successfully sent! Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('CRITICAL: Nodemailer failed to send email.');
        console.error('Technical Error Details:', error); // Log the full error object

        if (error.message && error.message.includes('Invalid login')) {
            console.error('SUGGESTION: Your Gmail App Password or Email address is incorrect.');
        } else if (error.code === 'EAUTH') {
            console.error('SUGGESTION: Authentication failed. Please ensure 2FA is enabled and you are using a fresh "App Password".');
        } else if (error.code === 'ESOCKET') {
            console.error('SUGGESTION: Connection error. Check your firewall or network settings.');
        }

        throw error;
    }
};

module.exports = sendEmail;
