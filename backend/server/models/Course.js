import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    className: { type: String, required: true },
    division: { type: String, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pendingEnrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", CourseSchema);
export default Course;
