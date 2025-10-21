class Bus {
  map: Map<string, Function[]>
  constructor() {
    this.map = new Map()
  }

  on(eventName: string, callback: Function) {
    if (this.map.has(eventName)) {
      this.map.get(eventName)!.push(callback)
    } else {
      this.map.set(eventName, [callback])
    }
  }

  emit(eventName: string, ...args: any[]) {
    if (this.map.get(eventName) && this.map.get(eventName)!.length) {
      this.map.get(eventName)!.forEach(fn => {
         fn(...args)
      })
    }
  }

  off(eventName: string) {
    this.map.delete(eventName)
  }
}

export default new Bus()