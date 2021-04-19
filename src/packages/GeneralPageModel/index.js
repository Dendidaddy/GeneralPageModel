import MainPage from './MainPage.vue'
MainPage.install = Vue => {
  Vue.component(MainPage.name, MainPage)
}
// global情况下 自动安装
if(typeof window !== 'undefined' && window.Vue){
  window.Vue.use(MainPage)
}
// 导出模块
export default MainPage