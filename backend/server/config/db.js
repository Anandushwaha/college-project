import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("MongoDB URI:", process.env.MONGO_URI); // Debugging

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB URI is missing in .env file");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed", error);
    process.exit(1);
  }
};

export default connectDB;
