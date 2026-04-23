import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { errorHandler } from "./error";

export interface AuthRequest extends Request {
  user?: JwtPayload & {
    id: string;
  };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.access_token;

  console.log("COOKIE TOKEN:", token);

  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (
      err: VerifyErrors | null,
      decoded: string | JwtPayload | undefined
    ) => {
      if (err) {
        console.log("JWT ERROR:", err);
        return next(errorHandler(403, "Forbidden"));
      }

      req.user = decoded as JwtPayload & { id: string };
      console.log("DECODED USER:", req.user);

      next();
    }
  );
};