<template>
  <div class="bg-base-200">
    <div class="container mx-auto p-6">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
      </div>
      <hr class="my-6 border-t border-base-300" />
      <div class="flex justify-center">
        <div class="card bg-base-100 shadow-xl w-full max-w-md">
          <div class="card-body items-center text-center">
            <h2 class="card-title text-xl">Visit Count</h2>
            <figure>
              <img
                :src="`https://count.getloli.com/@guang-visited?name=guang-visited&theme=gelbooru&padding=9&offset=0&align=top&scale=1&pixelated=1&darkmode=0&num=${visitCount}`"
                alt="Visit Count"
              />
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visitCount = ref(1)

onMounted(() => {
  setTimeout(() => {
    visitCount.value = 12345789
  }, 1000)
})
</script>