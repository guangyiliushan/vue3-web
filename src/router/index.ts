import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '@/views/Home.vue'
import AboutView from '@/views/About.vue'
import DashboardView from '@/views/Dashboard.vue'
import LoginView from '@/views/Login.vue'
import RegisterView from '@/views/Register.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about',name: 'About' , component: AboutView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router.beforeEach((to, from, next) => {
//   if (to.name !== 'Login') next({ name: 'Login' })
//   else next()
// })

export default router