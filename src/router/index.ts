import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomePage.vue'
import FlightTracker from '@/views/FlightTracker.vue'
import FlightPose from '@/views/FlightPose.vue'

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
  },
  {
    path: '/flight-pose',
    name: 'FlightPost',
    component: () => FlightPose
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
