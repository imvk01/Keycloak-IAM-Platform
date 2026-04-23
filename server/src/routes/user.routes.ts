import express from "express";
import {
  createUser,
  getUsersByTeam,
  getUsersByOrganization,
  getUserById,
  updateUser,
  updateUserPermissions,
  deleteUsers,
} from "../controller/user.controller";

import { verifyToken } from "../utils/verifyUser";

const router = express.Router();

router.post("/", verifyToken, createUser);
router.get("/team/:teamId", verifyToken, getUsersByTeam);
router.get("/organization/:organizationId", verifyToken, getUsersByOrganization);
router.get("/:userId", verifyToken, getUserById);
router.put("/:userId", verifyToken, updateUser);
router.put("/:userId/permissions", verifyToken, updateUserPermissions);
router.delete("/", verifyToken, deleteUsers);

export default router;