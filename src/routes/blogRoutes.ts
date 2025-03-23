import express from "express";
import BlogController from "../controllers/blogController";

const router = express.Router();
const blogController = new BlogController();

// GET routes

router.get("/blogs", blogController.getBlogs);
router.get("/blogs/:id", blogController.getBlog);

// POST, PUT, DELETE routes

router.post("/blogs", blogController.createBlog);
router.put("/blogs/:id", blogController.updateBlog);
router.put("/blogs/:id/publish", blogController.togglePublishBlog);
router.delete("/blogs/:id", blogController.deleteBlog);

export default router;
