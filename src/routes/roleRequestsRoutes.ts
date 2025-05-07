import { Router } from "express";
import {
  getRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
} from "../controllers/roleRequestController";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validate";
import { roleRequestSchema } from "../schemas/roleRequestValidationSchema";

const router = Router();

router.get("/", authMiddleware(["ADMIN"]), asyncHandler(getRoleRequests));
router.post(
  "/",
  authMiddleware(),
  validateRequest(roleRequestSchema),
  asyncHandler(sendRoleRequest),
);
router.post(
  "/approve/:id",
  authMiddleware(["ADMIN"]),
  asyncHandler(approveRoleRequest),
);
router.post(
  "/decline/:id",
  authMiddleware(["ADMIN"]),
  asyncHandler(declineRoleRequest),
);

export default router;
