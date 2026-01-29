// db.js
import { connect } from "mongoose";

const connectDB = async (connString) => {
  try {
    await connect(connString, {});
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;
