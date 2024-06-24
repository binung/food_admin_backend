const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

async function payoutRequestEmail(userEmail, name, payoutAmount){

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Your Payout Request from Foodly",
        html: ` <h2>Foodly Payout Request Initiated</h2>

        <p>Dear ${name},</p>
    
        <p>We are pleased to inform you that your payout request of <strong>${payoutAmount}</strong> has been received and is currently being processed. Our team works diligently to ensure that payouts are completed promptly, and we will notify you once your payout has been sent.</p>
    
        <p>If you have any questions or need further assistance, please do not hesitate to contact our support team at [Your Support Email] or [Your Support Phone Number]. We are here to help.</p>
    
        <p>Thank you for being a valued member of the Foodly community.</p>
    
        <p>Best regards,</p>
    
        <p>Foodly Finance Team</p>`

    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Payout request email sent successfully.");
    } catch (error) {
        console.log("Failed to send payout request email: ", error);
    }
}

module.exports = payoutRequestEmail;
