import { Router } from "express";
import {
  getAllRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
  getPendingRoleRequests,
} from "../controllers/roleRequestController";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware, { Role } from "../middlewares/authMiddleware";
import { validateCreateRoleRequest } from "../services/RoleRequestService";

const router = Router();

router.get("/", authMiddleware([Role.admin]), asyncHandler(getAllRoleRequests));
router.get(
  "/pending",
  authMiddleware([Role.admin]),
  asyncHandler(getPendingRoleRequests),
);
router.post(
  "/",
  authMiddleware(),
  validateCreateRoleRequest,
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
