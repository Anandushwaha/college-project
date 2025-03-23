import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Course from "../models/Course.js";
import Notification from "../models/Notification.js";
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
router.put(
  "/enroll/approve/:notificationId",
  authMiddleware,
  async (req, res) => {
    try {
      const { notificationId } = req.params;
      const { studentId, courseId } = req.body;

      if (!studentId || !courseId) {
        return res
          .status(400)
          .json({ message: "Missing student or course ID" });
      }

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      if (course.teacherId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (!course.studentsEnrolled.includes(studentId)) {
        course.studentsEnrolled.push(studentId);
        await course.save();
      }

      await Notification.create({
        userId: studentId,
        message: `Your enrollment for ${course.title} is approved!`,
        studentId: req.user.id, // student's ID
        courseId: course._id, // Course ID
      });

      await Notification.findByIdAndDelete(notificationId);

      res.json({ message: "Enrollment approved" });
    } catch (error) {
      console.error("Approval Error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.put("/enroll/approve/:id", authMiddleware, async (req, res) => {
  try {
    const { studentId, courseId } = req.body; // Get student ID & course ID

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if teacher is authorized
    if (course.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add student to course
    if (!course.studentsEnrolled.includes(studentId)) {
      course.studentsEnrolled.push(studentId);
      await course.save();
    }

    // Notify the student about acceptance
    await Notification.create({
      userId: studentId, // Notify student
      message: `Your enrollment request for ${course.title} has been approved.`,
    });

    res.json({ message: "Enrollment request approved" });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
router.put("/enroll/reject/:id", authMiddleware, async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Notify the student about rejection
    await Notification.create({
      userId: studentId,
      message: `Your enrollment request for ${course.title} was rejected.`,
    });

    res.json({ message: "Enrollment request rejected" });
  } catch (error) {
    console.error("Rejection Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
router.post("/enroll/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id; // Get student ID from token

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Prevent duplicate enrollment requests
    if (course.studentsEnrolled.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "Enrollment request already sent" });
    }

    // Store student request (we can add a "pending" state later)
    course.studentsEnrolled.push(studentId);
    await course.save();

    res.status(200).json({ message: "Enrollment request sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
