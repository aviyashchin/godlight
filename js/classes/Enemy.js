// js/classes/Enemy.js
import { ENEMY_SPEED, ARENA_CENTER, ARENA_RADIUS } from '../helpers.js';
import { GODS, GOD_CONFIG } from '../config/gameConfig.js';

export default class Enemy {
  constructor(scene, x, y, god) {
    this.scene = scene;
    this.god = god;
    this.sprite = scene.add.sprite(x, y, god === "Hades" ? "circle_hades" : "poly_3");
    this.sprite.setScale(0.5);
    this.sprite.setTint(GOD_CONFIG[god].zoneColor);
    
    // Combat stats from config
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
      shieldReloadRate: cfg.shieldReload
    });

    // Combat timers
    this.lastReloadTime = 0;
    this.lastShieldReloadTime = 0;
    this.lastAttackTime = 0;
    this.attackCooldown = 2000;
    this.attackRange = 200;

    // Movement
    this.lastFacing = { x: 1, y: 0 };
    this.speed = 100;
    
    // UI elements
    this.nameText = scene.add.text(x - 20, y - 30, "E: " + this.god, { fontSize: '12px', fill: '#fff' });
    this.healthBar = scene.add.graphics();
  }

  update(time, delta) {
    // Shield regeneration
    if (time - this.lastShieldReloadTime > this.shieldReloadRate && this.shield < this.maxShield) {
      this.shield++;
      this.lastShieldReloadTime = time;
    }

    // Bullet reloading
    if (time - this.lastReloadTime > this.reloadRate && this.currentBullets < this.maxBullets) {
      this.currentBullets++;
      this.lastReloadTime = time;
    }

    // Find nearest target
    const allTargets = [...this.scene.players, ...this.scene.enemies]
      .filter(target => target !== this);
    
    let nearestTarget = null;
    let shortestDistance = Infinity;
    
    allTargets.forEach(target => {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        target.sprite.x, target.sprite.y
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestTarget = target;
      }
    });

    if (nearestTarget) {
      this.handleCombat(nearestTarget, shortestDistance, time, delta);
    }

    // Update UI
    this.nameText.setPosition(this.sprite.x - 20, this.sprite.y - 30);
    this.updateHealthBar();
  }

  handleCombat(target, distance, time, delta) {
    const dirX = target.sprite.x - this.sprite.x;
    const dirY = target.sprite.y - this.sprite.y;
    const mag = Math.sqrt(dirX * dirX + dirY * dirY);
    
    if (mag > 0) {
      this.lastFacing.x = dirX / mag;
      this.lastFacing.y = dirY / mag;
      
      if (distance > this.attackRange) {
        this.sprite.x += (this.lastFacing.x * this.speed * delta) / 1000;
        this.sprite.y += (this.lastFacing.y * this.speed * delta) / 1000;
      }
    }

    if (distance < this.attackRange && 
        time - this.lastAttackTime > this.attackCooldown && 
        this.currentBullets > 0) {
      
      if (Math.random() < 0.7) {
        this.scene.combatManager.spawnProjectile(
          this.sprite.x, 
          this.sprite.y,
          this, 
          this.lastFacing.x, 
          this.lastFacing.y
        );
      } else {
        this.scene.combatManager.spawnMeleeAttack(
          this.sprite.x, 
          this.sprite.y,
          Math.random() < 0.3 ? "spin" : "regular",
          this
        );
      }
      
      this.currentBullets--;
      this.lastAttackTime = time;
    }
  }

  updateHealthBar() {
    this.healthBar.clear();
    const width = 40;
    const height = 6;
    const x = this.sprite.x - width/2;
    const y = this.sprite.y - 40;
    
    // Background
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(x, y, width, height);
    
    // Health
    const healthWidth = Math.max(0, (this.health / this.maxHealth) * width);
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(x, y, healthWidth, height);
    
    // Shield
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
