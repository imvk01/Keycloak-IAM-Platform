import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model";
import Team from "../models/team.model";
import Organization from "../models/organization.model";
import { AuthRequest } from "../utils/verifyUser";

// CREATE USER
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      teamId,
      organizationId,
      subOrganizationId = null,
      vorname,
      nachname,
      benutzername,
      email,
      telefonnummer,
      systemAdministrator = false,
      globalUserAdministrator = false,
      globalThirdLevelUser = false,
    } = req.body;

    if (!teamId || !organizationId || !vorname?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "teamId, organizationId, vorname and email are required",
      });
    }

    if (
      !mongoose.isValidObjectId(teamId) ||
      !mongoose.isValidObjectId(organizationId) ||
      (subOrganizationId && !mongoose.isValidObjectId(subOrganizationId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ids provided",
      });
    }

    const team = await Team.findOne({ _id: teamId, isDeleted: false });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const organization = await Organization.findOne({
      _id: organizationId,
      teamId,
      isDeleted: false,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (subOrganizationId) {
      const subOrgExists = organization.subOrganizations.some(
        (sub) => sub._id?.toString() === subOrganizationId.toString()
      );

      if (!subOrgExists) {
        return res.status(400).json({
          success: false,
          message: "SubOrganization does not belong to this organization",
        });
      }
    }

    const existingUser = await User.findOne({
      teamId,
      email: email.trim().toLowerCase(),
      isDeleted: false,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      teamId,
      organizationId,
      subOrganizationId: subOrganizationId || null,
      vorname: vorname.trim(),
      nachname: nachname?.trim() || "",
      benutzername: benutzername?.trim() || "",
      email: email.trim().toLowerCase(),
      telefonnummer: telefonnummer?.trim() || "",
      systemAdministrator: !!systemAdministrator,
      globalUserAdministrator: !!globalUserAdministrator,
      globalThirdLevelUser: !!globalThirdLevelUser,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Ein Benutzer mit dieser E-Mail existiert bereits",
    });
  }
};

// GET USERS BY TEAM
export const getUsersByTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    console.log("Logged in user id:", req.user?.id);
    console.log("Requested teamId:", teamId);

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teamId",
      });
    }

    const users = await User.find({
      teamId,
      isDeleted: false,
    }).lean();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("getUsersByTeam error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET USERS BY ORGANIZATION
export const getUsersByOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizationId",
      });
    }

    const users = await User.find({
      organizationId,
      isDeleted: false,
    }).lean();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("getUsersByOrganization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE USER
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE USER
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      organizationId,
      subOrganizationId,
      vorname,
      nachname,
      benutzername,
      email,
      telefonnummer,
      systemAdministrator,
      globalUserAdministrator,
      globalThirdLevelUser,
    } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const user = await User.findOne({ _id: userId, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const nextOrganizationId = organizationId ?? user.organizationId;
    const nextSubOrganizationId =
      subOrganizationId !== undefined
        ? subOrganizationId
        : user.subOrganizationId;

    if (
      !mongoose.isValidObjectId(nextOrganizationId) ||
      (nextSubOrganizationId &&
        !mongoose.isValidObjectId(nextSubOrganizationId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization/suborganization id",
      });
    }

    const organization = await Organization.findOne({
      _id: nextOrganizationId,
      teamId: user.teamId,
      isDeleted: false,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (nextSubOrganizationId) {
      const subOrgExists = organization.subOrganizations.some(
        (sub) => sub._id?.toString() === nextSubOrganizationId.toString()
      );

      if (!subOrgExists) {
        return res.status(400).json({
          success: false,
          message: "SubOrganization does not belong to this organization",
        });
      }
    }

    if (email !== undefined && email.trim()) {
      const duplicateEmail = await User.findOne({
        _id: { $ne: userId },
        teamId: user.teamId,
        email: email.trim().toLowerCase(),
        isDeleted: false,
      });

      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }
    }

    if (organizationId !== undefined) user.organizationId = organizationId;
    if (subOrganizationId !== undefined) {
      user.subOrganizationId = subOrganizationId || null;
    }
    if (vorname !== undefined) user.vorname = vorname.trim();
    if (nachname !== undefined) user.nachname = nachname.trim();
    if (benutzername !== undefined) user.benutzername = benutzername.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (telefonnummer !== undefined) user.telefonnummer = telefonnummer.trim();

    if (systemAdministrator !== undefined) {
      user.systemAdministrator = !!systemAdministrator;
    }

    if (globalUserAdministrator !== undefined) {
      user.globalUserAdministrator = !!globalUserAdministrator;
    }

    if (globalThirdLevelUser !== undefined) {
      user.globalThirdLevelUser = !!globalThirdLevelUser;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE ONLY USER PERMISSIONS
export const updateUserPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      systemAdministrator,
      globalUserAdministrator,
      globalThirdLevelUser,
    } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (systemAdministrator !== undefined) {
      user.systemAdministrator = !!systemAdministrator;
    }

    if (globalUserAdministrator !== undefined) {
      user.globalUserAdministrator = !!globalUserAdministrator;
    }

    if (globalThirdLevelUser !== undefined) {
      user.globalThirdLevelUser = !!globalThirdLevelUser;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User permissions updated successfully",
      user,
    });
  } catch (error) {
    console.error("updateUserPermissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE ONE OR MULTIPLE USERS
export const deleteUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds array is required",
      });
    }

    const invalidIds = userIds.filter(
      (id: string) => !mongoose.isValidObjectId(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more userIds are invalid",
      });
    }

    const result = await User.deleteMany({
      _id: { $in: userIds },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        result.deletedCount === 1
          ? "Benutzer wurde erfolgreich gelöscht."
          : `${result.deletedCount} Benutzer wurden erfolgreich gelöscht.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("deleteUsers error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting users",
    });
  }
};