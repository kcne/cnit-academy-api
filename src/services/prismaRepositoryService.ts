import {
  QueryOptions,
  buildWhereClause,
  createPaginatedResponse,
  PaginatedResult,
} from "../utils/queryBuilder";
import createHttpError from "http-errors";

export class PrismaRepositoryService<T, K extends string> {
  protected model: any;
  protected select: any | undefined;

  constructor(model: any, select?: any) {
    this.model = model;
    this.select = select;
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
        select: this.select,
      }),
      this.model.count({ where }),
    ]);

    return createPaginatedResponse(items, total, pagination);
  }

  async findItem(id: number): Promise<T> {
    const model = await this.model.findUnique({
      where: { id },
      select: this.select,
    });
    if (!model) {
      throw createHttpError(404, "Not found");
    }

    return model;
  }

  async createItem(data: any): Promise<T> {
    return await this.model.create({ data, select: this.select });
  }

  async updateItem(id: number, data: any, userId?: number): Promise<T> {
    const model = await this.model.findUnique({
      where: { id },
    });
    if (!model) {
      throw createHttpError(404, "Not found");
    }
    if (userId ? userId !== model.userId : false) {
      throw createHttpError(403, "Only admins can edit foreign items");
    }

    return await this.model.update({
      where: { id },
      data,
      select: this.select,
    });
  }

  async deleteItem(id: number, userId?: number): Promise<T> {
    const model = await this.model.findUnique({
      where: { id },
    });
    if (!model) {
      throw createHttpError(404, "Not found");
    }
    if (userId ? userId !== model.userId : false) {
      throw createHttpError(403, "Only admins can edit foreign items");
    }

    return await this.model.delete({
      where: { id },
      select: this.select,
    });
  }
}
