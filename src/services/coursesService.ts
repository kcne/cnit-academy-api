import { PrismaClient } from '@prisma/client';
import { Course } from '@prisma/client';

const prisma = new PrismaClient();

interface CourseService {
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: number): Promise<Course | null>;
  deleteCourseById(id: number): Promise<void>;
  updateCourseById(id: number, course: Course): Promise<Course>;
  createCourse(course: Course): Promise<Course>;
}

class CourseServiceImpl implements CourseService {
  async getAllCourses(): Promise<Course[]> {
    return prisma.course.findMany();
  }

  async getCourseById(id: number): Promise<Course | null> {
    return prisma.course.findUnique({ where: { id } });
  }

  async deleteCourseById(id: number): Promise<void> {
    await prisma.course.delete({ where: { id } });
  }

  async updateCourseById(id: number, course: Course): Promise<Course> {
    return prisma.course.update({ where: { id }, data: course });
  }

  async createCourse(course: Course): Promise<Course> {
    return prisma.course.create({ data: course });
  }
}

export default CourseServiceImpl;