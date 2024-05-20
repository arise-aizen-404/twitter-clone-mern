import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateTokenAndSetCredentials = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  // set jwt as an HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true, // prevent xss attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV != "development",
  });
  return token;
};
