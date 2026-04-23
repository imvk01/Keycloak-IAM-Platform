import express from "express";
import rateLimit from "express-rate-limit";
import { signup, signin, signOut } from "../controller/team.controller";
import { verifyToken } from "../utils/verifyUser";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

router.post("/signup", signup);
router.post("/signin", authLimiter, signin);
router.post("/signout", verifyToken, signOut);

export default router;