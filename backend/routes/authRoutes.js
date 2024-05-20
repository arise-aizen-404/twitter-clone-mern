import express from "express";
import {
  createUser,
  getCurrentUser,
  logOutUser,
  loginUser,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logOutUser);

router.route("/profile").get(authenticate, getCurrentUser);

export default router;
