import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'

import './assets/styles/element-variables.scss'

Vue.use(Element, {
  size: Cookies.get('size') || 'small' // set element-ui default size
})

new Vue({
  el: '#app',
  render: h => h(App)
})
