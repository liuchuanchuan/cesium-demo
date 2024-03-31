import { createRouter, createWebHashHistory } from 'vue-router'
export const routes = [
  // {
  //   path: '/xlsx',
  //   name: 'home',
  //   component: () => import('@/views/HomePage.vue')
  // },
  // {
  //   path: '/flight-tracker',
  //   name: 'FlightTracker',
  //   component: () => import('@/views/FlightTracker.vue')
  // },
  // {
  //   path: '/flight-pose',
  //   name: 'FlightPose',
  //   component: () => import('@/views/FlightPose.vue')
  // },
  {
    path: '/',
    name: 'XlsxData',
    component: () => import('@/views/XlsxData.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
