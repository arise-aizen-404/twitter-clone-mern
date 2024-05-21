import Notification from "../models/notificationModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const getNotifications = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log(`Error in getNotifications - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const deleteNotifications = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log(`Error in deleteNotifications - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const deleteNotificationById = asyncHandler(async (req, res) => {
  try {
    const { id: notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    if (notification.to.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this notification" });
    await Notification.deleteOne({ _id: notificationId });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log(`Error in deleteNotificationById - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export { getNotifications, deleteNotifications, deleteNotificationById };
