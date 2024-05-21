import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token" });
  try {
    const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedJWT.userId).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: token failed" });
  }
});
