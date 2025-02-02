export default class MeleeAttack {
    constructor(scene, x, y, width, height, rotation, damage, owner) {
      this.scene = scene;
      this.hitbox = scene.add.rectangle(x, y, width, height, 0xff0000, 0.5);
      this.hitbox.rotation = rotation;
      this.damage = damage;
      this.owner = owner;
      this.lifetime = 200;
      // Emit particles upon creation
      this.emitParticles();
    }
    emitParticles() {
      let particles = this.scene.add.particles('projectile');
      particles.createEmitter({
        x: this.hitbox.x,
        y: this.hitbox.y,
        speed: { min: -50, max: 50 },
        scale: { start: 0.5, end: 0 },
        lifespan: 300,
        blendMode: 'ADD',
        quantity: 10
      });
      this.scene.time.delayedCall(300, () => { particles.destroy(); });
    }
    update(delta) {
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
    }
  }
  