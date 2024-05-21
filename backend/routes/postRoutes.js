import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  commentOnPost,
  getAllPosts,
  getAllLikedPosts,
  getPostById,
  deleteComment,
  getPostsOfFollowing,
  getUserPosts,
} from "../controllers/postController.js";

const router = express.Router();

router.route("/create").post(authenticate, createPost);
router.route("/like/:id").post(authenticate, likeUnlikePost);
router.route("/comment/:id").post(authenticate, commentOnPost);
router
  .route("/:postId/comments/:commentId")
  .delete(authenticate, deleteComment);
router.route("/all").get(authenticate, getAllPosts);
router.route("/likes/:userId").get(authenticate, getAllLikedPosts);
router.route("/following").get(authenticate, getPostsOfFollowing);
router.route("/user/:username").get(authenticate, getUserPosts);
router
  .route("/:id")
  .delete(authenticate, deletePost)
  .get(authenticate, getPostById);

export default router;
