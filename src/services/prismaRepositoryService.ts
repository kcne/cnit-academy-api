import { PrismaClient } from "@prisma/client";
import {
  QueryOptions,
  buildWhereClause,
  createPaginatedResponse,
  PaginatedResult,
} from "../utils/queryBuilder";

export class PrismaRepositoryService<T, K extends string> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(prisma: PrismaClient, model: any) {
    this.prisma = prisma;
    this.model = model;
  }

  async getAll(options: QueryOptions<K>): Promise<PaginatedResult<T>> {
    const { pagination, sort, filters } = options;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = filters ? buildWhereClause(filters) : {};
    const orderBy = sort ? { [sort.field]: sort.order } : { id: "desc" };

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.model.count({ where }),
    ]);

    return createPaginatedResponse(items, total, pagination);
  }

  async findItem(id: number): Promise<T | null> {
    return this.model.findUnique({
      where: { id: id },
    });
  }

  async createItem(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async updateItem(id: number, data: any): Promise<T> {
    return this.model.update({
      where: { id: id },
      data,
    });
  }

  async deleteItem(id: number): Promise<T> {
    return this.model.delete({
      where: { id: id },
    });
  }
}
