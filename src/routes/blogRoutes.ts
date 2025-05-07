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
  updateBlogById,
} from "../controllers/blogController";
import {
  validateCreateBlog,
  validateCreateComment,
  validateUpdateBlog,
} from "../services/blogService";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getBlogs));
router.get("/:id", asyncHandler(getBlog));
router.get("/user/:userId", asyncHandler(handleGetBlogsByUserId));
router.get("/slug/:slug", asyncHandler(handleGetBlogBySlug));
router.get("/:id/comment", authMiddleware(), asyncHandler(getComments));
router.post(
  "/:id/comment",
  authMiddleware(),
  validateCreateComment,
  asyncHandler(postComment),
);
router.get("/user/:userId", asyncHandler(handleGetBlogsByUserId));
router.get("/slug/:slug", asyncHandler(handleGetBlogBySlug));

router.patch("/user/:id", authMiddleware(), asyncHandler(updateBlogById));

router.post(
  "/admin",
  authMiddleware(["INSTRUCTOR"]),
  validateCreateBlog,
  asyncHandler(createBlog)
);
router.patch(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  validateUpdateBlog,
  asyncHandler(updateBlog)
);
router.put(
  "/admin/:id/publish",
  authMiddleware("Admin"),
  asyncHandler(togglePublishBlog)
);
router.delete(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  asyncHandler(deleteBlog),
);
router.delete(
  "/admin/:id/comment/:commentId",
  authMiddleware(["ADMIN"]),
  asyncHandler(deleteCommentById),
);

export default router;
