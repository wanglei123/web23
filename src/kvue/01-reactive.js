
// 定义数据响应式，实际上用的闭包来实现
function defineReactive(obj, key, val){
  // 递归遍历
  observe(val)
  Object.defineProperty(obj, key, {
    get(){
      console.log('get', key);
      return val
    },
    set(newVal){
      if (val !== newVal){
        console.log('set', key);
        // 当给对象属性赋值为对象时，做响应式初始化
        /**
         * 
         * obj.baz = {
                a: 10
          }
         */
        observe(newVal)
        val = newVal
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
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })

 }


const obj = {
  foo: 'foo',
  bar: 'bar',
  baz: {
    a: 1
  }
}
observe(obj)

obj.baz = {
  a: 10
}

obj.baz.a
obj.baz.a = 20

set(obj, 'dong', 'dong')

obj.dong
