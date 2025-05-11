import { defineStore } from 'pinia';
import http, { handleAxiosError } from "@/utils/http";

// 类型定义
export interface Article {
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

export interface LoadableArticle extends Article {
  loaded?: boolean;
}

export interface ArticleQueryParams {
  page?: number;
  pageSize?: number;
  lastId?: number | null;
  limit?: number;
  search?: string;
  category?: string;
  isTimeline?: boolean;
}

export interface ArticleQueryResult {
  articles: Article[];
  total: number;
  categories?: string[];
  tags?: string[];
}

export interface IntersectionObserverValue {
  callback: () => void;
}

// 创建文章存储
export const useArticleStore = defineStore('article', {
  state: () => ({
    articlesCache: new Map<number, Article>(),
    queryResultsCache: new Map<string, ArticleQueryResult>(),
    apiBaseUrl: '/api',
  }),
  
  actions: {
    async fetchArticles(params: ArticleQueryParams): Promise<ArticleQueryResult> {
      const cacheKey = this.generateCacheKey(params);
      const cachedResult = this.queryResultsCache.get(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      try {
        const response = await http.get(`${this.apiBaseUrl}/articles`, { params });
        const result: ArticleQueryResult = response.data;

        this.queryResultsCache.set(cacheKey, result);
        result.articles.forEach(article => this.articlesCache.set(article.id, article));
        return result;
      } catch (error) {
        handleAxiosError(error);
        return { articles: [], total: 0 };
      }
    },

    async getArticleById(id: number): Promise<Article | null> {
      const cachedArticle = this.articlesCache.get(id);
      if (cachedArticle && cachedArticle.content) return cachedArticle;

      try {
        const response = await http.get(`${this.apiBaseUrl}/articles/${id}`);
        const article: Article = response.data;
        this.articlesCache.set(id, article);
        return article;
      } catch (error) {
        handleAxiosError(error);
        return cachedArticle || null;
      }
    },

    generateCacheKey(params: ArticleQueryParams): string {
      return `${params.search || ''}_${params.category || ''}_${params.isTimeline ? 'timeline' : 'list'}`;
    },

    clearCache() {
      this.articlesCache.clear();
      this.queryResultsCache.clear();
    },
  },
});
