import { Request, Response } from "express";
import mongoose from "mongoose";
import Team from "../models/team.model";
import Organization from "../models/organization.model";
import User from "../models/user.model";

type TeamIdParams = {
  teamId: string;
};

type OrganizationIdParams = {
  organizationId: string;
};

const normalizeEmailList = (emails: string[] = []) => {
  return [...new Set(
    emails
      .map((email) => email?.trim().toLowerCase())
      .filter((email) => !!email)
  )];
};

export const addOrganization = async (
  req: Request<TeamIdParams>,
  res: Response
) => {
  try {
    const { teamId } = req.params;
    const { organizationName, emails = [] } = req.body;

    if (!teamId || !organizationName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "teamId and organizationName are required",
      });
    }

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team id",
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

    const normalizedName = organizationName.trim();

    const existingOrg = await Organization.findOne({
      teamId,
      name: normalizedName,
      isDeleted: false,
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: "Organization already exists",
      });
    }

    const organization = await Organization.create({
      teamId,
      name: normalizedName,
      emails: normalizeEmailList(emails).map((email) => ({ email })),
      subOrganizations: [],
    });

    return res.status(201).json({
      success: true,
      message: "Organization added successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Add Organization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getOrganizations = async (
  req: Request<TeamIdParams>,
  res: Response
) => {
  try {
    const { teamId } = req.params;

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team id",
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

    const organizations = await Organization.find({
      teamId,
      isDeleted: false,
    }).lean();

    return res.status(200).json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error("Get Organizations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching organizations",
    });
  }
};

export const getOrganizationById = async (
  req: Request<OrganizationIdParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization id",
      });
    }

    const organization = await Organization.findOne({
      _id: organizationId,
      isDeleted: false,
    }).lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Get Organization By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching organization",
    });
  }
};

export const updateOrganization = async (
  req: Request<OrganizationIdParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;
    const { organizationName, emails } = req.body;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization id",
      });
    }

    const organization = await Organization.findOne({
      _id: organizationId,
      isDeleted: false,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (
      organizationName !== undefined &&
      organizationName.trim() !== "" &&
      organizationName.trim() !== organization.name
    ) {
      const duplicateOrganization = await Organization.findOne({
        teamId: organization.teamId,
        name: organizationName.trim(),
        isDeleted: false,
        _id: { $ne: organizationId },
      });

      if (duplicateOrganization) {
        return res.status(400).json({
          success: false,
          message: "Organization name already exists",
        });
      }

      organization.name = organizationName.trim();
    }

    if (emails !== undefined) {
      organization.emails = normalizeEmailList(
        emails.map((item: { email: string } | string) =>
          typeof item === "string" ? item : item.email
        )
      ).map((email) => ({ email }));
    }

    await organization.save();

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Update Organization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const appendEmailsToOrganization = async (
  req: Request<OrganizationIdParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;
    const { emails = [] } = req.body;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization id",
      });
    }

    const organization = await Organization.findOne({
      _id: organizationId,
      isDeleted: false,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const existingEmails = organization.emails.map((item) =>
      item.email.trim().toLowerCase()
    );

    const incomingEmails = normalizeEmailList(emails);

    const emailsToAdd = incomingEmails.filter(
      (email) => !existingEmails.includes(email)
    );

    organization.emails.push(...emailsToAdd.map((email) => ({ email })));
    await organization.save();

    return res.status(200).json({
      success: true,
      message: "Emails added to organization successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Append Emails To Organization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getOrganizationDeleteInfo = async (
  req: Request<OrganizationIdParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization id",
      });
    }

    const organization = await Organization.findById(organizationId).lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const subOrganizationIds = (organization.subOrganizations || [])
      .map((sub: any) => sub._id?.toString())
      .filter(Boolean);

    const usersCount = await User.countDocuments({
      $or: [
        { organizationId },
        { subOrganizationId: { $in: subOrganizationIds } },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        organizationId: organization._id,
        organizationName: organization.name,
        usersCount,
        subOrganizationsCount: organization.subOrganizations?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get Organization Delete Info Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching delete info",
    });
  }
};

export const deleteOrganization = async (
  req: Request<OrganizationIdParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization id",
      });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const subOrganizationIds = (organization.subOrganizations || [])
      .map((sub) => sub._id?.toString())
      .filter(Boolean);

    const usersCount = await User.countDocuments({
      $or: [
        { organizationId },
        { subOrganizationId: { $in: subOrganizationIds } },
      ],
    });

    await User.deleteMany({
      $or: [
        { organizationId },
        { subOrganizationId: { $in: subOrganizationIds } },
      ],
    });

    await Organization.findByIdAndDelete(organizationId);

    return res.status(200).json({
      success: true,
      message:
        usersCount > 0
          ? `Organization and related data deleted successfully. ${usersCount} users deleted.`
          : "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Delete Organization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting organization",
    });
  }
};