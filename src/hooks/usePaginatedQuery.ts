import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface PaginatedResponse<T> {
  data: T[];
  nextOffset?: number;
  hasMore: boolean;
  total?: number;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface UsePaginatedQueryOptions<T>
  extends Omit<UseInfiniteQueryOptions<PaginatedResponse<T>>, 'queryFn' | 'getNextPageParam'> {
  queryFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  limit?: number;
}

export const usePaginatedQuery = <T>({
  queryFn,
  limit = 20,
  ...options
}: UsePaginatedQueryOptions<T>) => {
  const query = useInfiniteQuery({
    ...options,
    queryFn: ({ pageParam = 0 }) => queryFn({ limit, offset: pageParam as number }),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.nextOffset ?? pages.length * limit;
    },
    initialPageParam: 0,
  });

  // Flatten all pages into a single array
  const data = useMemo(() => {
    return (query.data as any)?.pages?.flatMap((page: any) => page.data) ?? [];
  }, [query.data]);

  // Calculate total items loaded
  const totalLoaded = data.length;

  // Get total count from first page if available
  const totalCount = (query.data as any)?.pages?.[0]?.total;

  return {
    ...query,
    data,
    totalLoaded,
    totalCount,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
};

// Utility function for creating paginated responses
export const createPaginatedResponse = <T>(
  data: T[],
  limit: number,
  offset: number,
  total?: number
): PaginatedResponse<T> => {
  const hasMore = data.length === limit && (total === undefined || offset + limit < total);
  const nextOffset = hasMore ? offset + limit : undefined;

  return {
    data,
    nextOffset,
    hasMore,
    total,
  };
};
