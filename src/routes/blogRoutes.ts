import { Router } from "express";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
  handleGetBlogsByUserId,
  handleGetBlogBySlug,
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
router.post("/", authMiddleware, validateCreateBlog, asyncHandler(createBlog));
router.patch(
  "/:id",
  authMiddleware,
  validateUpdateBlog,
  asyncHandler(updateBlog),
);
router.put("/:id/publish", authMiddleware, asyncHandler(togglePublishBlog));
router.delete("/:id", authMiddleware, asyncHandler(deleteBlog));
router.get("/user/:userId", asyncHandler(handleGetBlogsByUserId));
router.get("/slug/:slug", asyncHandler(handleGetBlogBySlug));

export default router;
