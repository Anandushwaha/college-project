import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (Teacher)
      required: true,
    },
    studentsEnrolled: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model (Student)
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", CourseSchema);
export default Course;
