import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const { DAILY_API_KEY } = process.env; // Destructuring for cleaner code

// Create a new Daily.co meeting room
router.post("/create-room", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      { privacy: "public" }, // Anyone can join
      { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } }
    );
    res.json({ roomUrl: response.data.url });
  } catch (error) {
    console.error(
      "Error creating room:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to create room" });
  }
});

export default router;
