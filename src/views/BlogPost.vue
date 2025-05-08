<template>
  <div class="blog-post">
    <div class="content-wrapper">
      <div class="main-content">
        <h1>{{ post.title }}</h1>
        <div class="meta">{{ post.publishedAt }} | 分类: {{ post.category }} | 浏览量: {{ post.views }} | 字数: {{ wordCount }}</div>
        <div class="article-container" ref="articleContainer" @scroll="onScroll">
          <article v-html="renderedHtml"></article>
          <div class="comments">
            <!-- 在这里插入评论组件 -->
          </div>
        </div>
      </div>
      <aside class="sidebar">
        <div class="reading-progress">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          阅读进度：{{ Math.floor(progress) }}%
        </div>
        <div class="reading-time">预估阅读时间：{{ readingTime }} 分钟</div>
        <nav class="toc">
          <ul>
            <li v-for="item in toc" :key="item.id" :class="{ active: activeId === item.id }">
              <a href="#" @click.prevent="scrollTo(item.id)">{{ item.text }}</a>
            </li>
          </ul>
        </nav>
        <button @click="like">👍 点赞 {{ likes }}</button>
        <button @click="scrollToTop">⬆️ 回到顶部</button>
      </aside>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { useArticleStore, type Article } from '@/stores/article'

// 定义目录项接口
interface TocItem {
  id: string;
  text: string;
  level: number;
}

const route = useRoute()
const articleStore = useArticleStore()
const articleContainer = ref<HTMLElement | null>(null)
const post = reactive<Article>({
  id: 0,
  title: '',
  publishedAt: '',
  updatedAt: '',
  category: '',
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
  if (!articleContainer.value) return;
  
  const headings = articleContainer.value.querySelectorAll('h2, h3, h4')
  const list: TocItem[] = []
  headings.forEach((h: Element) => {
    if (!h.id) {
      h.id = h.textContent?.trim().toLowerCase().replace(/\s+/g, '-') || `heading-${Math.random().toString(36).substring(2, 9)}`
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
  if (!articleContainer.value) return;
  const el = articleContainer.value.querySelector('#' + id)
  if (el) {
    const containerTop = articleContainer.value.getBoundingClientRect().top
    const targetTop = el.getBoundingClientRect().top
    articleContainer.value.scrollTo({ top: targetTop - containerTop + articleContainer.value.scrollTop, behavior: 'smooth' })
  }
}

function scrollToTop(): void {
  if (!articleContainer.value) return;
  articleContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
}

function onScroll(): void {
  const el = articleContainer.value
  if (!el) return;
  progress.value = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
}

function like(): void {
  likes.value++
}

onMounted(async () => {
  const id = Number(route.params.id)
  let data = await articleStore.getArticleById(id)
  if (!data || !data.content) {
    data = await articleStore.getArticleById(id)
  }
  if (data) {
    Object.assign(post, data)
    likes.value = post.likes || 0
    const md = new MarkdownIt()
    renderedHtml.value = md.render(post.content || '')
    readingTime.value = generateReadingTime(post.content || '')
    wordCount.value = (post.content || '').trim().split(/\s+/).length
    await nextTick()
    buildTOC()
    
    if (!articleContainer.value) return;
    
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) activeId.value = e.target.id
      })
    }, { root: articleContainer.value, threshold: 0.1 })
    
    articleContainer.value.querySelectorAll('h2, h3, h4').forEach((h: Element) => io.observe(h))
  }
})
</script>