import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

window.CESIUM_BASE_URL = 'cesium/'

declare global {
  interface Window {
    CESIUM_BASE_URL: string
  }
}


const app = createApp(App)

app.use(router)

app.mount('#app')
