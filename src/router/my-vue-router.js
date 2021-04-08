// 自己实现一个简易vue-router

let Vue;
class VueRouter {
  constructor(options){
    this.$options = options;
    const inital = window.location.hash.slice('#') ||  '/';
    // 把current变成响应式，这样当current变化时，router-view组件中的render函数会重新渲染
    Vue.util.defineReactive(this, 'current', inital);
    window.addEventListener('hashchange', () => {
      // 得到地址栏上#号后边的数据，即router中的name属性
      this.current = window.location.hash.slice(1);
    })

  }
}

// 因为是插件，要实现一个install方法
// 1. 因为需要切换路由，要在初始化的方法里，实现router-view, router-link
// 2. 还要实现在Vue的实例中可以直接使用this.$router.push()等这种方法
// 3. 最后实现点击路由，可以切换页面的功能

// install方法被执行时，会自动传进来一个vue
VueRouter.install = function(_Vue){
  console.log('_Vue', _Vue);
  // 把Vue的实例，保存一份，不引用，减少项目打包体积
  Vue = _Vue;
  // 写一个全局混入，并在beforeCreate钩子中初始化this.$router,
  // 因为vue.use()在 new Vue()之前运行，所以要延迟一下，在vue实例初始化之后，去拿router的实例
  Vue.mixin({
    beforeCreate(){
      console.log('beforeCreate->this', this);
      // 这样就可以在vue组件中直接使用this.$router.push() 等方法
      // 根实例才有该选项
      if(this.$options.router){
        Vue.prototype.$router = this.$options.router; 
      }
    }
  })
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render(h){
      console.log('render->this', this);
      return h('a',{'attrs': {
        href: '#' + this.to
      }}, this.$slots.default)
    }
  });

  Vue.component('router-view', {
    render(h){
      let component = null;
      const route = this.$router.$options.routes.find(item => item.path === this.$router.current)
      if (route){
        component = route.component;
        console.log('component', component);
      }
      return h(component)
    }
  });


}

export default VueRouter;