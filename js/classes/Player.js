import { PLAYER_SPEED, ARENA_CENTER, ARENA_RADIUS } from '../helpers.js';
import { GODS, GOD_CONFIG } from '../helpers.js';
import { State, StateMachine } from './StateMachine.js';
import GAME_CONFIG from '../config/gameConfig.js';

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
    // Choose a random god from the list.
    this.god = Phaser.Utils.Array.GetRandom(GODS).name;
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
    this.speed = PLAYER_SPEED;
    if (this.god === "Hades") {
      this.sprite = scene.add.sprite(x, y, "circle_hades");
    } else {
      this.sprite = scene.add.sprite(x, y, "poly_" + shapeSides);
    }
    this.sprite.setScale(0.5);
    this.sprite.setTint(GOD_CONFIG[this.god].zoneColor);
    this.nameText = scene.add.text(x - 20, y - 70, "P" + playerIndex + ": " + this.god, { fontSize: '12px', fill: '#fff' });
    this.bulletText = scene.add.text(x - 20, y - 55, "Ammo: " + this.currentBullets, { fontSize: '12px', fill: '#fff' });
    this.healthBar = scene.add.graphics();
    this.gamepad = null;
    this.keys = null;
    this.lastAttackTime = 0;
    this.attackCooldown = 500;
    this.lastFacing = { x: 1, y: 0 };
    this.initializeStateMachine();
  }

  initializeStateMachine() {
    this.stateMachine = new StateMachine(this)
      .addState(new IdleState())
      .addState(new SprintState());
    this.stateMachine.setState('idle');
  }

  update() {
    this.stateMachine.update();
    this.updateHUD();
    this.updateHealthBar();
  }

  updateHUD() {
    const delta = this.scene.game.loop.delta;
    const deltaTime = delta / 1000;
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastReloadTime > this.reloadRate && this.currentBullets < this.maxBullets) {
      this.currentBullets++;
      this.lastReloadTime = currentTime;
    }
    if (currentTime - this.lastShieldReloadTime > this.shieldReloadRate && this.shield < this.maxShield) {
      this.shield++;
      this.lastShieldReloadTime = currentTime;
    }
    this.bulletText.setText("Ammo: " + this.currentBullets);
    this.bulletText.setPosition(this.sprite.x - 20, this.sprite.y - 55);
    
    this.nameText.setText("P" + this.playerIndex + ": " + this.god);
    this.nameText.setPosition(this.sprite.x - 20, this.sprite.y - 70);
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

  updateMovement() {
    const delta = this.scene.game.loop.delta;
    const deltaTime = delta / 1000;
    const currentTime = this.scene.time.now;
    if (!this.gamepad) {
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
        } else if (this.playerIndex === 2) {
          this.keys = this.scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.J,
            right: Phaser.Input.Keyboard.KeyCodes.L,
            up: Phaser.Input.Keyboard.KeyCodes.I,
            down: Phaser.Input.Keyboard.KeyCodes.K,
            sprint: Phaser.Input.Keyboard.KeyCodes.U,
            melee1: Phaser.Input.Keyboard.KeyCodes.O,
            melee2: Phaser.Input.Keyboard.KeyCodes.P,
            projectile: Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET
          });
        } else if (this.playerIndex === 3) {
          this.keys = this.scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.NUMPAD_4,
            right: Phaser.Input.Keyboard.KeyCodes.NUMPAD_6,
            up: Phaser.Input.Keyboard.KeyCodes.NUMPAD_8,
            down: Phaser.Input.Keyboard.KeyCodes.NUMPAD_2,
            sprint: Phaser.Input.Keyboard.KeyCodes.NUMPAD_0,
            melee1: Phaser.Input.Keyboard.KeyCodes.NUMPAD_1,
            melee2: Phaser.Input.Keyboard.KeyCodes.NUMPAD_3,
            projectile: Phaser.Input.Keyboard.KeyCodes.NUMPAD_5
          });
        }
      }
      let vx = 0, vy = 0;
      if (this.keys.left.isDown) { vx = -this.speed; }
      else if (this.keys.right.isDown) { vx = this.speed; }
      if (this.keys.up.isDown) { vy = -this.speed; }
      else if (this.keys.down.isDown) { vy = this.speed; }
      if (this.keys.sprint.isDown) { vx *= 1.5; vy *= 1.5; }
      if (vx !== 0 || vy !== 0) {
        let mag = Math.sqrt(vx*vx + vy*vy);
        this.lastFacing.x = vx/mag;
        this.lastFacing.y = vy/mag;
      }
      this.sprite.x += vx * deltaTime;
      this.sprite.y += vy * deltaTime;
      if (this.keys.melee1.isDown && (currentTime - this.lastAttackTime > this.attackCooldown) && this.currentBullets > 0) {
        this.meleeAttackRegular();
        this.lastAttackTime = currentTime;
      }
      if (this.keys.melee2.isDown && (currentTime - this.lastAttackTime > this.attackCooldown) && this.currentBullets > 0) {
        this.meleeAttackSpin();
        this.lastAttackTime = currentTime;
      }
      if (this.keys.projectile.isDown && (currentTime - this.lastAttackTime > this.attackCooldown) && this.currentBullets > 0) {
        this.projectileAttack();
        this.lastAttackTime = currentTime;
      }
    } else {
      let axisH = (this.gamepad.axes.length > 0) ? this.gamepad.axes[0].getValue() : 0;
      let axisV = (this.gamepad.axes.length > 1) ? this.gamepad.axes[1].getValue() : 0;
      let vx = axisH * this.speed;
      let vy = axisV * this.speed;
      if (this.gamepad.buttons[0].pressed) { vx *= 1.5; vy *= 1.5; }
      if (Math.abs(axisH) > 0.1 || Math.abs(axisV) > 0.1) {
        let mag = Math.sqrt(axisH*axisH + axisV*axisV);
        this.lastFacing.x = axisH/mag;
        this.lastFacing.y = axisV/mag;
      }
      this.sprite.x += vx * deltaTime;
      this.sprite.y += vy * deltaTime;
      if (currentTime - this.lastAttackTime > this.attackCooldown && this.currentBullets > 0) {
        if (this.gamepad.buttons[1].pressed) {
          this.meleeAttackRegular();
          this.lastAttackTime = currentTime;
        } else if (this.gamepad.buttons[2].pressed) {
          this.meleeAttackSpin();
          this.lastAttackTime = currentTime;
        } else if (this.gamepad.buttons[3].pressed) {
          this.projectileAttack();
          this.lastAttackTime = currentTime;
        }
      }
    }
    // Clamp within arena.
    let dx = this.sprite.x - ARENA_CENTER.x;
    let dy = this.sprite.y - ARENA_CENTER.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > ARENA_RADIUS) {
      this.sprite.x = ARENA_CENTER.x + (dx/dist) * ARENA_RADIUS;
      this.sprite.y = ARENA_CENTER.y + (dy/dist) * ARENA_RADIUS;
    }
    this.sprite.rotation = Math.atan2(this.lastFacing.y, this.lastFacing.x) + Math.PI/2;
    this.nameText.setText("P" + this.playerIndex + ": " + this.god);
    this.nameText.setPosition(this.sprite.x - 20, this.sprite.y - 70);
  }

  checkAttackInputs() {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastAttackTime > this.attackCooldown && this.currentBullets > 0) {
      if (this.keys && this.keys.melee1.isDown) {
        this.meleeAttackRegular();
        this.lastAttackTime = currentTime;
      } else if (this.keys && this.keys.melee2.isDown) {
        this.meleeAttackSpin();
        this.lastAttackTime = currentTime;
      } else if (this.keys && this.keys.projectile.isDown) {
        this.projectileAttack();
        this.lastAttackTime = currentTime;
      } else if (this.gamepad && this.gamepad.buttons[1].pressed) {
        this.meleeAttackRegular();
        this.lastAttackTime = currentTime;
      } else if (this.gamepad && this.gamepad.buttons[2].pressed) {
        this.meleeAttackSpin();
        this.lastAttackTime = currentTime;
      } else if (this.gamepad && this.gamepad.buttons[3].pressed) {
        this.projectileAttack();
        this.lastAttackTime = currentTime;
      }
    }
  }

  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
    this.bulletText.destroy();
    this.healthBar.destroy();
  }
}
