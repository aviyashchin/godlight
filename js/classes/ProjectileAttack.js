export default class ProjectileAttack {
    constructor(scene, x, y, texture, velX, velY, damage, owner) {
      this.scene = scene;
      if (!owner.lastFacing) { owner.lastFacing = { x: 1, y: 0 }; }
      const offset = 30;
      x = x + owner.lastFacing.x * offset;
      y = y + owner.lastFacing.y * offset;
      this.sprite = scene.add.sprite(x, y, texture);
      this.sprite.setScale(0.5);
      this.velX = velX;
      this.velY = velY;
      this.damage = damage;
      this.owner = owner;
      this.lifetime = 2000;
    }
    update(delta) {
      const dt = delta / 1000;
      this.sprite.x += this.velX * dt;
      this.sprite.y += this.velY * dt;
      this.lifetime -= delta;
      if (this.lifetime <= 0) {
        this.destroy();
        return false;
      }
      return true;
    }
    getBounds() {
      return this.sprite.getBounds();
    }
    destroy() {
      this.sprite.destroy();
    }
  }
  