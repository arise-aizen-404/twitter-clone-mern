// Importing packages
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/database.js";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

const port = process.env.PORT || 5005;

// Create Express app
const app = express();

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
