import { defineStore } from 'pinia';
import http, { handleAxiosError } from "@/utils/http";

// 类型定义
export interface Post {
  id: number;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  views: number;
  likes: number;
  content?: string;
  tags?: string[];
}

export interface LoadablePost extends Post {
  loaded?: boolean;
}

export interface PostQueryParams {
  page?: number;
  pageSize?: number;
  lastId?: number | null;
  limit?: number;
  search?: string;
  category?: string;
  isTimeline?: boolean;
}

export interface PostQueryResult {
  posts: Post[];
  total: number;
  categories?: string[];
  tags?: string[];
}

export interface IntersectionObserverValue {
  callback: () => void;
}

// 创建文章存储
export const usePostStore = defineStore('post', {
  state: () => ({
    postsCache: new Map<number, Post>(),
    queryResultsCache: new Map<string, PostQueryResult>(),
  }),
  
  actions: {
    async fetchPosts(params: PostQueryParams): Promise<PostQueryResult> {
      const cacheKey = this.generateCacheKey(params);
      const cachedResult = this.queryResultsCache.get(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      try {
        const response = await http.get(`/post`, { params });
        const result: PostQueryResult = response.data;

        this.queryResultsCache.set(cacheKey, result);
        result.posts.forEach(post => this.postsCache.set(post.id, post));
        return result;
      } catch (error) {
        handleAxiosError(error);
      }
    },

    async getPostById(id: number): Promise<Post | null> {
      const cachedPost = this.postsCache.get(id);
      if (cachedPost && cachedPost.content) return cachedPost;

      try {
        const response = await http.get(`/post/${id}`);
        const post: Post = response.data;
        this.postsCache.set(id, post);
        return post;
      } catch (error) {
        handleAxiosError(error);
      }
    },

    generateCacheKey(params: PostQueryParams): string {
      return `${params.search || ''}_${params.category || ''}_${params.isTimeline ? 'timeline' : 'list'}`;
    },

    clearCache() {
      this.postsCache.clear();
      this.queryResultsCache.clear();
    },
  },
});
