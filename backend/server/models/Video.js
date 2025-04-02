import mongoose from "mongoose";

const GlobalMeetingSchema = new mongoose.Schema({
  meetingUrl: { type: String, required: true },
});

export default mongoose.model("GlobalMeeting", GlobalMeetingSchema);
