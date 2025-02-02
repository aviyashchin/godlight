class ObjectPool {
  constructor(createFn, maxSize = 50, initialSize = 20) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    this.pool = new Array(initialSize).fill(null).map(() => {
      const obj = this.createFn();
      obj.active = false;
      return obj;
    });
    this.activeObjects = new Set();
  }

  get() {
    let obj = this.pool.find(obj => !obj.active);
    if (!obj && this.pool.length < this.maxSize) {
      obj = this.createFn();
      obj.active = false;
      this.pool.push(obj);
    }
    if (obj) {
      obj.active = true;
      this.activeObjects.add(obj);
    }
    return obj;
  }

  release(obj) {
    if (this.activeObjects.has(obj)) {
      obj.active = false;
      this.activeObjects.delete(obj);
    }
  }

  update(delta) {
    this.activeObjects.forEach(obj => {
      if (!obj.isActive()) {
        this.release(obj);
      } else {
        obj.update(delta);
      }
    });
  }

  clear() {
    this.activeObjects.clear();
    this.pool.forEach(obj => {
      obj.active = false;
    });
  }
}

export default ObjectPool; 