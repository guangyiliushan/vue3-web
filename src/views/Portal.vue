<template>
    <div class="portal-container">
        <div class="portal-title">
            <span>{{ title }}</span>
        </div>
        <div class="portal-quick">
            <button
                class="btn btn-primary"
                @click="openRandomLink"
            >
                快速传送
            </button>
        </div>
        <div class="portal-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                v-for="link in links"
                :key="link.url"
                class="card bg-base-100 shadow-xl"
            >
                <div class="card-body flex flex-row items-center gap-4">
                    <div class="portal-icon">
                        <span class="inline-block w-8 h-8 bg-primary rounded-full"></span>
                    </div>
                    <div>
                        <h2 class="card-title">
                            <a
                                :href="link.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="link link-primary"
                            >
                                {{ link.name }}
                            </a>
                        </h2>
                        <p v-if="link.desc" class="text-sm text-base-content/60">{{ link.desc }}</p>
                    </div>
                </div>
            </div>
            <!-- 朋友链接 -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Portal Links')
const links = ref([
    {
        name: 'ForeverBlog',
        url: 'https://www.foreverblog.cn/go.html',
        desc: '虫洞'
    },
    {
        name: 'Travellings',
        url: 'https://travellings.link/',
        desc: '开往-友链接力'
    },
    {
        name: 'BlogsClub',
        url: 'https://www.blogsclub.org/go',
        desc: '博客俱乐部'
    },
    {
        name: 'Blog Search',
        url: 'https://boke.lu/sj/',
        desc: '博客录'
    },
    {
        name: 'Travel.Moe',
        url: 'https://travel.moe/',
        desc: '异次元之旅'
    },
    {
        name: 'N3V Travel',
        url: 'https://travel.n3v.cn/',
        desc: '星链'
    }
])

function openRandomLink() {
    const allLinks = links.value
    if (allLinks.length === 0) return
    const randomLink = allLinks[Math.floor(Math.random() * allLinks.length)]
    window.open(randomLink.url, '_blank')
}
</script>

<style scoped>
.portal-container {
    padding: 2rem;
}
.portal-title {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: bold;
}
</style>

        
