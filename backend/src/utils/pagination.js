/**
 * Pagination Helper
 * Standardizes pagination logic across the application
 */

/**
 * Parse pagination params from query
 * Default: page 1, limit 10, max limit 100
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 10, 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create pagination response object
 */
export const createPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Format paginated query results
 */
export const formatPaginatedResponse = (items, total, { page, limit }) => {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

export default { parsePagination, createPaginationResponse, formatPaginatedResponse };
