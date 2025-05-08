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
    pageCache: new Map<string, Map<number, Article[]>>(),
    apiBaseUrl: '/api',
  }),
  
  actions: {
    async fetchArticlesByPage(params: ArticleQueryParams): Promise<ArticleQueryResult> {
      const cacheKey = this.generateCacheKey(params);
      const cachedPage = this.pageCache.get(cacheKey)?.get(params.page || 1);

      if (cachedPage) {
        const cachedResult = this.queryResultsCache.get(cacheKey);
        if (cachedResult) {
          return { ...cachedResult, articles: cachedPage };
        }
      }

      try {
        const response = await http.get(`${this.apiBaseUrl}/articles/page`, { params });
        const result: ArticleQueryResult = response.data;

        this.updateCache(cacheKey, params.page || 1, result);
        return result;
      } catch (error) {
        handleAxiosError(error);
        return { articles: [], total: 0 };
      }
    },

    async fetchArticles(params: ArticleQueryParams): Promise<ArticleQueryResult> {
      const pageParams = {
        page: 1,
        pageSize: params.limit || 10,
        search: params.search,
        category: params.category,
        isTimeline: params.isTimeline,
      };

      if (params.lastId) {
        pageParams.page = Math.max(1, Math.ceil((params.lastId || 0) / (pageParams.pageSize || 10)));
      }

      return this.fetchArticlesByPage(pageParams);
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

    async fetchTimelineArticles(params: ArticleQueryParams): Promise<ArticleQueryResult> {
      return this.fetchArticlesByPage({ ...params, isTimeline: true });
    },

    generateCacheKey(params: ArticleQueryParams): string {
      return `${params.search || ''}_${params.category || ''}_${params.isTimeline ? 'timeline' : 'list'}`;
    },

    updateCache(cacheKey: string, page: number, result: ArticleQueryResult) {
      if (!this.queryResultsCache.has(cacheKey) || page === 1) {
        this.queryResultsCache.set(cacheKey, { ...result, articles: [] });
      }

      if (!this.pageCache.has(cacheKey)) {
        this.pageCache.set(cacheKey, new Map());
      }

      this.pageCache.get(cacheKey)?.set(page, result.articles);

      result.articles.forEach(article => {
        const existingArticle = this.articlesCache.get(article.id);
        if (existingArticle?.content && !article.content) {
          article.content = existingArticle.content;
        }
        this.articlesCache.set(article.id, article);
      });
    },

    clearCache() {
      this.articlesCache.clear();
      this.queryResultsCache.clear();
      this.pageCache.clear();
    },
  },
});
