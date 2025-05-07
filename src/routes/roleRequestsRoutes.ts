import { Router } from "express";
import {
  getRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
} from "../controllers/roleRequestController";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";
import adminMiddleware from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validate";
import { roleRequestSchema } from "../schemas/roleRequestValidationSchema";

const router = Router();

router.get(
  "/",
  authMiddleware(),
  adminMiddleware,
  asyncHandler(getRoleRequests),
);
router.post(
  "/",
  authMiddleware(),
  validateRequest(roleRequestSchema),
  asyncHandler(sendRoleRequest),
);
router.post(
  "/approve/:id",
  adminMiddleware,
  authMiddleware(),
  asyncHandler(approveRoleRequest),
);
router.post(
  "/decline/:id",
  adminMiddleware,
  authMiddleware(),
  asyncHandler(declineRoleRequest),
);

export default router;
