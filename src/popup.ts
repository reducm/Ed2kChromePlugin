import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import cssString from 'element-plus/dist/index.css'


const style = document.createElement('style');
document.head.append(style);
style.textContent = cssString;

createApp(App).use(ElementPlus).mount('#app')
