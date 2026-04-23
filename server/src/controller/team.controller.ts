import { Request, Response, NextFunction } from "express";
import Team from "../models/team.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error";
import { z } from "zod";


const signinSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  
  try {
    const parsed = signupSchema.safeParse(req.body);
  
    if (!parsed.success) {
      return next(errorHandler(400, "Invalid signup data"));
    }
  
    const { name, email, password } = parsed.data;
    const existingUser = await Team.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "User already exists"));
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = new Team({
      name,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {


  try {
    const parsed = signinSchema.safeParse(req.body);
  
    if (!parsed.success) {
      return next(errorHandler(400, "Invalid email or password"));
    }
  
    const { email, password } = parsed.data;

    const validUser = await Team.findOne({ email }).select("+password");

    if (!validUser || validUser.isDeleted) {
      return next(errorHandler(404, "User not found!"));
    }

    const validPassword = await bcrypt.compare(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Wrong credentials"));
    }

    const token = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const userObj = validUser.toObject();
    const { password: pass, ...rest } = userObj;

    res
  .cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  })
  .status(200)
  .json({
    success: true,
    message: "Login successful",
    user: rest,
  });

  } catch (error) {
    next(error);
  }
};

export const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
  res
  .clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  })
  .status(200)
  .json({
    success: true,
    message: "User has been logged out",
  });
  } catch (error) {
    next(error);
  }
};