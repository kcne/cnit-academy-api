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

const router = Router();

router.get("/", asyncHandler(getAllBadges));
router.get("/:id", asyncHandler(getBadgeById));
router.put("/:id/buy", asyncHandler(buyBadge));

// admin routes
router.post(
  "/admin",
  authMiddleware("Admin"),
  // validateCreateBadge,
  asyncHandler(createBadge),
);
router.patch(
  "/admin/:id",
  authMiddleware("Admin"),
  // validateUpdateBadge,
  asyncHandler(updateBadgeById),
);
router.delete(
  "/admin/:id",
  authMiddleware("Admin"),
  asyncHandler(deleteBadgeById),
);

export default router;
