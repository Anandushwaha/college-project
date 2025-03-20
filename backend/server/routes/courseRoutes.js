import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Course from "../models/Course.js";

const router = express.Router();

// ✅ Create Course (Only teachers can create courses)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, className, division } = req.body;
    const teacherId = req.user.id; // Extracted from the token
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can create courses" });
    }

    const course = new Course({
      title,
      className,
      division,
      teacherId: teacherId,
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Get All Courses Created by a Teacher
router.get("/teacher", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const courses = await Course.find({ teacherId: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Update Course (Only Teacher can update)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, className, division } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.teacherId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this course" });
    }

    course.title = title || course.title;
    course.className = className || course.className;
    course.division = division || course.division;

    await course.save();
    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Delete Course (Only Teacher can delete)
// DELETE Course (Only Teacher can delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    console.log("teacher id before stringify" + teacherId);
    console.log("reqest paramid" + req.params.id);
    //  CORRECT COMPARISON
    if (course.teacherId.toString() !== req.user.id.toString()) {
      console.log("teacher id after stringify" + teacherId);
      console.log("reqest paramid" + req.params.id);
      return res.status(403).json({
        message: "Unauthorized: You can only delete courses that you created.",
      });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Get All Available Courses (Students can view)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find().populate("teacherId", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
