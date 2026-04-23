import express from "express";
import {
  addSubOrganization,
  getSubOrganizations,
  getSubOrganizationById,
  updateSubOrganization,
  deleteSubOrganization,
  appendEmailsToSubOrganization,
} from "../controller/subOrganization.controller";

import { verifyToken } from "../utils/verifyUser";

const router = express.Router();

router.post("/:organizationId", verifyToken, addSubOrganization);
router.get("/:organizationId/:subOrganizationId", verifyToken, getSubOrganizationById);
router.put("/:organizationId/:subOrganizationId", verifyToken, updateSubOrganization);
router.put(
  "/:organizationId/:subOrganizationId/append-emails",
  verifyToken,
  appendEmailsToSubOrganization
);
router.delete("/:organizationId/:subOrganizationId", verifyToken, deleteSubOrganization);
router.get("/:organizationId", verifyToken, getSubOrganizations);

export default router;