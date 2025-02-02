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
    this.initializeComponents(x, y, shapeSides);
    this.initializeStateMachine();
  }

  initializeComponents(x, y, shapeSides) {
    this.sprite = this.scene.add.sprite(x, y, `poly_${shapeSides}`);
    this.sprite.setScale(0.5);
    this.speed = GAME_CONFIG.player.BASE_SPEED;
    this.health = GAME_CONFIG.player.MAX_HEALTH;
    this.shield = GAME_CONFIG.player.MAX_SHIELD;
    this.lastFacing = { x: 1, y: 0 };
    this.currentBullets = 10;
    this.maxBullets = 10;
    this.lastAttackTime = 0;
    this.attackCooldown = GAME_CONFIG.combat.COOLDOWNS.MELEE;
    
    // HUD elements
    this.nameText = this.scene.add.text(x - 20, y - 70, `P${playerIndex}`, { 
      fontSize: '12px', 
      fill: '#fff' 
    });
    this.bulletText = this.scene.add.text(x - 20, y - 55, `Ammo: ${this.currentBullets}`, { 
      fontSize: '12px', 
      fill: '#fff' 
    });
    this.healthBar = this.scene.add.graphics();
  }

  initializeStateMachine() {
    this.stateMachine = new StateMachine(this)
      .addState(new IdleState())
      .addState(new SprintState());
    this.stateMachine.setState('idle');
  }

  update(delta) {
    this.stateMachine.update(delta);
    this.updateHUD();
  }

  updateMovement() {
    if (!this.keys) {
      this.setupControls();
    }

    const delta = this.scene.game.loop.delta / 1000;
    let vx = 0, vy = 0;

    if (this.keys.left.isDown) vx = -this.speed;
    else if (this.keys.right.isDown) vx = this.speed;
    if (this.keys.up.isDown) vy = -this.speed;
    else if (this.keys.down.isDown) vy = this.speed;

    if (vx !== 0 || vy !== 0) {
      let mag = Math.sqrt(vx*vx + vy*vy);
      this.lastFacing.x = vx/mag;
      this.lastFacing.y = vy/mag;
    }

    this.sprite.x += vx * delta;
    this.sprite.y += vy * delta;
    this.clampToArena();
  }

  setupControls() {
    const keyMaps = [
      {
        left: 'LEFT',
        right: 'RIGHT',
        up: 'UP',
        down: 'DOWN',
        sprint: 'SHIFT',
        melee1: 'SPACE',
        melee2: 'Q',
        projectile: 'E'
      },
      {
        left: 'A',
        right: 'D',
        up: 'W',
        down: 'S',
        sprint: 'CONTROL',
        melee1: 'F',
        melee2: 'G',
        projectile: 'H'
      }
    ];

    const keyMap = keyMaps[this.playerIndex] || keyMaps[0];
    this.keys = this.scene.input.keyboard.addKeys(keyMap);
  }

  checkAttackInputs() {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastAttackTime > this.attackCooldown && this.currentBullets > 0) {
      if (this.keys.melee1.isDown) {
        this.meleeAttackRegular();
        this.lastAttackTime = currentTime;
      } else if (this.keys.melee2.isDown) {
        this.meleeAttackSpin();
        this.lastAttackTime = currentTime;
      } else if (this.keys.projectile.isDown) {
        this.projectileAttack();
        this.lastAttackTime = currentTime;
      }
    }
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
    let healthPercent = Phaser.Math.Clamp(this.health/GAME_CONFIG.player.MAX_HEALTH, 0, 1);
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 80, barWidth, barHeight);
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 80, barWidth * healthPercent, barHeight);
    if (this.shield > 0) {
      this.healthBar.lineStyle(4, 0x0000ff, 1);
      this.healthBar.strokeCircle(this.sprite.x, this.sprite.y, 30);
    }
  }

  meleeAttackRegular() {
    if (this.currentBullets <= 0) return;
    this.currentBullets--;
    this.scene.spawnMeleeAttack(this.sprite.x, this.sprite.y, "regular", this);
  }

  meleeAttackSpin() {
    if (this.currentBullets <= 0) return;
    this.currentBullets--;
    this.scene.spawnMeleeAttack(this.sprite.x, this.sprite.y, "spin", this);
  }

  projectileAttack() {
    if (this.currentBullets <= 0) return;
    this.currentBullets--;
    this.scene.spawnProjectileAttack(this.sprite.x, this.sprite.y, this, this.lastFacing.x, this.lastFacing.y);
  }

  clampToArena() {
    let dx = this.sprite.x - ARENA_CENTER.x;
    let dy = this.sprite.y - ARENA_CENTER.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > ARENA_RADIUS) {
      this.sprite.x = ARENA_CENTER.x + (dx/dist) * ARENA_RADIUS;
      this.sprite.y = ARENA_CENTER.y + (dy/dist) * ARENA_RADIUS;
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
