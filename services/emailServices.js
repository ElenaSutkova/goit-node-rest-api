import "dotenv/config";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async (userEmail, verificationToken) => {
    const message = {
        to: "os@itbiz.com.ua",
        from: "os@itbiz.com.ua",
        subject: "Test SendGrid",
        html: "<h1>Message delivered</h1>",
        text: "Message delivered"
    };

    try {
        await sgMail.send(message);
        console.log('Email sent');
    } catch (error) {
        console.error("Error sending email for email verification:", error);
        throw new Error("Error sending email for email verification")
    }
}