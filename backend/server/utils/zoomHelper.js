import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import GlobalMeeting from "../models/Video.js"; // Import the global meeting model

dotenv.config();

const router = express.Router();
const DAILY_API_KEY = process.env.DAILY_API_KEY;

// Create a new global meeting
router.post("/create-room", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      { privacy: "public" }, // Anyone can join
      { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } }
    );

    const meetingUrl = response.data.url;

    // Save meeting URL globally (overwrite the previous one)
    await GlobalMeeting.findOneAndUpdate({}, { meetingUrl }, { upsert: true });

    res.json({ roomUrl: meetingUrl });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Get the latest meeting link (no course-based separation)
router.get("/get-room", async (req, res) => {
  try {
    const globalMeeting = await GlobalMeeting.findOne();

    if (globalMeeting?.meetingUrl) {
      res.json({ roomUrl: globalMeeting.meetingUrl });
    } else {
      res.json({ roomUrl: null }); // No meeting found
    }
  } catch (error) {
    console.error("Error fetching meeting link:", error);
    res.status(500).json({ error: "Failed to get room URL" });
  }
});

export default router;
