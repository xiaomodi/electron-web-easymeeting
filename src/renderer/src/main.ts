import 'element-plus/dist/index.css'
import "@/assets/base.scss"
import "@/assets/color.scss"

import { createApp } from 'vue'
import { router } from '@/router'
import { createPinia } from 'pinia'
import App from './App.vue'
import ElementPlus from 'element-plus'
import './utils/useTheme'


const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(createPinia())

app.mount('#app')