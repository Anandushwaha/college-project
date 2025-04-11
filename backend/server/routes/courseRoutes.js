import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
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
  console.log("update controller hit ");
  try {
    const { title, className, division } = req.body;

    const course = await Course.findById(req.params.id);
    console.log(course);
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
    console.log("updated successfully");
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
    // Corrected logs
    console.log("Teacher ID:", req.user.id.toString());
    console.log("Course ID:", req.params.id);

    if (course.teacherId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You can only delete courses you created.",
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
    const courses = await Course.find().populate("teacherId", "name email"); // ✅ Populate teacher details
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/enroll/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const course = await Course.findById(id).populate("teacherId");
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already in pending or enrolled
    if (
      course.pendingEnrollments.includes(studentId) ||
      course.studentsEnrolled.includes(studentId)
    ) {
      return res
        .status(400)
        .json({ message: "Request already sent or enrolled" });
    }

    course.pendingEnrollments.push(studentId);
    await course.save();

    // Create notification for teacher
    const student = await User.findById(studentId).select("name");
    await Notification.create({
      userId: course.teacherId,
      message: `${student.name} has requested to enroll in your course "${course.title}"`,
      type: "enrollment_request",
      courseId: course._id,
      actionRequired: true,
      data: {
        studentId: studentId,
        teacherId: course.teacherId,
        courseName: course.title,
      },
    });

    res.json({ message: "Enrollment request sent!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Approve Enrollment
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

      // Remove from pending and add to enrolled
      const pendingIndex = course.pendingEnrollments.indexOf(studentId);
      if (pendingIndex > -1) {
        course.pendingEnrollments.splice(pendingIndex, 1);
      }

      if (!course.studentsEnrolled.includes(studentId)) {
        course.studentsEnrolled.push(studentId);
      }

      await course.save();

      // Create notification for student
      const teacher = await User.findById(req.user.id).select("name");
      await Notification.create({
        userId: studentId,
        message: `Your enrollment request for "${course.title}" has been approved!`,
        type: "enrollment_approved",
        courseId: course._id,
        data: {
          studentId: studentId,
          teacherId: course.teacherId,
          courseName: course.title,
        },
      });

      // Mark teacher's notification as read
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });

      res.json({
        message: "Enrollment approved",
        enrollmentCount: course.studentsEnrolled.length,
      });
    } catch (error) {
      console.error("Approval Error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Reject Enrollment
router.put(
  "/enroll/reject/:notificationId",
  authMiddleware,
  async (req, res) => {
    try {
      const { notificationId } = req.params;
      const { studentId, courseId } = req.body;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      // Verify teacher ownership
      if (course.teacherId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Remove from pending
      const pendingIndex = course.pendingEnrollments.indexOf(studentId);
      if (pendingIndex > -1) {
        course.pendingEnrollments.splice(pendingIndex, 1);
        await course.save();
      }

      // Notify student
      const teacher = await User.findById(req.user.id).select("name");
      await Notification.create({
        userId: studentId,
        message: `Your enrollment request for "${course.title}" was rejected.`,
        type: "enrollment_rejected",
        courseId: course._id,
        data: {
          studentId: studentId,
          teacherId: course.teacherId,
          courseName: course.title,
        },
      });

      // Mark teacher's notification as read
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });

      res.json({ message: "Enrollment rejected!" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  }
);

router.post("/create-room", async (req, res) => {
  try {
    const { courseId } = req.body; // Get course ID from request
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      { name: `room-${Date.now()}`, privacy: "public" },
      { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } }
    );

    if (!response.data.url) {
      throw new Error("Daily.co API did not return a URL");
    }

    // Store meeting URL in the course document
    await Course.findByIdAndUpdate(courseId, { meetingUrl: response.data.url });

    res.json({ roomUrl: response.data.url });
  } catch (error) {
    console.error("Error creating room:", error.message);
    res.status(500).json({ error: "Failed to create room" });
  }
});

export default router;
