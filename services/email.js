const nodemailer = require('nodemailer');

// ── Secure transporter (port 465, SSL) ──
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: true,   // SSL (use true for port 465)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ── Send verification email ──
async function sendVerificationEmail(email, username, token) {
    const verifyLink = `${process.env.CLIENT_URL}/verify-email.html?token=${token}`;
    const mailOptions = {
        from: `"Battle Nexus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your Battle Nexus account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e11; color: #fff; padding: 30px; border-radius: 10px; border: 1px solid #ff7b00;">
                <h1 style="color: #ff7b00; text-align: center;">Welcome, ${username}!</h1>
                <p style="color: #b0b4c0; text-align: center;">Please verify your email address to start using Battle Nexus.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyLink}" style="background: #ff7b00; color: #000; padding: 14px 30px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Verify Email</a>
                </div>
                <p style="color: #6c6e75; font-size: 12px; text-align: center;">If you didn't create an account, ignore this email.</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
}

// ── Send password reset email ──
async function sendPasswordResetEmail(email, token) {
    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;
    const mailOptions = {
        from: `"Battle Nexus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset your Battle Nexus password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e11; color: #fff; padding: 30px; border-radius: 10px; border: 1px solid #ff7b00;">
                <h1 style="color: #ff7b00; text-align: center;">Reset Password</h1>
                <p style="color: #b0b4c0; text-align: center;">Click the link below to reset your password.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background: #ff7b00; color: #000; padding: 14px 30px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #6c6e75; font-size: 12px; text-align: center;">If you didn't request this, ignore this email.</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };