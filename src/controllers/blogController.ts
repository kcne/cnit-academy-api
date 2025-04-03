import { Request, Response } from "express";
import BlogService from "../services/blogService";

const blogService = new BlogService();

class BlogController {
  async createBlog(req: Request, res: Response) {
    const data = req.body;
    const blog = await blogService.createBlog(data);
    res.status(201).json({data:blog});
  }

  async getBlogs(req: Request, res: Response) {
    const blogs = await blogService.getBlogs();
    res.json({data:blogs});
  }

  async getBlog(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const blog = await blogService.getBlog(id);
    res.json({data:blog});
  }

  async updateBlog(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const data = req.body;
    const blog = await blogService.updateBlog(id, data);
    res.json({data:blog});
  }

  async deleteBlog(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await blogService.deleteBlog(id);
    res.json({ message: "Blog deleted successfully" });
  }

  async togglePublishBlog(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const publish = req.body.publish;
    const blog = await blogService.updateBlogPublishStatus(id, publish);
    res.json({data:blog});
  }
}

export default BlogController;
