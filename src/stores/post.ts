import { defineStore } from 'pinia';
import http, { handleAxiosError } from "@/utils/http";

export interface Post {
  id: string;
  title: string;
  excerpt?: string;
  createdAt: string;
  updatedAt?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  views?: number;
  likes?: number;
  content?: string;
  tags?: { id: string; name: string }[];
}

export interface LoadablePost extends Post {
  loaded?: boolean;
}

export interface PostQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  timeline?: boolean;
  cursor?: string;
  direction?: 'next' | 'prev';
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor?: { createdAt: string; id: string } | null;
  prevCursor?: { createdAt: string; id: string } | null;
}

export interface PostQueryResult {
  posts: Post[];
  pagination: Pagination;
}

export interface IntersectionObserverValue {
  callback: () => void;
}
export interface CacheEntry {
  timestamp: number;          // 缓存时间戳
  result: PostQueryResult;    // 缓存的查询结果
  timeRange?: {               // 该查询覆盖的时间范围
    start: string;            // 最早的文章创建时间
    end: string;              // 最新的文章创建时间
  };
  postIds: Set<string>;       // 该查询包含的文章ID集合
}

// 创建文章存储
export const usePostStore = defineStore('post', {
  state: () => ({
    postsCache: new Map<string, Post>(),
    categories: [] as { id: string; name: string }[],
    tags: [] as { id: string; name: string }[],
    queryResultsCache: new Map<string, CacheEntry>(),
    updatedPostIds: new Set<string>(), 
    lastTimelineCheck: 0,
    pagination: { currentPage: 1, totalPages: 0, totalCount: 0, hasNextPage: false, hasPrevPage: false } as Pagination,
  }),

  actions: {
    async fetchPosts(params: PostQueryParams): Promise<PostQueryResult> {
      const cacheKey = this.generateCacheKey(params);
      try {
        const response = await http.get(`/posts`, { params });
        const result: PostQueryResult = response.data.data; 

        const postIds = new Set(result.posts.map(post => post.id));
        let timeRange;
        
        if (result.posts.length > 0) {
          const dates = result.posts.map(post => new Date(post.createdAt).getTime());
          timeRange = {
            start: result.posts[result.posts.length - 1].createdAt,
            end: result.posts[0].createdAt
          };
        }

        this.queryResultsCache.set(cacheKey, {
          timestamp: Date.now(),
          result,
          timeRange,
          postIds
        });

        result.posts.forEach(post => this.postsCache.set(post.id, post));
        this.pagination = {
          ...this.pagination,
          ...result.pagination,
          prevCursor: result.pagination.prevCursor,
          nextCursor: result.pagination.nextCursor,
        };
        return result;
      } catch (error) {
        handleAxiosError(error);
      }
    },
    async getCategories(forceRefresh = false): Promise<{ id: string; name: string }[]> {
      if (!forceRefresh && this.categories.length > 0) {
        return this.categories;
      }

      try {
        const response = await http.get(`/posts/categories`);
        this.categories = response.data.data; 
        return this.categories;
      } catch (error) {
        handleAxiosError(error);
      }
    },
    async getTags(): Promise<void> {
      try {
        const response = await http.get(`/posts/tags`);
        this.tags = response.data.data; 
      }
      catch (error) {
        handleAxiosError(error);
      }
    },

    async getPostById(id: string): Promise<Post | null> {
      const cachedPost = this.postsCache.get(id);
      if (cachedPost && cachedPost.content) return cachedPost;

      try {
        const response = await http.get(`/posts/${id}`);
        const post: Post = response.data.data; 
        this.postsCache.set(id, post);
        return post;
      } catch (error) {
        handleAxiosError(error);
      }
    },

    generateCacheKey(params: PostQueryParams): string {
      return `${params.search || ''}_${params.category || ''}_${params.timeline ? 'timeline' : 'list'}`;
    },

    clearCache() {
      this.postsCache.clear();
      this.queryResultsCache.clear();
      this.updatedPostIds.clear();
      this.pagination = { currentPage: 1, totalPages: 0, totalCount: 0, hasNextPage: false, hasPrevPage: false } as Pagination;
    },
    
    setCurrentPage(page: number) {
      this.pagination.currentPage = page;
    },
  },
});
