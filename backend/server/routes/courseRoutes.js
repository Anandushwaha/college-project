import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Course from "../models/Course.js";
import { sendNotification } from "../utils/notificationHelper.js";

const courseRoutes = express.Router();

// ✅ Create Course (Only Teachers)
courseRoutes.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, className, division } = req.body;

    // Check if the user is a teacher
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied. Teachers only." });
    }

    const newCourse = new Course({
      title,
      className,
      division,
      teacherId: req.user.id,
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course created successfully!", course: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get Courses by Teacher
courseRoutes.get("/teacher", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id; // Get teacher's ID from token
    const courses = await Course.find({ teacherId });

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update Course
courseRoutes.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, className, division } = req.body;
    const teacherId = req.user.id; // Get teacher ID from token

    const course = await Course.findOne({ _id: id, teacherId });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    course.title = title || course.title;
    course.className = className || course.className;
    course.division = division || course.division;
    await course.save();

    res.status(200).json({ message: "Course updated successfully!", course });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete Course
courseRoutes.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id; // Get teacher ID from token

    const course = await Course.findOneAndDelete({ _id: id, teacherId });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    res.status(200).json({ message: "Course deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get All Courses
courseRoutes.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find(); // Fetch all courses
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Enroll in Course (Student requests enrollment)
courseRoutes.post("/enroll/:id", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id; // Student's ID from token
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is already enrolled or has requested
    if (
      course.studentsEnrolled.some((s) => s.studentId.toString() === studentId)
    ) {
      return res.status(400).json({ message: "Already enrolled/requested" });
    }

    // Add student to pending enrollment list
    course.studentsEnrolled.push({ studentId, status: "pending" });
    await course.save();

    // ✅ Notify the teacher
    await sendNotification(
      course.teacherId,
      `A student has requested to enroll in your course: ${course.title}.`
    );

    res.json({ message: "Enrollment request sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Approve Enrollment (Teacher approves student's request)
courseRoutes.put("/enroll/approve/:id", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const courseId = req.params.id;
    const { studentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find student in pending requests and approve
    const studentIndex = course.studentsEnrolled.findIndex(
      (s) => s.studentId.toString() === studentId && s.status === "pending"
    );

    if (studentIndex === -1) {
      return res
        .status(400)
        .json({ message: "Student not found in pending list" });
    }

    course.studentsEnrolled[studentIndex].status = "approved";
    await course.save();

    // ✅ Notify the student
    await sendNotification(
      studentId,
      `Your enrollment request for ${course.title} has been approved!`
    );

    res.json({ message: "Enrollment approved!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Reject Enrollment (Teacher rejects student's request)
courseRoutes.delete("/enroll/reject/:id", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const courseId = req.params.id;
    const { studentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove student from pending requests
    course.studentsEnrolled = course.studentsEnrolled.filter(
      (s) => s.studentId.toString() !== studentId
    );
    await course.save();

    // ✅ Notify the student
    await sendNotification(
      studentId,
      `Your enrollment request for ${course.title} has been rejected.`
    );

    res.json({ message: "Enrollment request rejected!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default courseRoutes;
