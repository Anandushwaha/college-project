import Notification from "../models/Notification.js";

export const sendNotification = async (userId, message) => {
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
