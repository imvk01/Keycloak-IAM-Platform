import { Request, Response } from "express";
import Team from "../models/team.model";
import mongoose from "mongoose";
import { AuthRequest } from "../utils/verifyUser";

type TeamParams = {
  teamId: string;
};

export const getGlobalSettings = async (
  req: AuthRequest & Request<TeamParams>,
  res: Response
) => {
  try {
    const { teamId } = req.params;

    if (req.user?.id !== teamId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this team",
      });
    }

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teamId",
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      isDeleted: false,
    }).select("globalSettings");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: team.globalSettings,
    });
  } catch (error) {
    console.error("Get Global Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateSingleGlobalSetting = async (
  req: AuthRequest & Request<TeamParams>,
  res: Response
) => {
  try {
    const { teamId } = req.params;
    if (req.user?.id !== teamId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this team",
      });
    }
    const { section, key, value } = req.body;

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teamId",
      });
    }

    if (!section || !key || typeof value !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "section, key and value are required",
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      isDeleted: false,
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (section === "userAuth") {
      const allowedUserAuthKeys = [
        "passkeys",
        "passwordLoginEnabled",
        "emailUser",
        "smsUser",
      ];

      if (!allowedUserAuthKeys.includes(key)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userAuth key",
        });
      }

      team.globalSettings.userAuth = {
        ...team.globalSettings.userAuth,
        [key]: value,
      };
    } else if (section === "mfa") {
      const allowedMfaKeys = ["totp", "emailMfa", "smsMfa"];

      if (!allowedMfaKeys.includes(key)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mfa key",
        });
      }

      team.globalSettings.mfa = {
        ...team.globalSettings.mfa,
        [key]: value,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid section",
      });
    }

    await team.save();

    return res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: team.globalSettings,
    });
  } catch (error) {
    console.error("Update Global Setting Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};