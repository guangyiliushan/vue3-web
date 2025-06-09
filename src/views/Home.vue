<template>
  <div class="h-full">
    <section class="hero h-full">
      <div class="hero-content flex-col lg:flex-row-reverse gap-x-64">
        <!-- Right: Avatar -->
        <div class="avatar">
          <div class="w-48 lg:w-80 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img :src="avatarImageUrl" alt="Avatar" />
          </div>
        </div>

        <!-- Left: Content -->
        <div class="text-center lg:text-left max-w-md">
          <h1 class="text-5xl font-bold">
            {{ mainTitle }}
          </h1>
          <transition name="fade-up">
            <p v-if="mainDescription" class="py-6 text-lg opacity-70">
              {{ mainDescription }}
            </p>
          </transition>

          <!-- 社交媒体图标 -->
          <div class="flex gap-4 justify-center lg:justify-start mt-6">
            <template v-for="(url, platform) in socialLinks" :key="platform">
              <a v-if="isSupportedSocialPlatform(platform as string)" :href="url" target="_blank"
                class="btn btn-circle btn-outline btn-primary hover:btn-primary">
                <Icon :icon="getSocialPlatformIcon(platform as string)" class="text-xl" />
              </a>
            </template>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <div class="chat chat-start max-w-md">
          <div class="chat-bubble chat-bubble-primary">
            {{ inspirationalQuote }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import AvatarPath  from '@/assets/die.gif'

// 主标题和描述
const mainTitle = ref("Hi, I'm Guang👋.")
const mainDescription = ref('A </> Student.')

// 头像图片URL
const avatarImageUrl = ref(AvatarPath)

// 励志名言
const inspirationalQuote = ref('当第一颗卫星飞向大气层外，我们便以为自己终有一日会征服宇宙。')

// 社交媒体链接
const socialLinks = ref({
  github: 'https://github.com/guangyiliushan',
  bilibili: 'https://space.bilibili.com/316971730',
  email: 'example@example.com'
})

// 支持的社交平台列表
const supportedSocialPlatforms = ['github', 'twitter', 'bilibili', 'email', 'facebook', 'instagram']

// 检查是否支持该社交平台
const isSupportedSocialPlatform = (platform: string): boolean => {
  if (!platform || typeof platform !== 'string') {
    return false
  }
  return supportedSocialPlatforms.includes(platform.toLowerCase())
}

// 获取社交平台图标名称
const getSocialPlatformIcon = (platform: string): string => {
  if (!platform || typeof platform !== 'string') {
    return 'mingcute:link-line'
  }

  const iconMap: Record<string, string> = {
    github: 'mingcute:github-line',
    twitter: 'mingcute:twitter-line',
    linkedin: 'mingcute:linkedin-line',
    email: 'mingcute:mail-line',
    facebook: 'mingcute:facebook-line',
    instagram: 'mingcute:instagram-line',
    bilibili: 'mingcute:tv-2-line',
  }

  return iconMap[platform.toLowerCase()] || 'mingcute:link-line'
}
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 添加一些自定义动画 */
.hero-content>div {
  animation: fadeInUp 0.8s ease-out;
}

.hero-content>div:nth-child(2) {
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>