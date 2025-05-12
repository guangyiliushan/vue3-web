<template>
    <div class="blog-discover">
        <div class="top-bar">
            <input v-model="searchQuery" placeholder="Search posts..." @input="handleSearchInput" />
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
            <main v-if="!isTimelineView" class="posts">
                <div class="post-list">
                    <div v-for="post in displayedPosts" :key="post.id" class="post-card"
                         v-intersection-observer="{ callback: () => loadPostContent(post) }">
                        <a @click="goToPost(post.id)">
                            <h3>{{ post.title }}</h3>
                            <p>{{ post.excerpt }}</p>
                            <p v-if="post.loaded">
                                <strong>Published:</strong> {{ post.createdAt }} |
                                <strong>Category:</strong> {{ post.category }} |
                                <strong>Views:</strong> {{ post.views }} |
                                <strong>Likes:</strong> {{ post.likes }}
                            </p>
                            <p v-else class="loading-placeholder">加载文章详情中...</p>
                            <button @click="goToPost(post.id)">Read More</button>
                        </a>
                    </div>
                </div>
                <div v-if="loading" class="loading">加载中...</div>
                <div v-if="!hasMore && displayedPosts.length > 0" class="end-message">已加载全部文章</div>
            </main>

            <!-- 时间线视图 -->
            <div v-else class="timeline-view">
                <div class="timeline">
                    <div v-for="post in displayedPosts" :key="post.id" class="timeline-item"
                         v-intersection-observer="{ callback: () => loadPostContent(post) }">
                        <div class="circle"></div>
                        <div class="item-content">
                            <h4>{{ post.title }}</h4>
                            <span v-if="post.loaded">{{ post.createdAt }}</span>
                            <span v-else class="loading-placeholder">加载中...</span>
                        </div>
                    </div>
                    <div v-if="loading" class="loading">加载中...</div>
                    <div v-if="!hasMore && displayedPosts.length > 0" class="end-message">已加载全部文章</div>
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
                    <p>Total Posts: {{ totalPosts }}</p>
                    <p>Total Tags: {{ tags.length }}</p>
                </aside>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LoadablePost, IntersectionObserverValue } from '@/stores/post';
import { usePostStore } from '@/stores/post';
import type { Directive, DirectiveBinding } from 'vue';

const router = useRouter();
const postStore = usePostStore();

// 查询参数
const searchQuery = ref('');
const showCategoryDropdown = ref(false);
const selectedCategory = ref('');
const isTimelineView = ref(false);

// 分页相关
const displayedPosts = ref<LoadablePost[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const hasMore = ref(true);
const totalPosts = ref(0);
const totalPages = computed(() => Math.ceil(totalPosts.value / pageSize.value));

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
const loadPostContent = async (post: LoadablePost) => {
    if (post.loaded) return;
    
    try {
        // 获取文章详细信息
        const fullPost = await postStore.getPostById(post.id);
        
        // 更新文章信息
        if (fullPost) {
            Object.assign(post, {
                ...fullPost,
                loaded: true
            });
        }
    } catch (error) {
        console.error(`Failed to load post ${post.id}:`, error);
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
    displayedPosts.value = [];
    hasMore.value = true;
    fetchPosts();
};

// 查询文章列表
const fetchPosts = async () => {
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

        const result = await postStore.fetchPosts(params);

        if (result.posts.length > 0) {
            displayedPosts.value = result.posts.map(post => ({
                ...post,
                loaded: false,
            }));
        } else {
            displayedPosts.value = [];
        }

        totalPosts.value = result.total;
        hasMore.value = currentPage.value < Math.ceil(result.total / pageSize.value);

        if (currentPage.value === 1) {
            categories.value = result.categories || [];
            tags.value = result.tags || [];
        }
    } catch (error) {
        console.error('Failed to fetch posts:', error);
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
const goToPost = (id: string) => {
    // 跳转前先尝试预加载文章内容
    postStore.getPostById(id).then(() => {
        router.push(`/blog/${id}`);
    });
};

// 切换页面
const changePage = (page: number) => {
    if (page < 1 || (page > totalPages.value && totalPages.value > 0)) return;
    currentPage.value = page;
    fetchPosts();
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 初始化
onMounted(() => {
    fetchPosts();
});

// 监听视图模式变化
watch(isTimelineView, () => {
    // 调整每页显示的数量
    pageSize.value = isTimelineView.value ? 20 : 10;
    resetSearch();
});
</script>

<style scoped>
.post-list {
    width: 100%;
}

.post-card {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    transition: transform 0.2s;
}

.post-card:hover {
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