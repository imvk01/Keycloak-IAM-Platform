import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

import authRoutes from "./routes/team.route";
import organizationRoutes from "./routes/organization.routes";
import subOrganizationRoutes from "./routes/subOrganization.routes";
import userRoutes from "./routes/user.routes";
import globalSettingsRoutes from "./routes/globalSettings.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Important for Render + express-rate-limit
app.set("trust proxy", 1);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to the DB"))
  .catch((err: Error) => console.log("Error connecting to DB:", err));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://keycloak-iam-platform.onrender.com"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ success: true, message: "API is running..." });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.use("/suborganizations", subOrganizationRoutes);
app.use("/users", userRoutes);
app.use("/api/global-settings", globalSettingsRoutes);

// Serve frontend
const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

app.get("/*splat", (req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});