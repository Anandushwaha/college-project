import express from "express";
import dotenv from "dotenv";
import GlobalMeeting from "../models/Video.js";

dotenv.config();

const router = express.Router();

// Utility to generate a unique Jitsi room name
function generateJitsiRoomName() {
  return `JitsiRoom_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}

// Create a new global Jitsi meeting
router.post("/create-room", async (req, res) => {
  try {
    const roomName = generateJitsiRoomName();
    const meetingUrl = `https://meet.jit.si/${roomName}`;

    // Save meeting URL globally (overwrite the previous one)
    await GlobalMeeting.findOneAndUpdate({}, { meetingUrl }, { upsert: true });

    res.json({ roomUrl: meetingUrl });
  } catch (error) {
    console.error("Error creating Jitsi room:", error);
    res.status(500).json({ error: "Failed to create Jitsi room" });
  }
});

// Get the latest Jitsi meeting link
router.get("/get-room", async (req, res) => {
  try {
    const globalMeeting = await GlobalMeeting.findOne();

    if (globalMeeting?.meetingUrl) {
      res.json({ roomUrl: globalMeeting.meetingUrl });
    } else {
      res.json({ roomUrl: null }); // No meeting found
    }
  } catch (error) {
    console.error("Error fetching Jitsi room link:", error);
    res.status(500).json({ error: "Failed to get Jitsi room URL" });
  }
});

export default router;
