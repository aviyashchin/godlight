// js/classes/Enemy.js
import { ENEMY_SPEED, ARENA_CENTER, ARENA_RADIUS } from '../helpers.js';
import { GODS, GOD_CONFIG } from '../helpers.js';

export default class Enemy {
  constructor(scene, x, y, enemyIndex, shapeSides) {
    this.scene = scene;
    this.enemyIndex = enemyIndex;
    let availableGods = GODS.filter(g => g.name !== "Hades");
    this.god = Phaser.Utils.Array.GetRandom(availableGods).name;
    let cfg = GOD_CONFIG[this.god] || { health: 100, damage: 10, shield: 20, bullets: 10, bulletReload: 1000, shieldReload: 5000 };
    this.maxHealth = cfg.health;
    this.health = cfg.health;
    this.damage = cfg.damage;
    this.maxShield = cfg.shield;
    this.shield = cfg.shield;
    this.maxBullets = cfg.bullets;
    this.currentBullets = cfg.bullets;
    this.reloadRate = cfg.bulletReload;
    this.shieldReloadRate = cfg.shieldReload;
    this.lastReloadTime = 0;
    this.lastShieldReloadTime = 0;
    this.speed = ENEMY_SPEED;
    this.attackCooldown = 2000;
    this.lastAttackTime = 0;
    this.attackRange = 200;
    this.homeZone = this.scene.pieZones.find(z => z.god === this.god);
    this.state = "patrol";
    this.stateTime = 0;
    this.patrolDirection = { x: Math.random()*2-1, y: Math.random()*2-1 };
    if (this.god === "Hades") {
      this.sprite = scene.add.sprite(x, y, "circle_hades");
    } else {
      this.sprite = scene.add.sprite(x, y, "poly_" + shapeSides);
    }
    this.sprite.setScale(0.5);
    this.sprite.setTint(GOD_CONFIG[this.god].zoneColor);
    this.nameText = scene.add.text(x - 10, y - 30, "E" + enemyIndex + ": " + this.god, { fontSize: '12px', fill: '#fff' });
    this.healthBar = scene.add.graphics();
  }
  
  update(time, delta) {
    const deltaTime = delta / 1000;
    this.stateTime += delta;
    if (time - this.lastReloadTime > this.reloadRate && this.currentBullets < this.maxBullets) {
      this.currentBullets++;
      this.lastReloadTime = time;
    }
    
    // Determine nearest target.
    let nearest = null, minDist = Infinity;
    let allTargets = this.scene.players.concat(this.scene.enemies.filter(e => e !== this));
    for (let target of allTargets) {
      let dx = target.sprite.x - this.sprite.x;
      let dy = target.sprite.y - this.sprite.y;
      let dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < minDist) { minDist = dist; nearest = target; }
    }
    
    // New defensive state: if health falls below 20%, enemy retreats defensively.
    if (this.health < this.maxHealth * 0.2) {
      this.state = "defensive";
    }
    
    if (this.state === "defensive") {
      if (nearest) {
        let dx = this.sprite.x - nearest.sprite.x;
        let dy = this.sprite.y - nearest.sprite.y;
        let mag = Math.sqrt(dx*dx+dy*dy);
        if (mag > 0) {
          this.sprite.x += (dx/mag) * this.speed * deltaTime;
          this.sprite.y += (dy/mag) * this.speed * deltaTime;
        }
      }
    } else if (this.state === "home" && this.homeZone) {
      let dx = this.homeZone.centerX - this.sprite.x;
      let dy = this.homeZone.centerY - this.sprite.y;
      let mag = Math.sqrt(dx*dx+dy*dy);
      if (mag > 0) {
        this.sprite.x += (dx/mag) * this.speed * deltaTime;
        this.sprite.y += (dy/mag) * this.speed * deltaTime;
      }
    } else if (this.state === "patrol") {
      if (this.stateTime > 2000) {
        this.patrolDirection = { x: Math.random()*2-1, y: Math.random()*2-1 };
        this.stateTime = 0;
      }
      this.sprite.x += this.patrolDirection.x * this.speed * deltaTime;
      this.sprite.y += this.patrolDirection.y * this.speed * deltaTime;
    } else if (this.state === "chase") {
      if (nearest) {
        let dx = nearest.sprite.x - this.sprite.x;
        let dy = nearest.sprite.y - this.sprite.y;
        let mag = Math.sqrt(dx*dx+dy*dy);
        if (mag > 0) {
          this.sprite.x += (dx/mag) * this.speed * deltaTime;
          this.sprite.y += (dy/mag) * this.speed * deltaTime;
        }
      }
      if (minDist < this.attackRange && time - this.lastAttackTime > this.attackCooldown && this.currentBullets > 0) {
        this.currentBullets--;
        let dx = nearest.sprite.x - this.sprite.x;
        let dy = nearest.sprite.y - this.sprite.y;
        let mag = Math.sqrt(dx*dx+dy*dy);
        let dirX = dx/mag, dirY = dy/mag;
        if (Math.random() < 0.7) {
          this.scene.combatManager.spawnProjectile(this.sprite.x, this.sprite.y, this, dirX, dirY);
        } else {
          this.scene.combatManager.spawnMeleeAttack(this.sprite.x, this.sprite.y, Math.random() < 0.3 ? "spin" : "regular", this);
        }
        this.lastAttackTime = time;
      }
    }
    
    // Clamp enemy within arena.
    let dxClamp = this.sprite.x - ARENA_CENTER.x;
    let dyClamp = this.sprite.y - ARENA_CENTER.y;
    let distClamp = Math.sqrt(dxClamp*dxClamp+dyClamp*dyClamp);
    if (distClamp > ARENA_RADIUS) {
      this.sprite.x = ARENA_CENTER.x + (dxClamp/distClamp) * ARENA_RADIUS;
      this.sprite.y = ARENA_CENTER.y + (dyClamp/distClamp) * ARENA_RADIUS;
    }
    
    this.updateHealthBar();
    this.nameText.setPosition(this.sprite.x - 10, this.sprite.y - 30);
    if (this.health <= 0) {
      this.sprite.destroy();
      this.nameText.destroy();
      this.healthBar.destroy();
      this.scene.enemies = this.scene.enemies.filter(e => e !== this);
    }
  }
  
  updateHealthBar() {
    this.healthBar.clear();
    const barWidth = 30, barHeight = 5;
    let healthPercent = Phaser.Math.Clamp(this.health/this.maxHealth, 0, 1);
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 40, barWidth, barHeight);
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 40, barWidth * healthPercent, barHeight);
    if (this.shield > 0) {
      this.healthBar.lineStyle(4, 0x0000ff, 1);
      this.healthBar.strokeCircle(this.sprite.x, this.sprite.y, 30);
    }
  }
  
  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
    this.healthBar.destroy();
  }
}
