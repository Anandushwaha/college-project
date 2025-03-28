import express from "express";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Ensure authentication
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "announcements", // Corrected folder name
    resource_type: "auto",
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});
const router = express.Router();

/**
 * @route GET /api/v1/announcements/:courseId
 * @desc Get all announcements for a course
 */
router.get("/:courseId", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const announcements = await Announcement.find({ courseId }).populate(
      "createdBy",
      "name"
    );
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route POST /api/v1/announcements
 * @desc Create a new announcement
 */
router.post(
  "/create",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      // Comprehensive logging
      console.log("Full Request Details:", {
        user: req.user,
        body: req.body,
        file: req.file,
        headers: req.headers,
      });

      // Robust validation
      const { courseId, title, content, type } = req.body;

      // Validate required fields
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please log in.",
        });
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
      }

      if (!title || title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Announcement title is required",
        });
      }

      if (!content || content.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Announcement content is required",
        });
      }

      if (!type || !["general", "assignment", "urgent"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement type",
        });
      }

      // Prepare announcement data
      const announcementData = {
        courseId,
        title,
        content,
        type,
        createdBy: req.user.id,
        attachments: req.file ? [req.file.path] : [],
      };

      // Create and save announcement
      const announcement = new Announcement(announcementData);

      try {
        const savedAnnouncement = await announcement.save();

        res.status(201).json({
          success: true,
          message: "Announcement created successfully",
          data: savedAnnouncement,
        });
      } catch (saveError) {
        console.error("Announcement Save Error:", saveError);

        res.status(500).json({
          success: false,
          message: "Failed to save announcement",
          error: saveError.message,
        });
      }
    } catch (error) {
      console.error("Announcement Creation Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error while creating announcement",
        error: error.message,
      });
    }
  }
);
export default router;
