<template>
  <div class="blog-post container mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 内容区域 -->
      <div class="lg:col-span-3">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h1 class="text-2xl font-bold">{{ post.title }}</h1>
            <div class="meta text-sm opacity-70">
              {{ new Date(post.createdAt).toLocaleString() }} | 分类: {{ post.category?.name }} | 浏览量: {{ post.views }} | 字数: {{ wordCount }}
            </div>
            <div class="divider"></div>
            <div class="post-container text-left h-[63vh] overflow-y-auto prose prose-lg max-w-none" ref="postContainer" @scroll="onScroll">
              <article v-html="renderedHtml"></article>
              <div class="comments mt-8">
                <div class="divider">评论区</div>
                <!-- 在这里插入评论组件 -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <aside class="sidebar lg:col-span-1 margin-top-8">
        <div class="card bg-base-100 shadow-xl sticky top-4">
          <div class="card-body">
            <!-- 阅读进度 -->
            <div class="mb-4">
              <div class="text-sm font-medium mb-2">阅读进度：{{ Math.floor(progress) }}%</div>
              <progress class="progress progress-primary w-full" :value="progress" max="100"></progress>
            </div>
            
            <!-- 阅读时间 -->
            <div class="mb-4 flex items-center">
              <span class="text-sm font-medium">预估阅读时间：{{ readingTime }} 分钟</span>
            </div>

            <!-- 目录 -->
            <div class="mb-4">
              <h3 class="text-lg font-medium mb-2">目录</h3>
              <div class="divider my-1"></div>
              <nav class="toc overflow-y-auto max-h-[40vh]">
                <ul class="menu menu-sm">
                  <li v-for="item in toc" :key="item.id" :class="{ 'bordered': activeId === item.id }">
                    <a 
                      :href="`#${item.id}`" 
                      @click.prevent="scrollTo(item.id)"
                      :class="{'pl-2': item.level === 1, 'pl-4': item.level === 2, 'pl-6': item.level === 3}"
                    >
                      {{ item.text }}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- 点赞与回到顶部按钮 -->
            <div class="flex flex-col gap-2">
              <button class="btn btn-primary" @click="like">👍 点赞 {{ likes }}</button>
              <button class="btn btn-outline" @click="scrollToTop">⬆️ 回到顶部</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { katex } from "@mdit/plugin-katex";
import { attrs } from "@mdit/plugin-attrs";
import { usePostStore, type Post } from '@/stores/post'

// 定义目录项接口
interface TocItem {
  id: string;
  text: string;
  level: number;
}

const route = useRoute()
const postStore = usePostStore()
const postContainer = ref<HTMLElement | null>(null)
const post = reactive<Post>({
  id: '',
  title: '',
  createdAt: '',
  updatedAt: '',
  category: { id: '', name: '' },
  views: 0,
  likes: 0,
  excerpt: '',
  content: '',
  tags: [],
})

const wordCount = ref<number>(0)
const renderedHtml = ref<string>('')
const toc = ref<TocItem[]>([])
const activeId = ref<string>('')
const progress = ref<number>(0)
const likes = ref<number>(0)
const readingTime = ref<number>(0)

function generateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

function buildTOC(): void {
  if (!postContainer.value) return;
  
  const headings = postContainer.value.querySelectorAll('h1, h2, h3')
  const list: TocItem[] = []
  headings.forEach((h: Element, index: number) => {
    if (!h.id) {
      let id = h.textContent?.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u4e00-\u9fa5-]/g, '')
        .replace(/^[\d-]+/, '')
        || `heading-${index}`
      
      if (!id || /^[\d-]/.test(id)) {
        id = `heading-${index}`
      }
      
      h.id = id
    }
    list.push({ 
      id: h.id, 
      text: h.textContent || '', 
      level: parseInt(h.tagName[1], 10) 
    })
  })
  toc.value = list
}

function scrollTo(id: string): void {
  if (!postContainer.value) return;
  
  // 添加ID验证，确保是有效的CSS选择器
  if (!id || /^[\d-]/.test(id)) {
    console.warn('Invalid ID for scrollTo:', id)
    return
  }
  
  try {
    const el = postContainer.value.querySelector(`#${CSS.escape(id)}`)
    if (el) {
      // 计算目标元素相对于容器的位置
      const containerRect = postContainer.value.getBoundingClientRect()
      const targetRect = el.getBoundingClientRect()
      const scrollTop = postContainer.value.scrollTop
      const targetOffsetTop = targetRect.top - containerRect.top + scrollTop - 20 // 添加20px的偏移量
      
      postContainer.value.scrollTo({ 
        top: targetOffsetTop, 
        behavior: 'smooth' 
      })
    }
  } catch (error) {
    console.error('Error in scrollTo:', error)
  }
}

function scrollToTop(): void {
  if (!postContainer.value) return;
  postContainer.value.scrollTo({ 
    top: 0, 
    behavior: 'smooth' 
  })
}

function onScroll(): void {
  const el = postContainer.value
  if (!el) return;
  
  // 计算阅读进度
  const scrollHeight = el.scrollHeight - el.clientHeight
  if (scrollHeight > 0) {
    progress.value = Math.min((el.scrollTop / scrollHeight) * 100, 100)
  }
  
  // 更新当前激活的标题
  updateActiveHeading()
}

function updateActiveHeading(): void {
  if (!postContainer.value) return;
  
  const headings = postContainer.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const containerRect = postContainer.value.getBoundingClientRect()
  let activeHeading = ''
  
  headings.forEach((heading: Element) => {
    const rect = heading.getBoundingClientRect()
    const relativeTop = rect.top - containerRect.top
    
    // 如果标题在视口上方或刚好在视口顶部附近，则认为是当前激活的标题
    if (relativeTop <= 100) {
      activeHeading = heading.id
    }
  })
  
  if (activeHeading) {
    activeId.value = activeHeading
  }
}

function like(): void {
  likes.value++
}

const fetchPostById = async (id: string) => {
  const data = await postStore.getPostById(id);
  if (data) {
    Object.assign(post, data);
    likes.value = post.likes || 0;
    
    // 配置Markdown渲染
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
    .use(katex)
    .use(attrs);
    
    // 添加类到表格
    md.renderer.rules.table_open = () => '<table class="table table-zebra w-full">\n';
    
    md.renderer.rules.fence = (tokens, idx) => {
      const token = tokens[idx];
      const info = token.info ? token.info.trim() : '';
      const langName = info ? info.split(/\s+/g)[0] : 'text';
      const langDisplay = langName.toUpperCase();

      // 使用 @mdit/plugin-attrs 的属性处理
      const aIndex = token.attrIndex('class');
      let codeClass = `mockup-code bg-base-200 text-base-content overflow-x-auto language-${langName}`;
      
      if (aIndex < 0) {
        token.attrPush(['class', codeClass]);
      } else {
        const existingClass = token.attrGet('class') || '';
        token.attrSet('class', `${existingClass} ${codeClass}`.trim());
      }
      
      // 添加数据属性用于语言标识
      if (langName) {
        token.attrPush(['data-lang', langName]);
        token.attrPush(['data-ext', langName]);
        token.attrPush(['data-title', langDisplay]);
      }
      
      // 获取代码内容并转义HTML
      const code = token.content;
      const escapedCode = md.utils.escapeHtml(code);
      
      // 使用 DaisyUI 5.0.43 的样式返回自定义HTML结构
      return `
        <div class="code-block-wrapper mb-4">
          <div class="bg-base-300 border border-base-300 rounded-lg overflow-hidden">
            <div class="flex justify-between items-center px-4 py-2 bg-base-200 border-b border-base-300">
              <span class="text-sm font-mono text-base-content opacity-70">${langDisplay}</span>
              <button type="button" class="btn btn-xs btn-ghost copy-code-btn" onclick="copyCode(this)" aria-label="复制代码" title="复制代码">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="copy-text ml-1">复制</span>
              </button>
            </div>
            <pre class="p-4 overflow-x-auto text-sm leading-6" data-prefix="$"><code class="language-${langName} text-base-content">${escapedCode}</code></pre>
          </div>
        </div>
      `;
    };
    renderedHtml.value = md.render(post.content || '');
    readingTime.value = generateReadingTime(post.content || '');
    wordCount.value = (post.content || '').trim().split(/\s+/).length;
    await nextTick();
    addCopyFunctionality();
    buildTOC();
  }
};

// 添加复制代码功能
function addCopyFunctionality() {
  // 添加全局复制函数
  (window as any).copyCode = async (button: HTMLButtonElement) => {
    const codeBlock = button.parentElement?.querySelector('code');
    if (codeBlock) {
      const text = codeBlock.textContent || '';
      try {
        await navigator.clipboard.writeText(text);
        const copyText = button.querySelector('.copy-text');
        if (copyText) {
          copyText.textContent = '已复制';
          setTimeout(() => {
            copyText.textContent = '复制';
          }, 2000);
        }
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };
}

onMounted(async () => {
  const id = String(route.params.id)
  await fetchPostById(id)
  
  // 等待DOM更新完成后再设置观察器
  await nextTick()
  
  if (!postContainer.value) return;
  
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) activeId.value = e.target.id
    })
  }, { root: postContainer.value, threshold: 0.1 })
  
  postContainer.value.querySelectorAll('h1, h2, h3').forEach((h: Element) => io.observe(h))
})
</script>