import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import Assignment from "./routes/assignmentRoutes.js";
import Announcement from "./routes/announcementRoutes.js";
import jobRoute from "./routes/jobRoute.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server to use with Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Match the CORS origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

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
import questionRoutes from "./routes/questionRoutes.js";
app.use("/api/v1/courses", authMiddleware, courseRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/auth", authRoute); // Mount the auth routes
app.use("/api/v1/lectures", lectureRoutes);
app.use("/api/v1/assignment", Assignment);
app.use("/api/v1/announcements", Announcement);
app.use("/api/v1/jobs", jobRoute);

let questions = []; // Store questions in-memory (use DB in production)
let nextQuestionId = 1; // Simple ID counter for in-memory storage

io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit all existing questions to the new user
  socket.emit("all-questions", questions);

  // Handle new question
  socket.on("new-question", (data) => {
    // Add question ID and initialize answers array
    const newQuestion = {
      ...data,
      _id: nextQuestionId++,
      answers: [],
      questionDate: new Date(),
    };

    questions.push(newQuestion); // Save to memory (use DB in production)
    io.emit("new-question", newQuestion); // Broadcast to all clients
  });

  // Handle new answer
  // Handle new answer
  socket.on("new-answer", (data) => {
    // Find the question and add the answer
    const question = questions.find((q) => q._id === parseInt(data.questionId));
    if (question) {
      const answer = {
        teacherName: data.teacherName,
        teacherAnswer: data.teacherAnswer,
        answerDate: new Date(),
      };

      question.answers.push(answer);

      // Broadcast to all clients with the full answer object
      io.emit("new-answer", {
        questionId: question._id,
        teacherName: data.teacherName,
        teacherAnswer: data.teacherAnswer,
        answerDate: answer.answerDate,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 5000;
// Use server.listen instead of app.listen to enable Socket.io
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
