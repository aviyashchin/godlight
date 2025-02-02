// js/classes/Enemy.js
import { GODS, GOD_CONFIG } from '../config/gameConfig.js';

export default class Enemy {
  constructor(scene, x, y, god) {
    this.scene = scene;
    this.god = god;
    this.sprite = scene.add.sprite(x, y, god === "Hades" ? "circle_hades" : "poly_3");
    this.sprite.setScale(0.5);
    this.sprite.setTint(GOD_CONFIG[god].zoneColor);
    
    const cfg = GOD_CONFIG[god];
    Object.assign(this, {
      maxHealth: cfg.health,
      health: cfg.health,
      damage: cfg.damage,
      maxShield: cfg.shield,
      shield: cfg.shield,
      maxBullets: cfg.bullets,
      currentBullets: cfg.bullets,
      reloadRate: cfg.bulletReload,
      shieldReloadRate: cfg.shieldReload,
      lastReloadTime: 0,
      lastShieldReloadTime: 0,
      lastAttackTime: 0,
      attackCooldown: 1000,
      attackRange: 200,
      speed: 100,
      state: "patrol",
      stateTime: 0,
      patrolDirection: { x: Math.random()*2-1, y: Math.random()*2-1 }
    });

    this.nameText = scene.add.text(x - 20, y - 30, "E: " + this.god, { fontSize: '12px', fill: '#fff' });
    this.healthBar = scene.add.graphics();
  }

  update(time, delta) {
    // Reloading
    if (time - this.lastReloadTime > this.reloadRate && this.currentBullets < this.maxBullets) {
      this.currentBullets++;
      this.lastReloadTime = time;
    }
    if (time - this.lastShieldReloadTime > this.shieldReloadRate && this.shield < this.maxShield) {
      this.shield++;
      this.lastShieldReloadTime = time;
    }

    // Find target
    let nearest = null, minDist = Infinity;
    const allTargets = [...this.scene.players, ...this.scene.enemies].filter(e => e !== this);
    
    allTargets.forEach(target => {
      const dx = target.sprite.x - this.sprite.x;
      const dy = target.sprite.y - this.sprite.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = target;
      }
    });

    // State machine
    const deltaTime = delta / 1000;
    this.stateTime += delta;

    if (this.state === "patrol") {
      this.sprite.x += this.patrolDirection.x * this.speed * deltaTime;
      this.sprite.y += this.patrolDirection.y * this.speed * deltaTime;
      
      if (nearest && minDist < 300) {
        this.state = "chase";
        this.stateTime = 0;
      }
      if (this.stateTime > 2000) {
        this.patrolDirection = { x: Math.random()*2-1, y: Math.random()*2-1 };
        this.stateTime = 0;
      }
    }
    
    else if (this.state === "chase" && nearest) {
      const dx = nearest.sprite.x - this.sprite.x;
      const dy = nearest.sprite.y - this.sprite.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > 150) {
        this.sprite.x += (dx/dist) * this.speed * deltaTime;
        this.sprite.y += (dy/dist) * this.speed * deltaTime;
      }
      
      if (dist < this.attackRange && time - this.lastAttackTime > this.attackCooldown && this.currentBullets > 0) {
        if (Math.random() < 0.7) {
          this.scene.spawnProjectileAttack(
            this.sprite.x, this.sprite.y,
            this, dx/dist, dy/dist
          );
        } else {
          this.scene.spawnMeleeAttack(
            this.sprite.x, this.sprite.y,
            Math.random() < 0.3 ? "spin" : "regular",
            this
          );
        }
        this.currentBullets--;
        this.lastAttackTime = time;
      }
      
      if (minDist > 400 || this.health < this.maxHealth * 0.3) {
        this.state = "retreat";
        this.stateTime = 0;
      }
    }
    
    else if (this.state === "retreat") {
      if (this.stateTime > 3000 || this.health > this.maxHealth * 0.7) {
        this.state = "patrol";
        this.stateTime = 0;
      }
      // Move away from nearest target if exists
      if (nearest) {
        const dx = nearest.sprite.x - this.sprite.x;
        const dy = nearest.sprite.y - this.sprite.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
          this.sprite.x -= (dx/dist) * this.speed * deltaTime;
          this.sprite.y -= (dy/dist) * this.speed * deltaTime;
        }
      }
    }

    // Arena bounds
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    const toCenterX = this.sprite.x - centerX;
    const toCenterY = this.sprite.y - centerY;
    const distToCenter = Math.sqrt(toCenterX*toCenterX + toCenterY*toCenterY);
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    if (distToCenter > maxRadius) {
      this.sprite.x = centerX + (toCenterX/distToCenter) * maxRadius;
      this.sprite.y = centerY + (toCenterY/distToCenter) * maxRadius;
      this.state = "patrol";
    }

    this.nameText.setPosition(this.sprite.x - 20, this.sprite.y - 30);
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    const width = 40, height = 6;
    const x = this.sprite.x - width/2;
    const y = this.sprite.y - 40;
    
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(x, y, width, height);
    
    const healthWidth = Math.max(0, (this.health / this.maxHealth) * width);
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(x, y, healthWidth, height);
    
    if (this.shield > 0) {
      this.healthBar.lineStyle(2, 0x00ffff, 1);
      this.healthBar.strokeCircle(this.sprite.x, this.sprite.y, 25);
    }
  }

  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
    this.healthBar.destroy();
  }
}
