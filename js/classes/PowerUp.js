export default class PowerUp {
    constructor(scene, x, y, type) {
      this.scene = scene;
      this.type = type; // "shield" or "extraSpeed"
      this.sprite = scene.add.sprite(x, y, "projectile");
      this.sprite.setScale(0.5);
      this.lifetime = 10000;
      this.label = scene.add.text(x, y - 20, (type === "shield" ? "Shield +20" : "Speed +50"), { fontSize: '12px', fill: '#fff' });
    }
    update(delta) {
      this.lifetime -= delta;
      this.label.setPosition(this.sprite.x, this.sprite.y - 20);
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
      this.label.destroy();
    }
  }
  