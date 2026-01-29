// db.js
import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // Load .env variables

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI, {});
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;
