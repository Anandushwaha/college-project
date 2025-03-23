import express from "express";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/authMiddleware.js";

const notificationRoutes = express.Router();

// ✅ Fetch user notifications
notificationRoutes.get("/notifications", authMiddleware, async (req, res) => {
  try {
    console.log("enrollement request received");
    const userId = req.user.id; // ✅ Get logged-in teacher's ID

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, notifications }); // ✅ Ensure correct response
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Mark a notification as read
notificationRoutes.put(
  "/notifications/read/:id",
  authMiddleware,
  async (req, res) => {
    try {
      console.log("read notification received n");
      const { id } = req.params;

      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      notification.isRead = true;
      await notification.save();

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Clear all notifications
notificationRoutes.delete("/clear", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
// Fetch a specific notification by ID
notificationRoutes.get(
  "/notifications/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ success: true, notification });
    } catch (error) {
      console.error("Error fetching notification:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

export default notificationRoutes;
