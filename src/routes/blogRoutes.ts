import { Router } from "express";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
} from "../controllers/blogController";
import {
  validateCreateBlog,
  validateUpdateBlog,
} from "../services/blogService";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getBlogs));
router.get("/:id", asyncHandler(getBlog));

// admin routes
router.post(
  "/admin",
  authMiddleware,
  validateCreateBlog,
  asyncHandler(createBlog),
);
router.patch(
  "/admin/:id",
  authMiddleware,
  validateUpdateBlog,
  asyncHandler(updateBlog),
);
router.put(
  "/admin/:id/publish",
  authMiddleware,
  asyncHandler(togglePublishBlog),
);
router.delete("/admin/:id", authMiddleware, asyncHandler(deleteBlog));

export default router;
