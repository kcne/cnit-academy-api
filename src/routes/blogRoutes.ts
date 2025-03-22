import express from "express";
import BlogController from "../controllers/blogController";

const router = express.Router();
const blogController = new BlogController();

router.post("/blogs", blogController.createBlog);
router.get("/blogs", blogController.getBlogs);
router.get("/blogs/:id", blogController.getBlog);
router.put("/blogs/:id", blogController.updateBlog);
router.delete("/blogs/:id", blogController.deleteBlog);

export default router;
