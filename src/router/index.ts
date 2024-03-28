import { createRouter, createWebHashHistory } from 'vue-router'
import FlightTracker from '../views/FlightTracker.vue'
import Home from '@/views/HomePage.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/flight-tracker',
    name: 'FlightTracker',
    component: FlightTracker
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
