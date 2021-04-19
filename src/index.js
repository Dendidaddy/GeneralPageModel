import MainPage from './packages/GeneralPageModel'
const components = [
  MainPage,
    //还可再添加组件
]
const install = function (Vue, opts = {}) {
    components.map(component => {
        Vue.component(component.name, component);
    })
}
/* 支持使用标签的方式引入 */
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export default {
    install,
    MainPage,
    //若有，则继续导出
}
