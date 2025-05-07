import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";
import {
  buyBadge,
  createBadge,
  deleteBadgeById,
  getAllBadges,
  getBadgeById,
  updateBadgeById,
} from "../controllers/storeController";
import {
  validateCreateBadge,
  validateUpdateBadge,
} from "../services/storeService";

const router = Router();

router.get("/", asyncHandler(getAllBadges));
router.get("/:id", asyncHandler(getBadgeById));
router.put("/:id/buy", asyncHandler(buyBadge));

// admin routes
router.post(
  "/admin",
  authMiddleware(["ADMIN"]),
  validateCreateBadge,
  asyncHandler(createBadge),
);
router.patch(
  "/admin/:id",
  authMiddleware(["ADMIN"]),
  validateUpdateBadge,
  asyncHandler(updateBadgeById),
);
router.delete(
  "/admin/:id",
  authMiddleware(["ADMIN"]),
  asyncHandler(deleteBadgeById),
);

export default router;
