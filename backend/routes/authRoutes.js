import express from "express";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.json({ data: "you just signed up" });
});

export default router;
