import express from "express";
import BlogController from "../controllers/blogController";

const router = express.Router();
const blogController = new BlogController();

// GET routes

router.get("/", blogController.getBlogs);
router.get("/:id", blogController.getBlog);

// POST, PUT, DELETE routes

router.post("/", blogController.createBlog);
router.put("/:id", blogController.updateBlog);
router.put("/:id/publish", blogController.togglePublishBlog);
router.delete("/:id", blogController.deleteBlog);

export default router;
