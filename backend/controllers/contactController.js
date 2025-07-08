const Contact = require("../models/Contact");
const sendEmail = require("../utils/email");

exports.submitContactForm = async (req, res, next) => {
  try {
    const { fullName, email, phone, service, message } = req.body;

    if (!fullName || !email || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Name, email, and message are required." });
    }

    const contact = await Contact.create({ fullName, email, phone, service, message });

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: "Thank you for contacting us",
      html: `<p>Hi ${fullName},</p><p>We've received your message and will get back to you shortly.</p>`,
    });

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${fullName}`,
      html: `
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    next(error);
  }
};
