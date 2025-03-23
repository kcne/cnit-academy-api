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

  async findAll(options: QueryOptions<K>): Promise<PaginatedResult<T>> {
    const { pagination, sort, filters, includeUser } = options;
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

  async findById(id: number): Promise<T | null> {
    return this.model.findUnique({
      where: { id: Number(id) },
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: number, data: any): Promise<T> {
    return this.model.update({
      where: { id: Number(id) },
      data,
    });
  }

  async delete(id: number): Promise<T> {
    return this.model.delete({
      where: { id: Number(id) },
    });
  }
}
