import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@fixiez.com",
    pass: "1234@Dipayan"
  },
})


export default async function sendPasswordResetLink(resetPasswordLink, email, name) {
  try {
    console.log("Dipayan Das")
    const info = await transporter.sendMail({
      from: '"Fixiez Password Reset" <noreply@fixiez.com>', // sender address
      to: email, // list of receivers
      subject: "Reset Your Password", // Subject line
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
      <p>Thanks for using fixiez! Reset your password by following the link below</p>
      <a href="${resetPasswordLink || "Reset Password"}" class="button">Verify Email</a>
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
    console.log(err)
  }
}

