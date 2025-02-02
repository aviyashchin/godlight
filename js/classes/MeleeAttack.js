export default class MeleeAttack {
    constructor(scene, x, y, type, owner) {
      this.scene = scene;
      this.owner = owner;
      this.type = type;
      
      // Different sizes and effects for regular vs spin
      if (type === "spin") {
        this.sprite = scene.add.circle(x, y, 60, owner.god ? GOD_CONFIG[owner.god].zoneColor : 0xffffff);
        this.lifetime = 1000;
        this.rotationSpeed = 720; // degrees per second
      } else {
        this.sprite = scene.add.rectangle(x, y, 80, 40, owner.god ? GOD_CONFIG[owner.god].zoneColor : 0xffffff);
        this.lifetime = 200;
      }
      
      this.sprite.setAlpha(0.5);
      this.damage = owner.damage * (type === "spin" ? 0.7 : 1.2);
      this.createdTime = scene.time.now;
    }
    update(delta) {
      const age = this.scene.time.now - this.createdTime;
      
      if (this.type === "spin") {
        this.sprite.rotation += (this.rotationSpeed * delta) / 1000;
        this.sprite.x = this.owner.sprite.x;
        this.sprite.y = this.owner.sprite.y;
      }
      
      // Fade out effect
      this.sprite.setAlpha(0.5 * (1 - age / this.lifetime));
      
      if (age >= this.lifetime) {
        this.destroy();
        return false;
      }
      return true;
    }
    destroy() {
      this.sprite.destroy();
    }
  }
  