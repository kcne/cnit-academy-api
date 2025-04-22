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
  getComments,
  deleteCommentById,
  postComment,
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
  authMiddleware("Admin"),
  validateCreateBlog,
  asyncHandler(createBlog),
);
router.patch(
  "/admin/:id",
  authMiddleware("Admin"),
  validateUpdateBlog,
  asyncHandler(updateBlog),
);
router.put(
  "/admin/:id/publish",
  authMiddleware("Admin"),
  asyncHandler(togglePublishBlog),
);
router.delete("/admin/:id", authMiddleware("Admin"), asyncHandler(deleteBlog));
router.get("/user/:userId", asyncHandler(handleGetBlogsByUserId));
router.get("/slug/:slug", asyncHandler(handleGetBlogBySlug));

router.get("/:id/comment", authMiddleware(), asyncHandler(getComments));
router.post("/:id/comment", authMiddleware(), asyncHandler(postComment));
router.delete(
  "/:id/comment/:commentId",
  authMiddleware("Admin"),
  asyncHandler(deleteCommentById),
);

export default router;
