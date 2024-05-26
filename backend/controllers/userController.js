import bcrypt from "bcryptjs/dist/bcrypt.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "user not found" });
    // console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.log(`Error in getUserProflie - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export const followUnFollowUser = asyncHandler(async (req, res) => {
  try {
    const { id: opponentUserId } = req.params;
    const userToModify = await User.findById(opponentUserId);
    const currUser = await User.findById(req.user._id);
    if (!userToModify || !currUser)
      return res.status(404).json({ message: "User not found" });
    if (opponentUserId.toString() == currUser._id.toString())
      return res
        .status(404)
        .json({ message: "You cant follow or unfollow yourself" });
    if (currUser.following.includes(opponentUserId)) {
      // unfollow the opponentUser
      await User.findByIdAndUpdate(opponentUserId, {
        $pull: { followers: currUser._id },
      });
      await User.findByIdAndUpdate(currUser._id, {
        $pull: { following: opponentUserId },
      });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // follow the opponentUser
      await User.findByIdAndUpdate(opponentUserId, {
        $push: { followers: currUser._id },
      });
      await User.findByIdAndUpdate(currUser._id, {
        $push: { following: opponentUserId },
      });
      const notification = new Notification({
        type: "follow",
        from: currUser._id,
        to: userToModify._id,
      });
      await notification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log(`Error in followUnFollowUser - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export const getsuggestedUsers = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const usersFollowedByMe = await User.findById(currentUserId).select(
      "following"
    );
    const usersExcludeMe = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = usersExcludeMe.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(`Error in getsuggestedUsers - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, fullName, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ message: "Please provide both current and new passwords" });
    }

    if (currentPassword && newPassword) {
      const isMatched = await bcrypt.compare(currentPassword, user.password);
      if (!isMatched) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
      user.profileImg = profileImg;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
      user.coverImg = coverImg;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();

    // Remove the password field from the response
    user.password = undefined;

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error in updateUserProfile - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});
