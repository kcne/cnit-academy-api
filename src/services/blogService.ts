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

  async togglePublishBlog(id: number, publish: boolean) {
    if (typeof publish !== "boolean") {
      throw new ErrorResponse("Invalid publish value", 400);
    }

    return await prisma.blog.update({
      where: { id },
      data: { published: publish },
    });
  }
}

export default BlogService;
