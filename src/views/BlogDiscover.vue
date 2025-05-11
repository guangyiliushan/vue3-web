<template>
    <div class="blog-discover">
        <div class="top-bar">
            <input v-model="searchQuery" placeholder="Search articles..." @input="handleSearchInput" />
        </div>
        <div class="content">
            <div>
                <div>
                    <button @click="toggleTimelineView">
                        {{ isTimelineView ? 'List View' : 'TimeLine' }}
                    </button>
                    <button @click="toggleCategoryDropdown">Categories</button>
                    <div v-if="showCategoryDropdown" class="dropdown">
                        <ul>
                            <li v-for="category in categories" :key="category" @click="selectCategory(category)">
                                {{ category }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 列表视图 -->
            <main v-if="!isTimelineView" class="articles">
                <div class="article-list">
                    <div v-for="article in displayedArticles" :key="article.id" class="article-card"
                         v-intersection-observer="{ callback: () => loadArticleContent(article) }">
                        <a @click="goToArticle(article.id)">
                            <h3>{{ article.title }}</h3>
                            <p>{{ article.excerpt }}</p>
                            <p v-if="article.loaded">
                                <strong>Published:</strong> {{ article.publishedAt }} |
                                <strong>Category:</strong> {{ article.category }} |
                                <strong>Views:</strong> {{ article.views }} |
                                <strong>Likes:</strong> {{ article.likes }}
                            </p>
                            <p v-else class="loading-placeholder">加载文章详情中...</p>
                            <button @click="goToArticle(article.id)">Read More</button>
                        </a>
                    </div>
                </div>
                <div v-if="loading" class="loading">加载中...</div>
                <div v-if="!hasMore && displayedArticles.length > 0" class="end-message">已加载全部文章</div>
            </main>

            <!-- 时间线视图 -->
            <div v-else class="timeline-view">
                <div class="timeline">
                    <div v-for="article in displayedArticles" :key="article.id" class="timeline-item"
                         v-intersection-observer="{ callback: () => loadArticleContent(article) }">
                        <div class="circle"></div>
                        <div class="item-content">
                            <h4>{{ article.title }}</h4>
                            <span v-if="article.loaded">{{ article.publishedAt }}</span>
                            <span v-else class="loading-placeholder">加载中...</span>
                        </div>
                    </div>
                    <div v-if="loading" class="loading">加载中...</div>
                    <div v-if="!hasMore && displayedArticles.length > 0" class="end-message">已加载全部文章</div>
                </div>
            </div>

            <!-- 分页控制器 -->
            <div class="pagination-controls">
                <button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">上一页</button>
                <span>{{ currentPage }} / {{ totalPages || 1 }}</span>
                <button :disabled="currentPage >= totalPages || !hasMore" @click="changePage(currentPage + 1)">下一页</button>
            </div>

            <div>
                <aside class="sidebar">
                    <h3>Statistics</h3>
                    <p>Total Articles: {{ totalArticles }}</p>
                    <p>Total Tags: {{ tags.length }}</p>
                </aside>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LoadableArticle, IntersectionObserverValue } from '@/stores/article';
import { useArticleStore } from '@/stores/article';
import type { Directive, DirectiveBinding } from 'vue';

const router = useRouter();
const articleStore = useArticleStore();

// 查询参数
const searchQuery = ref('');
const showCategoryDropdown = ref(false);
const selectedCategory = ref('');
const isTimelineView = ref(false);

// 分页相关
const displayedArticles = ref<LoadableArticle[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const hasMore = ref(true);
const totalArticles = ref(0);
const totalPages = computed(() => Math.ceil(totalArticles.value / pageSize.value));

// 分类和标签
const categories = ref<string[]>([]);
const tags = ref<string[]>([]);

// 交叉观察器指令，用于检测元素是否进入视口
const vIntersectionObserver: Directive<HTMLElement, IntersectionObserverValue> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<IntersectionObserverValue>) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                binding.value.callback();
                observer.unobserve(el);
            }
        }, {
            threshold: 0.1
        });
        observer.observe(el);
    }
};

// 加载文章内容
const loadArticleContent = async (article: LoadableArticle) => {
    if (article.loaded) return;
    
    try {
        // 获取文章详细信息
        const fullArticle = await articleStore.getArticleById(article.id);
        
        // 更新文章信息
        if (fullArticle) {
            Object.assign(article, {
                ...fullArticle,
                loaded: true
            });
        }
    } catch (error) {
        console.error(`Failed to load article ${article.id}:`, error);
    }
};

// 防抖处理搜索输入
let searchTimeout: number | null = null;
const handleSearchInput = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = window.setTimeout(() => {
        resetSearch();
    }, 300);
};

// 重置搜索
const resetSearch = () => {
    currentPage.value = 1;
    displayedArticles.value = [];
    hasMore.value = true;
    fetchArticles();
};

// 查询文章列表
const fetchArticles = async () => {
    if (loading.value) return;

    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            search: searchQuery.value,
            category: selectedCategory.value,
            isTimeline: isTimelineView.value,
        };

        const result = await articleStore.fetchArticles(params);

        if (result.articles.length > 0) {
            displayedArticles.value = result.articles.map(article => ({
                ...article,
                loaded: false,
            }));
        } else {
            displayedArticles.value = [];
        }

        totalArticles.value = result.total;
        hasMore.value = currentPage.value < Math.ceil(result.total / pageSize.value);

        if (currentPage.value === 1) {
            categories.value = result.categories || [];
            tags.value = result.tags || [];
        }
    } catch (error) {
        console.error('Failed to fetch articles:', error);
    } finally {
        loading.value = false;
    }
};

// 切换分类下拉菜单
const toggleCategoryDropdown = () => {
    showCategoryDropdown.value = !showCategoryDropdown.value;
};

// 切换视图模式
const toggleTimelineView = () => {
    isTimelineView.value = !isTimelineView.value;
    resetSearch(); // 切换视图时重新查询
};

// 选择分类
const selectCategory = (category: string) => {
    selectedCategory.value = selectedCategory.value === category ? '' : category;
    resetSearch();
    showCategoryDropdown.value = false;
};

// 跳转到文章详情页
const goToArticle = (id: number) => {
    // 跳转前先尝试预加载文章内容
    articleStore.getArticleById(id).then(() => {
        router.push(`/blog/${id}`);
    });
};

// 切换页面
const changePage = (page: number) => {
    if (page < 1 || (page > totalPages.value && totalPages.value > 0)) return;
    currentPage.value = page;
    fetchArticles();
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 初始化
onMounted(() => {
    fetchArticles();
});

// 监听视图模式变化
watch(isTimelineView, () => {
    // 调整每页显示的数量
    pageSize.value = isTimelineView.value ? 20 : 10;
    resetSearch();
});
</script>

<style scoped>
.article-list {
    width: 100%;
}

.article-card {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    transition: transform 0.2s;
}

.article-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.timeline-view {
    padding: 20px;
}
.timeline {
    position: relative;
    margin-left: 20px;
    border-left: 2px solid #ccc;
}
.timeline-item {
    position: relative;
    padding: 10px 0 10px 20px;
    margin-bottom: 15px;
}
.timeline-item .circle {
    position: absolute;
    left: -11px;
    top: 12px;
    width: 10px;
    height: 10px;
    background-color: #42b983;
    border-radius: 50%;
}
.timeline-item .item-content h4 {
    margin: 0;
    font-size: 16px;
}
.timeline-item .item-content span {
    color: #888;
    font-size: 14px;
}

.loading {
    text-align: center;
    padding: 1rem;
    margin-top: 10px;
}

.end-message {
    text-align: center;
    padding: 1rem;
    color: #888;
    margin-top: 10px;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    margin: 20px 0;
    gap: 15px;
    align-items: center;
}

.pagination-controls button {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-controls button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.loading-placeholder {
    color: #888;
    font-style: italic;
    height: 20px;
}
</style>