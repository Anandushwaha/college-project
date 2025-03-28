import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["general", "assignment", "exam", "urgent"],
      required: true,
    },
    attachments: [{ type: String }], // Array of file URLs (Cloudinary, etc.)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
