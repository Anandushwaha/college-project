import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createAssignment,
  getAssignments,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  deleteAssignment,
} from "../controller/assigmentController.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "assignments", // Store uploaded assignments in this folder
    resource_type: "auto",
  },
});
const upload = multer({ storage });
const router = express.Router();

// ✅ Create an assignment (Only Teachers)
router.post("/create", authMiddleware, upload.single("file"), createAssignment);

// ✅ Get assignments for a specific course (Students & Teachers)
router.get("/course/:courseId", authMiddleware, getAssignments);

// ✅ Submit an assignment (Only Students)
router.post(
  "/submit/:assignmentId",
  authMiddleware,
  upload.single("file"),
  submitAssignment
);

// ✅ Get all submissions for an assignment (Only Teachers)
router.get("/submissions/:assignmentId", authMiddleware, getSubmissions);

// ✅ Grade a submission (Only Teachers)
router.post("/grade/:submissionId", authMiddleware, gradeSubmission);
router.delete("/:assignmentId", authMiddleware, deleteAssignment);

export default router;
