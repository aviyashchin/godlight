import MeleeAttack from '../classes/MeleeAttack.js';
import ProjectileAttack from '../classes/ProjectileAttack.js';
import PowerUp from '../classes/PowerUp.js';

class ObjectPool {
  constructor(scene, createFn, maxSize = 50, initialSize = 20) {
    this.scene = scene;
    this.createFn = createFn;
    this.maxSize = maxSize;
    this.pool = [];
    
    // Don't create initial objects - they'll be created on demand
    // since they need specific parameters
  }

  get(params) {
    let obj = this.pool.find(obj => !obj.active);
    if (!obj && this.pool.length < this.maxSize) {
      obj = this.createFn(this.scene, ...params);
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

export default class CombatManager {
  constructor(scene) {
    this.scene = scene;
    
    // Initialize object pools with proper creation functions
    this.meleePool = new ObjectPool(
      scene,
      (scene, x, y, type, owner) => new MeleeAttack(scene, x, y, type, owner)
    );
    
    this.projectilePool = new ObjectPool(
      scene,
      (scene, x, y, texture, velX, velY, damage, owner) => 
        new ProjectileAttack(scene, x, y, texture, velX, velY, damage, owner)
    );
    
    this.powerUpPool = new ObjectPool(
      scene,
      (scene, x, y, type) => new PowerUp(scene, x, y, type)
    );
    
    // Track active objects
    this.activeMeleeAttacks = new Set();
    this.activeProjectiles = new Set();
    this.activePowerUps = new Set();
  }

  spawnMeleeAttack(x, y, type, owner) {
    return this.meleePool.get([x, y, type, owner]);
  }

  spawnProjectile(x, y, owner, dirX, dirY) {
    const speed = 500;
    const mag = Math.sqrt(dirX * dirX + dirY * dirY);
    if (mag === 0) { 
      dirX = owner.lastFacing.x; 
      dirY = owner.lastFacing.y; 
    } else { 
      dirX /= mag; 
      dirY /= mag; 
    }
    const velX = dirX * speed;
    const velY = dirY * speed;
    const damage = owner.damage * 1.2;
    
    return this.projectilePool.get([x, y, "projectile", velX, velY, damage, owner]);
  }

  spawnPowerUp(x, y, type) {
    return this.powerUpPool.get([x, y, type]);
  }

  update(delta) {
    this.meleePool.update(delta);
    this.projectilePool.update(delta);
    this.powerUpPool.update(delta);
  }
} 