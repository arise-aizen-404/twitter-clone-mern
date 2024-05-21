import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  deleteNotifications,
  deleteNotificationById,
} from "../controllers/notificationController.js";

const router = express.Router();

router.route("/").get(authenticate, getNotifications);
router.route("/").delete(authenticate, deleteNotifications);
router.route("/:id").delete(authenticate, deleteNotificationById);

export default router;
