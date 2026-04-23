const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter at startup to surface credential/connection issues
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter verification failed:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

async function sendVerificationEmail({ to, name, token }) {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const verifyUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Verify your AnnaSetu account',
        html: `
      <p>Hi ${name || ''},</p>
      <p>Thanks for registering. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
    `
    };

    console.log(`Sending verification email to ${to}`);
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId || info.response || info);
        return info;
    } catch (err) {
        console.error('Error sending verification email:', err);
        throw err;
    }
}

module.exports = { sendVerificationEmail, transporter };
