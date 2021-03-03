import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
/* 引入字体文件 */
import '@/assets/font/iconfont.css'
/* 引入样式 */
import '@/assets/css/global.less'
/* 引入类 */
import SocketService from '@/utils/socket_service'
/* 连接服务端 */
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'

Vue.prototype.$http = axios

/* 全局的echarts对象挂载到vue原型对象上 */
Vue.prototype.$echarts = window.echarts

Vue.filter('dateFormat', (timeVal) => {
  let timer = new Date(timeVal)
  
  let y = timer.getFullYear()
  let m = String(timer.getMonth() + 1).padStart(2,'0')
  let d = String(timer.getDate()).padStart(2,'0')

  let hh = String(timer.getHours()).padStart(2,'0')
  let mm = String(timer.getMinutes()).padStart(2,'0')
  let ss =String( timer.getSeconds()).padStart(2,'0')
  
  return `${y}/${m}/${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
