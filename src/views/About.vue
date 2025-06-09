<template>
  <div class="p-6 max-w-prose mx-auto text-center">
    <section class="mb-8">
      <h2 class="text-2xl font-bold mb-4">About Me</h2>
      <p class="text-base-content">
        {{ aboutMe }}
      </p>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Project Overview</h2>
      <p class="text-base-content">
        {{ projectOverview }}
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4">Projects on GitHub</h2>
      <ul class="list-disc pl-5 text-base-content">
        <li v-for="project in projects" :key="project.url">
          <a :href="project.url" target="_blank" rel="noopener noreferrer"
             class="link link-primary">{{ project.name }} - {{ project.description }}</a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const aboutMe = ref(
  `Hi, I'm a student with a love for building modern web applications.
I enjoy working with sveltekit and exploring new technologies to improve my coding skills.`
)

const projectOverview = ref(
  `This project is a single-page application (SPA) built with Vue 3, TypeScript, and Vite. It leverages Pinia for state management and Vue Router for navigation. Using Daisy UI, a Tailwind CSS plugin, we've crafted a clean and responsive user interface.
It includes multiple sections: personal information to introduce the developer, an overview of the project itself, which showcases best practices in structuring a Vue 3 application, and links to other relevant projects on GitHub. This serves as a practical example of modern web development practices, demonstrating how to integrate various technologies to create a functional and aesthetically pleasing web application.`
)

const projects = ref([
  {
    name: 'Frontend',
    url: 'https://github.com/guangyiliushan/vue3-web',
    description: 'This project is the frontend of the current website.'
  },
  {
    name: 'Backend',
    url: 'https://github.com/guangyiliushan/vue3-web-backend',
    description: 'This project is the backend of the current website.'
  },
  {
    name: 'Control',
    url: 'https://github.com/guangyiliushan/vue3-web-admin',
    description: 'This project is the control end of the current website.' 
  }
])
</script>

<style scoped>
.text-base-content {
  color: hsl(var(--bc) / 1);
}
</style>