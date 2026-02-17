import crypto from "crypto";
import EmailVerificationToken from "../models/verificationEmailTokenSchema.js";

/**
 * Generates a token using the crypto package and saves it in the database
 * A cron job removes these tokens if they are old
 */
export default async function generateVerificationLink(userID) {
  try {
    let token = await new EmailVerificationToken({
      userId: userID,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const message = `${process.env.BASE_URL}/auth/verify/${token.token}`;
    return message;
  } catch (err) {
    return 0;
  }
}
