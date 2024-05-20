// Importing packages
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./config/database.js";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables from .env file
dotenv.config({ path: ".env" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Express app
const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port - ${port}`);
  connectDB();
});

// Routes
app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
