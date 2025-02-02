import { GOD_CONFIG } from '../config/gameConfig.js';

export default class MeleeAttack {
    constructor(scene, x, y, type, owner) {
      this.scene = scene;
      this.owner = owner;
      this.type = type;
      this.active = true;
      
      const color = owner.god ? GOD_CONFIG[owner.god].zoneColor : 0xffffff;
      
      if (type === "spin") {
        this.hitbox = scene.add.circle(x, y, 60);
        this.hitbox.setStrokeStyle(2, color, 0.8);
        this.lifetime = 1000;
        this.rotationSpeed = 720; // degrees per second
      } else {
        this.hitbox = scene.add.rectangle(x, y, 80, 40);
        this.hitbox.setStrokeStyle(2, color, 0.8);
        this.lifetime = 200;
        if (owner.lastFacing) {
          this.hitbox.rotation = Math.atan2(owner.lastFacing.y, owner.lastFacing.x);
        }
      }
      
      this.damage = owner.damage * (type === "spin" ? 0.7 : 1.2);
      this.emitParticles();
    }

    emitParticles() {
      const particles = this.scene.add.particles('projectile');
      const color = this.owner.god ? GOD_CONFIG[this.owner.god].zoneColor : 0xffffff;
      
      const emitter = particles.createEmitter({
        x: this.hitbox.x,
        y: this.hitbox.y,
        speed: { min: -50, max: 50 },
        scale: { start: 0.5, end: 0 },
        lifespan: 300,
        blendMode: 'ADD',
        tint: color,
        quantity: this.type === "spin" ? 20 : 10
      });

      this.scene.time.delayedCall(300, () => { 
        particles.destroy(); 
      });
    }

    update(delta) {
      if (this.type === "spin") {
        this.hitbox.rotation += (this.rotationSpeed * delta) / 1000;
        this.hitbox.x = this.owner.sprite.x;
        this.hitbox.y = this.owner.sprite.y;
      }
      
      this.lifetime -= delta;
      if (this.lifetime <= 0) {
        this.destroy();
        return false;
      }
      return true;
    }

    getBounds() {
      return this.hitbox.getBounds();
    }

    destroy() {
      this.hitbox.destroy();
      this.active = false;
    }

    isActive() {
      return this.active;
    }
  }
  