import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getUserProfile,
  followUnFollowUser,
  getsuggestedUsers,
  updateUserProfile,
} from "../controllers/userController.js";
const router = express.Router();

// user-routes
router.route("/profile/:username").get(authenticate, getUserProfile);
router.route("/follow/:id").post(authenticate, followUnFollowUser);
router.route("/suggested").get(authenticate, getsuggestedUsers);
router.route("/update").post(authenticate, updateUserProfile);

export default router;
