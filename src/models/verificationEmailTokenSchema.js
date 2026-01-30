import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Deletes document 1 hour after 'createdAt'
  }
});

const VerifyEmailToken = model("VerificationTokens", tokenSchema, "verificationTokenCollection");

export default VerifyEmailToken;

