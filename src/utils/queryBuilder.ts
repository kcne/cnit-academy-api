import { Prisma } from "@prisma/client";

// Generic types for filtering and sorting
export type SortOrder = Prisma.SortOrder;

export interface SortOption {
  field: string;
  order: SortOrder;
}

export interface FilterOption {
  field: string;
  value: any;
  operator: "equals" | "contains" | "gt" | "lt" | "gte" | "lte";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface QueryOptions<T extends string> {
  pagination: PaginationOptions;
  sort?: {
    field: T;
    order: SortOrder;
  };
  filters?: FilterOption[];
}

// Generic function to build Prisma where clause
export function buildWhereClause(filters: FilterOption[] = []) {
  const whereClause: Record<string, any> = {};
  filters.forEach((filter) => {
    switch (filter.operator) {
      case "contains":
        whereClause[filter.field] = { contains: filter.value };
        break;
      case "gt":
        whereClause[filter.field] = { gt: filter.value };
        break;
      case "lt":
        whereClause[filter.field] = { lt: filter.value };
        break;
      case "gte":
        whereClause[filter.field] = { gte: filter.value };
        break;
      case "lte":
        whereClause[filter.field] = { lte: filter.value };
        break;
      default:
        whereClause[filter.field] = filter.value;
    }
  });

  return whereClause;
}

// Generic pagination result interface
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Function to create paginated response
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / options.limit);
  return {
    data,
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
      hasNextPage: options.page < totalPages,
      hasPrevPage: options.page > 1,
    },
  };
}
