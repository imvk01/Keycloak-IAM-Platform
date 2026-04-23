import express from "express";
import {
  addOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationDeleteInfo,
  appendEmailsToOrganization,
} from "../controller/organization.controller";

import { verifyToken } from "../utils/verifyUser";

const router = express.Router();

router.post("/:teamId", verifyToken, addOrganization);
router.get("/team/:teamId", verifyToken, getOrganizations);
router.get("/:organizationId/delete-info", verifyToken, getOrganizationDeleteInfo);
router.get("/:organizationId", verifyToken, getOrganizationById);
router.put("/:organizationId", verifyToken, updateOrganization);
router.put("/:organizationId/append-emails", verifyToken, appendEmailsToOrganization);
router.delete("/:organizationId", verifyToken, deleteOrganization);

export default router;