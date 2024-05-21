import asyncHandler from "../middlewares/asyncHandler.js";
import notificationModel from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const user = await User.findById(req.user._id.toString());
    if (!user) return res.status(404).json({ error: "user not found" });

    if (!text && !img)
      return res.status(400).json({ error: "post must have text or image" });

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = await new Post({
      user: user._id,
      text: text,
      img: img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error in deletePost - ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

const deletePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Invalid post" });

    if (post.user.toString() !== req.user._id.toString())
      return res
        .status(401)
        .josn({ error: "Unauthorized to delete this post" });

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    if (post) await Post.deleteOne({ _id: postId });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(`Error in deletePost - ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

const commentOnPost = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(404).josn({ error: "Text field is required" });
    // const user = req.user._id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comment = { user: req.user._id, text: text };
    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.log(`Error in commentOnPost - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const likeUnlikePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  try {
    const post = await Post.findById(postId);
    const userId = req.user._id;

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      // Unlike action
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { likedPosts: postId } });

      res.status(201).json({ message: "Post unliked successfully" });
    } else {
      // Like action
      await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $push: { likedPosts: postId } });
      // Creating and saving a notification
      const notification = new notificationModel({
        type: "like",
        from: userId,
        to: post.user,
      });
      await notification.save();
      res.status(201).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.log(`Error in likeUnlikePost - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user._id;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment within the post's comments array
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the author of the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Unauthorized action: You can only delete your own comments",
      });
    }

    // Remove the comment
    // comment.remove();
    post.comments.pull(commentId);

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteComment - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in getAllPosts - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const getAllLikedPosts = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    res.status(201).json(likedPosts);
  } catch (error) {
    console.log(`Error in getAllLikedPosts - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const getPostById = asyncHandler(async (req, res) => {
  try {
    res.status(200).json(
      await Post.findById(req.params.id)
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({ path: "comments.user", select: "-password" })
    );
  } catch (error) {
    console.log(`Error in getPostById - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const getPostsOfFollowing = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id.toString());
    if (!user) return res.status(404).json({ error: "User not found" });

    const followingOnes = user.following;

    const feedPosts = await Post.find({ user: { $in: followingOnes } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log(`Error in getPostsOfFollowing - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const getUserPosts = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ error: "user not found" });

    const userPosts = await Post.find({ user: user._id })
      .sort({ created: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(userPosts);
  } catch (error) {
    console.log(`Error in getUserPosts - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getAllLikedPosts,
  getPostById,
  deleteComment,
  getPostsOfFollowing,
  getUserPosts,
};
