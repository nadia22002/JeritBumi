const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS   
    }
});

async function sendEmail(to, subject, text) {
    console.log(`Mengirim email ke: ${to}`); // Debugging
    
    try {
        let info = await transporter.sendMail({
            from: `"Jerit Bumi Corps" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text
        });

        console.log("Email berhasil dikirim:", info.response);
        return true;
    } catch (error) {
        console.error("Gagal mengirim email:", error);
        return false;
    }
}

module.exports = { sendEmail };
