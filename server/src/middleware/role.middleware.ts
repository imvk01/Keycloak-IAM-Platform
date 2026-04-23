import { Response, NextFunction } from "express";
import { AuthRequest } from "../utils/verifyUser";
import { errorHandler } from "../utils/error";

export const requireLoggedInTeam = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.id) {
    return next(errorHandler(401, "Unauthorized"));
  }

  next();
};