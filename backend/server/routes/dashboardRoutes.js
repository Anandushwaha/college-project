import express from "express";
import {
  authenticateUser,
  authorizeRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/students/dashboard",
  authenticateUser,
  authorizeRole(["student"]),
  (req, res) => {
    res.json({ message: "Welcome to Student Dashboard", user: req.user });
  }
);

router.get(
  "/teachers/dashboard",
  authenticateUser,
  authorizeRole(["teacher"]),
  (req, res) => {
    res.json({ message: "Welcome to Teacher Dashboard", user: req.user });
  }
);

export default router;
