import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Not Submitted", "Submitted"],
    default: "Not Submitted",
  }, // New field
  grade: { type: Number, default: null }, // Null until graded
  feedback: { type: String, default: "" },
});

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
