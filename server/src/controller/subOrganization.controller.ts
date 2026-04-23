import { Request, Response } from "express";
import mongoose from "mongoose";
import Organization from "../models/organization.model";
import User from "../models/user.model";

type SubOrganizationParams = {
  organizationId: string;
  subOrganizationId: string;
};

type OrganizationOnlyParams = {
  organizationId: string;
};

const normalizeEmailList = (emails: string[] = []) => {
  return [...new Set(
    emails
      .map((email) => email?.trim().toLowerCase())
      .filter((email) => !!email)
  )];
};

export const addSubOrganization = async (
  req: Request<OrganizationOnlyParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;
    const { subOrganizationName, emails = [] } = req.body;

    if (!organizationId || !subOrganizationName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "organizationId and subOrganizationName are required",
      });
    }

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

    const normalizedName = subOrganizationName.trim();

    const existingSubOrg = organization.subOrganizations.find(
      (sub) => sub.name.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (existingSubOrg) {
      return res.status(400).json({
        success: false,
        message: "SubOrganization already exists",
      });
    }

    organization.subOrganizations.push({
      name: normalizedName,
      emails: normalizeEmailList(emails).map((email) => ({ email })),
    });

    await organization.save();

    return res.status(201).json({
      success: true,
      message: "SubOrganization added successfully",
      data: organization.subOrganizations,
    });
  } catch (error) {
    console.error("Add SubOrganization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getSubOrganizations = async (
  req: Request<OrganizationOnlyParams>,
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
      data: organization.subOrganizations || [],
    });
  } catch (error) {
    console.error("Get SubOrganizations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subOrganizations",
    });
  }
};

export const getSubOrganizationById = async (
  req: Request<SubOrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId, subOrganizationId } = req.params;

    if (
      !mongoose.isValidObjectId(organizationId) ||
      !mongoose.isValidObjectId(subOrganizationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
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

    const subOrganization = organization.subOrganizations.find(
      (sub) => sub._id?.toString() === subOrganizationId
    );

    if (!subOrganization) {
      return res.status(404).json({
        success: false,
        message: "SubOrganization not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subOrganization,
    });
  } catch (error) {
    console.error("Get SubOrganization By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subOrganization",
    });
  }
};

export const updateSubOrganization = async (
  req: Request<SubOrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId, subOrganizationId } = req.params;
    const { subOrganizationName, emails } = req.body;

    if (
      !mongoose.isValidObjectId(organizationId) ||
      !mongoose.isValidObjectId(subOrganizationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
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

    const subOrg = organization.subOrganizations.find(
      (sub) => sub._id?.toString() === subOrganizationId
    );

    if (!subOrg) {
      return res.status(404).json({
        success: false,
        message: "SubOrganization not found",
      });
    }

    if (
      subOrganizationName !== undefined &&
      subOrganizationName.trim() !== "" &&
      subOrganizationName.trim() !== subOrg.name
    ) {
      const duplicateSubOrg = organization.subOrganizations.find(
        (sub) =>
          sub._id?.toString() !== subOrganizationId &&
          sub.name.trim().toLowerCase() ===
            subOrganizationName.trim().toLowerCase()
      );

      if (duplicateSubOrg) {
        return res.status(400).json({
          success: false,
          message: "SubOrganization name already exists",
        });
      }

      subOrg.name = subOrganizationName.trim();
    }

    if (emails !== undefined) {
      subOrg.emails = normalizeEmailList(
        emails.map((item: { email: string } | string) =>
          typeof item === "string" ? item : item.email
        )
      ).map((email) => ({ email }));
    }

    await organization.save();

    return res.status(200).json({
      success: true,
      message: "SubOrganization updated successfully",
      data: subOrg,
    });
  } catch (error) {
    console.error("Update SubOrganization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const appendEmailsToSubOrganization = async (
  req: Request<SubOrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId, subOrganizationId } = req.params;
    const { emails = [] } = req.body;

    if (
      !mongoose.isValidObjectId(organizationId) ||
      !mongoose.isValidObjectId(subOrganizationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
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

    const subOrg = organization.subOrganizations.find(
      (sub) => sub._id?.toString() === subOrganizationId
    );

    if (!subOrg) {
      return res.status(404).json({
        success: false,
        message: "SubOrganization not found",
      });
    }

    const existingEmails = subOrg.emails.map((item) =>
      item.email.trim().toLowerCase()
    );

    const incomingEmails = normalizeEmailList(emails);

    const emailsToAdd = incomingEmails.filter(
      (email) => !existingEmails.includes(email)
    );

    subOrg.emails.push(...emailsToAdd.map((email) => ({ email })));

    await organization.save();

    return res.status(200).json({
      success: true,
      message: "Emails added to subOrganization successfully",
      data: subOrg,
    });
  } catch (error) {
    console.error("Append Emails To SubOrganization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteSubOrganization = async (
  req: Request<SubOrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId, subOrganizationId } = req.params;

    if (
      !mongoose.isValidObjectId(organizationId) ||
      !mongoose.isValidObjectId(subOrganizationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const subOrgExists = organization.subOrganizations.some(
      (sub) => sub._id?.toString() === subOrganizationId
    );

    if (!subOrgExists) {
      return res.status(404).json({
        success: false,
        message: "SubOrganization not found",
      });
    }

    const usersCount = await User.countDocuments({
      organizationId,
      subOrganizationId,
    });

    organization.subOrganizations = organization.subOrganizations.filter(
      (sub) => sub._id?.toString() !== subOrganizationId
    );

    await organization.save();

    await User.deleteMany({
      organizationId,
      subOrganizationId,
    });

    return res.status(200).json({
      success: true,
      message:
        usersCount > 0
          ? `SubOrganization deleted successfully. ${usersCount} users deleted.`
          : "SubOrganization deleted successfully",
    });
  } catch (error) {
    console.error("Delete SubOrganization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};