import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
})


export default async function sendVerificationLink(verificationUrl, email, name) {
  try {
    console.log("Dipayan Das")
    const info = await transporter.sendMail({
      from: '"Fixiez Verification" <noreply@fixiez.com>', // sender address
      to: email, // list of receivers
      subject: "Welcome to Fixiez", // Subject line
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        padding: 32px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 24px;
      }
      .footer {
        margin-top: 32px;
        font-size: 12px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Hi ${name || "there"},</h2>
      <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl || "hehe"}" class="button">Verify Email</a>
      <p>If you didn't create this account, you can safely ignore this message.</p>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Fixiez. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `
    });
  }
  catch (err) {
    return 0;
  }
}

