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
    this.god = Phaser.Utils.Array.GetRandom(GODS).name;
    
    // Get config from god
    let cfg = GOD_CONFIG[this.god];
    this.maxHealth = cfg.health;
    this.health = cfg.health;
    this.damage = cfg.damage;
    this.maxShield = cfg.shield;
    this.shield = cfg.shield;
    this.maxBullets = cfg.bullets;
    this.currentBullets = cfg.bullets;
    this.reloadRate = cfg.bulletReload;
    this.shieldReloadRate = cfg.shieldReload;
    
    // Combat timers
    this.lastReloadTime = 0;
    this.lastShieldReloadTime = 0;
    this.lastAttackTime = 0;
    this.attackCooldown = 500;
    
    // Movement
    this.speed = PLAYER_SPEED;
    this.lastFacing = { x: 1, y: 0 };
    
    // Sprite setup
    if (this.god === "Hades") {
      this.sprite = scene.add.sprite(x, y, "circle_hades");
    } else {
      this.sprite = scene.add.sprite(x, y, "poly_" + shapeSides);
    }
    this.sprite.setScale(0.5);
    this.sprite.setTint(GOD_CONFIG[this.god].zoneColor);
    
    // UI elements
    this.nameText = scene.add.text(x - 20, y - 70, "P" + playerIndex + ": " + this.god, 
      { fontSize: '12px', fill: '#fff' });
    this.bulletText = scene.add.text(x - 20, y - 55, "Ammo: " + this.currentBullets, 
      { fontSize: '12px', fill: '#fff' });
    this.healthBar = scene.add.graphics();
    
    // Input setup
    this.gamepad = null;
    this.keys = null;

    // Define button mappings
    this.BUTTONS = {
      A: 0,
      B: 1,
      X: 2,
      Y: 3
    };

    // Gamepad setup
    this.scene.input.gamepad.on('connected', (pad) => {
      if (pad.index === this.playerIndex) {
        console.log(`Gamepad ${pad.index} connected`);
        this.gamepad = pad;
      }
    });

    this.scene.input.gamepad.on('disconnected', (pad) => {
      if (pad.index === this.playerIndex) {
        console.log(`Gamepad ${pad.index} disconnected`);
        this.gamepad = null;
      }
    });
  }

  update() {
    const delta = this.scene.game.loop.delta;
    const deltaTime = delta / 1000;
    const currentTime = this.scene.time.now;

    // Reload logic
    if (currentTime - this.lastReloadTime > this.reloadRate && this.currentBullets < this.maxBullets) {
      this.currentBullets++;
      this.lastReloadTime = currentTime;
    }
    if (currentTime - this.lastShieldReloadTime > this.shieldReloadRate && this.shield < this.maxShield) {
      this.shield++;
      this.lastShieldReloadTime = currentTime;
    }

    // Input handling
    if (this.gamepad) {
      // Gamepad movement
      const leftStick = this.gamepad.leftStick;
      const deadzone = 0.2;
      let vx = Math.abs(leftStick.x) > deadzone ? leftStick.x : 0;
      let vy = Math.abs(leftStick.y) > deadzone ? leftStick.y : 0;

      if (vx !== 0 || vy !== 0) {
        const speed = this.gamepad.buttons[this.BUTTONS.A].pressed ? this.speed * 1.5 : this.speed;
        this.sprite.x += vx * speed * deltaTime;
        this.sprite.y += vy * speed * deltaTime;
        this.lastFacing.x = vx;
        this.lastFacing.y = vy;
      }

      // Gamepad attacks
      if (currentTime - this.lastAttackTime > this.attackCooldown && this.currentBullets > 0) {
        if (this.gamepad.buttons[this.BUTTONS.B].pressed) {
          this.meleeAttackRegular();
          this.lastAttackTime = currentTime;
        } else if (this.gamepad.buttons[this.BUTTONS.X].pressed) {
          this.meleeAttackSpin();
          this.lastAttackTime = currentTime;
        } else if (this.gamepad.buttons[this.BUTTONS.Y].pressed) {
          this.projectileAttack();
          this.lastAttackTime = currentTime;
        }
      }
    } else {
      if (!this.keys) {
        if (this.playerIndex === 0) {
          this.keys = this.scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            melee1: Phaser.Input.Keyboard.KeyCodes.SPACE,
            melee2: Phaser.Input.Keyboard.KeyCodes.Q,
            projectile: Phaser.Input.Keyboard.KeyCodes.E
          });
        } else if (this.playerIndex === 1) {
          this.keys = this.scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            sprint: Phaser.Input.Keyboard.KeyCodes.CONTROL,
            melee1: Phaser.Input.Keyboard.KeyCodes.F,
            melee2: Phaser.Input.Keyboard.KeyCodes.G,
            projectile: Phaser.Input.Keyboard.KeyCodes.H
          });
        }
      }

      let vx = 0, vy = 0;
      if (this.keys.left.isDown) vx = -1;
      if (this.keys.right.isDown) vx = 1;
      if (this.keys.up.isDown) vy = -1;
      if (this.keys.down.isDown) vy = 1;

      if (vx !== 0 || vy !== 0) {
        const mag = Math.sqrt(vx * vx + vy * vy);
        const speed = this.keys.sprint.isDown ? this.speed * 1.5 : this.speed;
        this.sprite.x += (vx / mag) * speed * deltaTime;
        this.sprite.y += (vy / mag) * speed * deltaTime;
        this.lastFacing.x = vx / mag;
        this.lastFacing.y = vy / mag;
      }

      if (currentTime - this.lastAttackTime > this.attackCooldown) {
        if (this.keys.melee1.isDown && this.currentBullets > 0) {
          this.meleeAttackRegular();
          this.lastAttackTime = currentTime;
        }
        if (this.keys.melee2.isDown && this.currentBullets > 0) {
          this.meleeAttackSpin();
          this.lastAttackTime = currentTime;
        }
        if (this.keys.projectile.isDown && this.currentBullets > 0) {
          this.projectileAttack();
          this.lastAttackTime = currentTime;
        }
      }
    }

    // Update UI and bounds
    this.clampToArena();
    this.updateHUD();
  }

  updateHUD() {
    this.nameText.setPosition(this.sprite.x - 20, this.sprite.y - 70);
    this.bulletText.setPosition(this.sprite.x - 20, this.sprite.y - 55);
    this.bulletText.setText("Ammo: " + this.currentBullets);
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    const barWidth = 40, barHeight = 6;
    let healthPercent = Phaser.Math.Clamp(this.health/this.maxHealth, 0, 1);
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 80, barWidth, barHeight);
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(this.sprite.x - barWidth/2, this.sprite.y - 80, barWidth * healthPercent, barHeight);
    if (this.shield > 0) {
      this.healthBar.lineStyle(4, 0x0000ff, 1);
      this.healthBar.strokeCircle(this.sprite.x, this.sprite.y, 30);
    }
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

  meleeAttackRegular() {
    if (this.currentBullets <= 0) return;
    this.currentBullets--;
    this.scene.spawnMeleeAttackHitbox(
      this.sprite.x, 
      this.sprite.y, 
      80,  // width
      40,  // height
      Math.atan2(this.lastFacing.y, this.lastFacing.x), // rotation
      this.damage * 1.2, // damage
      this // shooter
    );
  }

  meleeAttackSpin() {
    if (this.currentBullets <= 0) return;
    this.currentBullets--;
    this.scene.spawnMeleeAttackHitbox(
      this.sprite.x, 
      this.sprite.y, 
      120, // diameter (width/height for circle)
      120, 
      0,   // rotation for spin
      this.damage * 0.7, // damage
      this // shooter
    );
  }

  projectileAttack() {
    if (this.currentBullets <= 0) return;
    this.currentBullets--;
    this.scene.spawnProjectileAttack(this.sprite.x, this.sprite.y, this, this.lastFacing.x, this.lastFacing.y);
  }
}
