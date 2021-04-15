// 定义数据响应式，实际上用的闭包来实现
function defineReactive(obj, key, val){
  // 递归遍历
  observe(val)
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get(){
      // console.log('get', key);
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newVal){
      if (val !== newVal){
        // console.log('set', key);
        // 当给对象属性赋值为对象时，做响应式初始化
        /**
         * 
         * obj.baz = {
                a: 10
          }
         */
        observe(newVal)
        val = newVal
        dep.notify()
      }
    }
  })
}

// 给对象添加、删除属性时，无法自动触发响应式，要用set分发一下。
// obj.dong = 'dong' no ok
function set(obj,key,val){
  defineReactive(obj, key, val)

}

// 遍历一下要变成响应式的对象，使这个对象变成响应式
function observe(obj){
  if (obj === null || typeof obj !== 'object'){
    return 
  }
  new Observe(obj);
 }

 function proxy(vm){
  Object.keys(vm.$data).forEach(key => {
   Object.defineProperty(vm, key, {
     get(){
       return vm.$data[key];
     },
     set(newValue){
       vm.$data[key] = newValue
     }
   })
  })
}
// 使vue.$data的数据实现响应式
 class Observe{
   constructor(value) {
     this.value = value;
     if (Array.isArray(this.value)){
       // todo 数组的响应式
     } else {
       this.walk(this.value)
     }
   }

   walk(obj){
     Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
     })
   }
 }


 // 1. 实现数据响应式
 // 2. 编译模板
 class MyVue {
  constructor(options){
    this.$options = options;
    this.$data = options.data

    // $data设置为响应式
    observe(this.$data)

    // 代理，可以直接使用app.counter,而不用app.$data.counter
    proxy(this)

    // 编译
    new Compile(this, this.$options.el)
  }

 }

 // 1. 解析文本
 // 2. 解析指令
 // 3. 依赖收集初始化和更新
 class Compile{
   constructor(vm, el){
     this.vm = vm
     this.tree = document.querySelector(el)
     
     if (this.tree){
      this.compile(this.tree)
     }
     
   }

   compile(tree){
     // 获取根下面的dom树，
     const childNodes = tree.childNodes
          // 类数组，转成数组
          Array.from(childNodes).forEach(node => {
            if (node.nodeType === 1){
              // 是元素
              // 处理 k-xxx 这样的指令
              const attrs = node.attributes
              console.log(attrs);
              Array.from(attrs).forEach(attr => {
                const attrName = attr.name;
                const exp = attr.value
                console.log(attrName, exp);
                // 如果是指令，以k-开头的，拿到k-后面的数据，计算属成为函数，并执行
                if(attrName.startsWith('k-')){
                  const dir = attrName.substr(2)
                  this[dir] && this[dir](node, exp)
                }
              })
              console.log('这是元素', node.nodeName);
            } else if (this.isInter(node)){
              // 是文本
              this.compileText(node)
              console.log('这是插值', node.textContent);
            }

            // 递归
            if (node.childNodes){
              this.compile(node)
            }
          })
   }

   update(node, exp ,dir){
     // 1. 定义一个更主级的统一更新函数
    const fn = this[dir + 'Updater']
    fn && fn(node, this.vm[exp])

    // 更新
    new Watcher(this.vm, exp,function(val){
      fn && fn(node, val)
    })
   }
   // 编译文件
   text(node, exp){
    this.update(node, exp, 'text')
   }

   textUpdater(node, val){
    node.textContent = val
   }
   // 编辑html
   html(node, exp){
    this.update(node, exp, 'html')
   }

   htmlUpdater(node,val){
    node.innerHTML = val
  }

   // 编译插值表达式
   compileText(node){
    this.update(node, RegExp.$1, 'text')
   }

   isInter(node){
     return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
   }
 }

 class Watcher{
   constructor(vm,key,updateFn){
     this.vm = vm;
     this.key = key;
     this.updateFn = updateFn

     // 触发依赖收集
     Dep.target = this
     // 触发上面的get
     this.vm[this.key]
     Dep.target = null
   }


   update(){
      this.updateFn.call(this.vm, this.vm[this.key])
   }
 }

 class Dep {
  constructor(){
    this.deps = []
  }

  addDep(watcher){
    this.deps.push(watcher)
  }

  notify(){
    this.deps.forEach(dep => dep.update())
  }
  

 }