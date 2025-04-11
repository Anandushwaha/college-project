import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: [
        "enrollment_request",
        "enrollment_approved",
        "enrollment_rejected",
        "enrollment_invitation",
        "invitation_accepted",
        "invitation_declined",
        "general",
      ],
      default: "general",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionId: {
      type: String,
    },
    data: {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      courseName: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
