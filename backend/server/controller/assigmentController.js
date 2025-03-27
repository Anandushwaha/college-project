import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Course from "../models/Course.js";
import cloudinary from "../config/cloudinary.js";

// ✅ Create an assignment (Only Teachers)
export const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;
    const teacherId = req.user.id;
    const userRole = req.user.role;
    const fileUrl = req.file ? req.file.path : null; // Get file URL if uploaded

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // ✅ Ensure user is a teacher
    if (userRole !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can create assignments" });
    }

    // ✅ Ensure teacher owns the course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    // ✅ Create a new assignment
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      courseId,
      teacherId,
      fileUrl, // Store the uploaded file URL
    });

    await assignment.save();
    res
      .status(201)
      .json({ message: "Assignment created successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get assignments for a specific course (Students & Teachers)
export const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const assignments = await Assignment.find({ courseId });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Submit an assignment (Only Students)
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    const userRole = req.user.role;
    const fileUrl = req.file.path; // Get uploaded file URL from Cloudinary

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    // ✅ Ensure assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    // ✅ Ensure user is a student
    if (userRole !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can submit assignments" });
    }

    // ✅ Ensure student is enrolled in the course
    const course = await Course.findById(assignment.courseId);
    if (!course.studentsEnrolled.includes(studentId)) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    // ✅ Create a new submission
    const submission = new Submission({
      assignmentId,
      studentId,
      fileUrl,
    });

    await submission.save();
    res
      .status(201)
      .json({ message: "Assignment submitted successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get all submissions for an assignment (Only Teachers)
export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    // ✅ Ensure the user is the teacher for the course
    const course = await Course.findById(assignment.courseId);
    if (
      !course ||
      course.teacherId.toString() !== userId ||
      userRole !== "teacher"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const submissions = await Submission.find({ assignmentId }).populate(
      "studentId",
      "name email"
    );

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Grade a submission (Only Teachers)
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    // ✅ Ensure the user is the teacher for the course
    const assignment = await Assignment.findById(submission.assignmentId);
    const course = await Course.findById(assignment.courseId);
    if (
      !course ||
      course.teacherId.toString() !== userId ||
      userRole !== "teacher"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();

    res
      .status(200)
      .json({ message: "Assignment graded successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Delete an assignment and its submissions
// @route   DELETE /api/v1/assignment/:assignmentId
// @access  Teacher Only
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id; // Extracted from JWT token

    // Validate assignment ID
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Ensure only the assignment's creator can delete it
    if (assignment.teacherId.toString() !== teacherId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this assignment" });
    }

    // ✅ Delete assignment file from Cloudinary if it exists
    if (assignment.fileUrl) {
      const publicId = assignment.fileUrl
        .split("/assignments/")[1]
        ?.split(".")[0]; // Extract public ID
      if (publicId)
        await cloudinary.uploader.destroy(`assignments/${publicId}`);
    }

    // ✅ Find and delete all student submissions related to this assignment
    const submissions = await Submission.find({ assignmentId });

    for (let submission of submissions) {
      if (submission.fileUrl) {
        const publicId = submission.fileUrl
          .split("/submissions/")[1]
          ?.split(".")[0];
        if (publicId)
          await cloudinary.uploader.destroy(`submissions/${publicId}`);
      }
    }

    // ✅ Delete all submissions
    await Submission.deleteMany({ assignmentId });

    // ✅ Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({
      message: "Assignment and all related submissions deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
