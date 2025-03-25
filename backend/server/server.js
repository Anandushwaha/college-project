import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoutes.js"; // Import auth routes
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: "http://127.0.0.1:5500", // Adjust for frontend URL
    credentials: true, // Allow sending cookies
  })
);
app.use(express.json());
app.use(cookieParser());
import courseRoutes from "./routes/courseRoutes.js";

app.use("/api/v1/courses", authMiddleware, courseRoutes);

app.use("/api/v1/auth", authRoute); // Mount the auth routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
