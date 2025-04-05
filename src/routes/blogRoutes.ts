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

const router = Router();

router.get("/", asyncHandler(getBlogs));
router.get("/:id", asyncHandler(getBlog));
router.post("/", validateCreateBlog, asyncHandler(createBlog));
router.patch("/:id", validateUpdateBlog, asyncHandler(updateBlog));
router.put("/:id/publish", asyncHandler(togglePublishBlog));
router.delete("/:id", asyncHandler(deleteBlog));

export default router;
