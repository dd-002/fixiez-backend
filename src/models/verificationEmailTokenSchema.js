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
  }
},{
  timestamps:true
  });

const Token = model("VerificationTokens", tokenSchema, "verificationTokenCollection");

export default Token;

