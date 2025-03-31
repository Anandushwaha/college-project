import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import Lecture from "../models/lecture.js";
import Course from "../models/Course.js";

const router = express.Router();

// Multer storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "lectures",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

// ✅ Upload a lecture
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, courseId } = req.body;
    const fileUrl = req.file.path;

    const newLecture = new Lecture({ title, courseId, fileUrl });
    await newLecture.save();

    res.status(201).json({
      success: true,
      message: "Lecture uploaded!",
      lecture: newLecture,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Upload failed", error: error.message });
  }
});

// ✅ Get lectures for a specific course
router.get("/:courseId", async (req, res) => {
  try {
    const lectures = await Lecture.find({ courseId: req.params.courseId });
    res.status(200).json(lectures);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch lectures", error: error.message });
  }
});

// ✅ Delete a lecture
router.delete("/:id", async (req, res) => {
  try {
    const deletedLecture = await Lecture.findByIdAndDelete(req.params.id);
    if (!deletedLecture)
      return res.status(404).json({ message: "Lecture not found" });

    res.status(200).json({ message: "Lecture deleted", deletedLecture });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting lecture", error: error.message });
  }
});

export default router;
