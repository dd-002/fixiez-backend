//a model for all the users
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { type } from "node:os";


/**
 * Cron Jobs: may set disabled true if:
 * 1. Commitment not maintained
 */

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: false, unique: false, default: "" }, //TODO:as during registration
    role: { type: Number, required: true, default: 100 }, //100 -normal, 659 -admin, 111 -vendor
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    canOrder: { type: Boolean, default: false, required: true },
    disabled: { type: Boolean, required: true, default: false }, //disabled by cronjob
    isSuspended: { type: Boolean, required: true, default: false }, //manually disabled by admin
    balance: { type: Number, required: true, default: 0 },
    wallet: { type: mongoose.Schema.ObjectId, ref: "Wallet" },
    passwordVersion : { type: mongoose.Schema.ObjectId, ref: "Wallet" },
    signUp : {type:String, default:"normal", required:true}  //normal gmail
  },
  { timestamps: true },
);


// Hash the password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema, "usersCollection"); //creates a custom collection name as well
export default User;
