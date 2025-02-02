import { PLAYER_SPEED, ARENA_CENTER, ARENA_RADIUS } from '../helpers.js';
import { GODS, GOD_CONFIG } from '../helpers.js';
import { State, StateMachine } from '../managers/StateMachine.js';
import GAME_CONFIG from '../config/gameConfig.js';

// Player States
class IdleState extends State {
  constructor() {
    super('idle');
  }
  
  execute(player) {
    player.updateMovement();
    player.checkAttackInputs();
  }
}

class SprintState extends State {
  constructor() {
    super('sprint');
  }
  
  execute(player) {
    player.speed = GAME_CONFIG.player.BASE_SPEED * GAME_CONFIG.player.SPRINT_MULTIPLIER;
    player.updateMovement();
    player.checkAttackInputs();
  }
  
  exit(player) {
    player.speed = GAME_CONFIG.player.BASE_SPEED;
  }
}

export default class Player {
  constructor(scene, x, y, playerIndex, shapeSides) {
    this.scene = scene;
    this.playerIndex = playerIndex;
    
    // Initialize sprite
    this.sprite = scene.add.sprite(x, y, shapeSides === 0 ? "circle_hades" : "poly_" + shapeSides);
    this.sprite.setScale(0.5);
    
    // Movement
    this.speed = 200;
    this.lastFacing = { x: 1, y: 0 };
    
    // Combat stats will be set by scene
    this.currentBullets = 0;
    this.maxBullets = 0;
    this.lastAttackTime = 0;
    this.attackCooldown = 500;
    
    // Input
    this.keys = scene.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      melee1: 'J',
      melee2: 'K',
      projectile: 'L'
    });
    
    // UI elements
    this.nameText = scene.add.text(x - 20, y - 70, "P" + playerIndex, { fontSize: '12px', fill: '#fff' });
    this.bulletText = scene.add.text(x - 20, y - 55, "Ammo: 0", { fontSize: '12px', fill: '#fff' });
    this.healthBar = scene.add.graphics();
  }

  update(time, delta) {
    const deltaTime = delta / 1000;
    
    // Movement
    let dx = 0, dy = 0;
    
    if (this.keys.up.isDown) dy -= 1;
    if (this.keys.down.isDown) dy += 1;
    if (this.keys.left.isDown) dx -= 1;
    if (this.keys.right.isDown) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      this.sprite.x += (dx / mag) * this.speed * deltaTime;
      this.sprite.y += (dy / mag) * this.speed * deltaTime;
      this.lastFacing.x = dx / mag;
      this.lastFacing.y = dy / mag;
    }
    
    // Attack inputs
    if (time - this.lastAttackTime > this.attackCooldown && this.currentBullets > 0) {
      if (this.keys.melee1.isDown) {
        this.scene.combatManager.spawnMeleeAttack(
          this.sprite.x,
          this.sprite.y,
          "regular",
          this
        );
        this.currentBullets--;
        this.lastAttackTime = time;
      } 
      else if (this.keys.melee2.isDown) {
        this.scene.combatManager.spawnMeleeAttack(
          this.sprite.x,
          this.sprite.y,
          "spin",
          this
        );
        this.currentBullets--;
        this.lastAttackTime = time;
      }
      else if (this.keys.projectile.isDown) {
        this.scene.combatManager.spawnProjectile(
          this.sprite.x,
          this.sprite.y,
          this,
          this.lastFacing.x,
          this.lastFacing.y
        );
        this.currentBullets--;
        this.lastAttackTime = time;
      }
    }
    
    // Clamp to arena
    this.clampToArena();
    
    // Update UI
    this.updateHUD();
  }

  updateHUD() {
    this.nameText.setPosition(this.sprite.x - 20, this.sprite.y - 70);
    this.bulletText.setPosition(this.sprite.x - 20, this.sprite.y - 55);
    this.bulletText.setText(`Ammo: ${this.currentBullets}`);
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    const barWidth = 40, barHeight = 6;
    const healthPercent = Phaser.Math.Clamp(this.health/this.maxHealth, 0, 1);
    
    // Background
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 80, barWidth, barHeight);
    
    // Health
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 80, barWidth * healthPercent, barHeight);
    
    // Shield
    if (this.shield > 0) {
      this.healthBar.lineStyle(4, 0x0000ff, 1);
      this.healthBar.strokeCircle(this.sprite.x, this.sprite.y, 30);
    }
  }

  clampToArena() {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    const dx = this.sprite.x - centerX;
    const dy = this.sprite.y - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    if (dist > maxRadius) {
      this.sprite.x = centerX + (dx/dist) * maxRadius;
      this.sprite.y = centerY + (dy/dist) * maxRadius;
    }
    
    this.sprite.rotation = Math.atan2(this.lastFacing.y, this.lastFacing.x) + Math.PI/2;
  }

  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
    this.bulletText.destroy();
    this.healthBar.destroy();
  }
}
