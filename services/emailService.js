const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const sendPasswordResetEmail = async (email, token, req) => {
    const protocol = req.protocol === 'https' ? 'https' : 'http';
    const host = req.get('host');
    const resetLink = `${protocol}://${host}/api/auth/password-reset/${token}`;

    const mailOptions = {
        from: 'admin@sms.com',
        to: email,
        subject: 'Reset Your Password',
        html: `
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #333333;">Hello!</h2>
                        <p style="color: #555555; font-size: 16px;">We received a request to reset your password. Please click the link below to reset your password:</p>
                        <a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 4px;">Reset Your Password</a>
                        <p style="color: #777777; font-size: 14px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
                    </div>
                </body>
            </html>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendPasswordResetEmail;
