import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Ion } from 'cesium'

window.CESIUM_BASE_URL = 'cesium/'

declare global {
  interface Window {
    CESIUM_BASE_URL: string
  }
}
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZDM4YjYxNy02YmRjLTQ1MmQtYmFkMi0wN2ZlMGQzMmY3YTgiLCJpZCI6MjAzNjgzLCJpYXQiOjE3MTE1MjExODN9.ZMmT-75daWondcFihK1sDR4Uny56wOxI4Xh868JwSQI'


const app = createApp(App)

app.use(router)

app.mount('#app')
