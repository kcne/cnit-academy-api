import { Router } from "express";
import {
  getRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
} from "../controllers/roleRequestController";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware, { Role } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validate";
import { roleRequestSchema } from "../schemas/roleRequestValidationSchema";

const router = Router();

router.get("/", authMiddleware([Role.admin]), asyncHandler(getRoleRequests));
router.post(
  "/",
  authMiddleware(),
  validateRequest(roleRequestSchema),
  asyncHandler(sendRoleRequest),
);
router.post(
  "/approve/:id",
  authMiddleware([Role.admin]),
  asyncHandler(approveRoleRequest),
);
router.post(
  "/decline/:id",
  authMiddleware([Role.admin]),
  asyncHandler(declineRoleRequest),
);

export default router;
