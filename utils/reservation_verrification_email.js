


const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

async function sendVerificationReservationEmail(userEmail, name) {
    console.log(`Attempting to send email to ${userEmail} for user ${name}`);
    
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
        subject: "Foodly Reservation Confirmation",
        html: `<h2>Congratulations! Your Reservation Has Been Confirmed</h2>
               <p>Dear ${name},</p>
               <p>We are thrilled to inform you that your reservation on Foodly has been successfully confirmed! Congratulations on completing the reservation process.</p>
               <p>Thank you for choosing Foodly.</p>
               <p>Best regards,</p>
               <p>Foodly Support Team</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent");
    } catch (error) {
        console.log("Email sending failed with an error: ", error);
    }
}

module.exports = {
    sendVerificationReservationEmail
};
