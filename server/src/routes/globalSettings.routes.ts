import express from "express";
import {
  getGlobalSettings,
  updateSingleGlobalSetting,
} from "../controller/globalSettings.controller";

import { verifyToken } from "../utils/verifyUser";

const router = express.Router();

router.get("/:teamId", verifyToken, getGlobalSettings);
router.patch("/:teamId", verifyToken, updateSingleGlobalSetting);

export default router;