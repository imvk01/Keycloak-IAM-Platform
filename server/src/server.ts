import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/team.route";
import organizationRoutes from "./routes/organization.routes";
import subOrganizationRoutes from "./routes/subOrganization.routes";
import userRoutes from "./routes/user.routes";
import globalSettingsRoutes from "./routes/globalSettings.routes";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to the DB");
  })
  .catch((err: Error) => {
    console.log("Error connecting to DB:", err);
  });

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Important for reading JWT from cookies
app.use(cookieParser());

// General API rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.use("/suborganizations", subOrganizationRoutes);
app.use("/users", userRoutes);
app.use("/api/global-settings", globalSettingsRoutes);

interface AppError extends Error {
  codeStatus?: number;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  const codeStatus = err.codeStatus || 500;
  const message = err.message || "Internal Server Error";

  return res.status(codeStatus).json({
    success: false,
    codeStatus,
    message,
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});