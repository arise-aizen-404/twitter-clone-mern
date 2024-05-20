import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { generateTokenAndSetCredentials } from "../utils/createToken.js";

export const createUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (!username || !fullName || !email || !password) {
    throw new Error("please check the credentials");
  }

  // const complexEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: "Invalid email format" });

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  if (password.length < 6)
    return res.status(400).json({ message: "Password atleast be 6 letters" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    username,
    email,
    fullName,
    password: hashedPassword,
  });

  try {
    generateTokenAndSetCredentials(res, newUser._id);
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
    });
  } catch (error) {
    console.log(`Error in createUser - ${error.message}`);
    res.status(400).json({ message: "Invalid user data" });
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordMatched = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordMatched)
      return res.status(400).json({ message: "Invalid username or password" });

    generateTokenAndSetCredentials(res, user._id);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
    });
  } catch (error) {
    console.log(`Error in createUser - ${error.message}`);
    res.status(400).json({ message: "Invalid user data" });
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(`Error in logOutUser - ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) res.send(user);
  } catch (error) {
    console.log(`Error in getCurrentUser - ${error.message}`);
    return res.status(404).json({ message: "User not found" });
  }
});
