let Vue;

class Store {
  constructor(options) {
    this.$options = options;
    // 把state的数据，做成响应式
    this.state = new Vue({
      data: options.state
    })
    this._mutations = options.mutations;
    this._actions = options.actions;

    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  commit(type, payload){
    const entry = this._mutations[type]
    if (!entry){
      console.error('please use entry');
    }
    entry(this.state, payload)
  }

  dispatch(type){
    const entry = this._actions[type]
    if (!entry){
      console.error('please use entry');
    }
    entry(this)
  }
}

const install = function(_Vue){

  Vue = _Vue;

  Vue.mixin({
    beforeCreate(){
      if (this.$options.store){
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {install, Store}