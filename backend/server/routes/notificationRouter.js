import express from "express";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/authMiddleware.js";

const notificationRoutes = express.Router();

// ✅ Fetch user notifications
notificationRoutes.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Mark a notification as read
notificationRoutes.put("/read/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Clear all notifications
notificationRoutes.delete("/clear", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default notificationRoutes;
