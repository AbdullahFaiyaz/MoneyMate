const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testWithSettings(name, config) {
    console.log(`\n--- Testing ${name} ---`);
    const transporter = nodemailer.createTransport(config);

    try {
        await transporter.verify();
        console.log(`[${name}] Connection verified!`);

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: `Test ${name}`,
            text: 'Test message'
        });
        console.log(`[${name}] Email SENT successfully!`);
        return true;
    } catch (err) {
        console.error(`[${name}] FAILED:`, err.message);
        if (err.code === 'EAUTH') console.log('   Reason: Authentication failed (Invalid User/Pass or 2FA/App Password issue)');
        if (err.code === 'ESOCKET') console.log('   Reason: Socket error (Firewall/Network blocking port)');
        return false;
    }
}

async function run() {
    console.log('User:', process.env.GMAIL_USER);

    // Test SSL (465)
    await testWithSettings('SSL (465)', {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        }
    });

    // Test STARTTLS (587)
    await testWithSettings('STARTTLS (587)', {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        }
    });
}

run();
