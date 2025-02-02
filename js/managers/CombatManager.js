import MeleeAttack from '../classes/MeleeAttack.js';
import ProjectileAttack from '../classes/ProjectileAttack.js';
import PowerUp from '../classes/PowerUp.js';

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

export default class CombatManager {
  constructor(scene) {
    this.scene = scene;
    
    // Initialize object pools
    this.meleePool = new ObjectPool(() => new MeleeAttack(scene));
    this.projectilePool = new ObjectPool(() => new ProjectileAttack(scene));
    this.powerUpPool = new ObjectPool(() => new PowerUp(scene));
    
    // Track active objects
    this.activeMeleeAttacks = new Set();
    this.activeProjectiles = new Set();
    this.activePowerUps = new Set();
  }

  spawnMeleeAttack(x, y, type, owner) {
    const attack = this.meleePool.get();
    if (attack) {
      attack.activate(x, y, type, owner);
      this.activeMeleeAttacks.add(attack);
    }
    return attack;
  }

  spawnProjectile(x, y, owner, dirX, dirY) {
    const projectile = this.projectilePool.get();
    if (projectile) {
      projectile.activate(x, y, owner, dirX, dirY);
      this.activeProjectiles.add(projectile);
    }
    return projectile;
  }

  spawnPowerUp(x, y, type) {
    const powerUp = this.powerUpPool.get();
    if (powerUp) {
      powerUp.activate(x, y, type);
      this.activePowerUps.add(powerUp);
    }
    return powerUp;
  }

  update(delta) {
    // Update all active objects
    this.meleePool.update(delta);
    this.projectilePool.update(delta);
    this.powerUpPool.update(delta);
  }
} 