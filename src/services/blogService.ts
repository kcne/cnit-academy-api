import { PrismaClient } from "@prisma/client";
import { ErrorResponse } from "../middlewares/errorHandlerMiddleware";

const prisma = new PrismaClient();

class BlogService {
  async createBlog(data: any) {
    if (!data.title || !data.content) {
      throw new ErrorResponse("Invalid input data", 400);
    }
    return await prisma.blog.create({ data });
  }

  async getBlogs() {
    return await prisma.blog.findMany();
  }

  async getBlog(id: number) {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      throw new ErrorResponse("Blog not found", 404);
    }
    return blog;
  }

  async updateBlog(id: number, data: any) {
    if (!data.title || !data.content) {
      throw new ErrorResponse("Invalid input data", 400);
    }
    return await prisma.blog.update({ where: { id }, data });
  }

  async deleteBlog(id: number) {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      throw new ErrorResponse("Blog not found", 404);
    }

    await prisma.blog.delete({ where: { id } });
    return { message: "Blog deleted successfully" };
  }

  async updateBlogPublishStatus(blogId: number, isPublished: boolean) {
    if (typeof isPublished !== "boolean") {
      throw new ErrorResponse("Invalid publish status", 400);
    }

    return prisma.blog.update({
      where: { id: blogId },
      data: { published: isPublished },
    });
  }
}

export default BlogService;
