import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, ARENA_CENTER, ARENA_RADIUS, PLAYER_SPEED } from '../helpers.js';
import { createPolygonTexture, createCircleTexture } from '../helpers.js';
import { GODS, GOD_CONFIG } from '../helpers.js';
import Player from '../classes/Player.js';
import Enemy from '../classes/Enemy.js';
import ProjectileAttack from '../classes/ProjectileAttack.js';
import MeleeAttack from '../classes/MeleeAttack.js';
import PieZone from '../classes/PieZone.js';
import PowerUp from '../classes/PowerUp.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }
  
  preload() {
    // Generate polygon textures for non-Hades (3 to 14 sides).
    for (let sides = 3; sides <= 14; sides++) {
      let key = "poly_" + sides;
      createPolygonTexture(this, key, sides, 32, 0xffffff);
    }
    // Generate a circular texture for Hades.
    createCircleTexture(this, "circle_hades", 32, 0xffffff);
    // Create a placeholder projectile texture.
    let projGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    projGraphics.fillStyle(0xffffff, 1);
    projGraphics.fillRect(0, 0, 16, 16);
    projGraphics.generateTexture("projectile", 16, 16);
    projGraphics.destroy();
    
    // Optionally load audio assets:
    // this.load.audio('bgMusic', 'assets/audio/bgMusic.mp3');
    
    // Initialize EasyStar.js for pathfinding.
    this.easyStar = new EasyStar.js();
    const gridCols = 48, gridRows = 36;
    const grid = [];
    for (let y = 0; y < gridRows; y++) {
      const col = [];
      for (let x = 0; x < gridCols; x++) {
        // Create obstacles in a defined area.
        if (x >= 20 && x <= 25 && y >= 10 && y <= 30) {
          col.push(1);
        } else {
          col.push(0);
        }
      }
      grid.push(col);
    }
    this.easyStar.setGrid(grid);
    this.easyStar.setAcceptableTiles([0]);
    // Expose easyStar globally so Enemy AI can use it.
    window.easyStar = this.easyStar;
  }
  
  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    ARENA_CENTER.x = GAME_WIDTH / 2;
    ARENA_CENTER.y = GAME_HEIGHT / 2;
    
    // Background music setup (if audio loaded).
    // let music = this.sound.add('bgMusic');
    // music.play({ loop: true });
    
    // Create the GodLight title (fixed to camera).
    let asciiArt =
`                  _ _ _       _     _   
                 | | (_)     | |   | |  
   __ _  ___   __| | |_  __ _| |__ | |_ 
  / _\` |/ _ \\ / _\` | | |/ _\` | '_ \\| __|
 | (_| | (_) | (_| | | | (_| | | | | |_ 
  \\__, |\\___/ \\__,_|_|_|\\__, |_| |_|\\__|
   __/ |                 __/ |          
  |___/                 |___/           `;
    let titleText = this.add.text(GAME_WIDTH/2 - 300, 10, asciiArt, {
      fontFamily: 'monospace',
      fontSize: '20px',
      fill: '#fff'
    });
    titleText.setDepth(1000);
    titleText.setScrollFactor(0);
    
    // Create a dedicated HUD panel at the bottom.
    this.hudPanel = this.add.rectangle(10, GAME_HEIGHT - 100, GAME_WIDTH - 20, 90, 0x000000, 0.5)
      .setOrigin(0, 0)
      .setDepth(1000);
    this.hudText = this.add.text(20, GAME_HEIGHT - 90, "", { fontSize: '16px', fill: '#fff' })
      .setDepth(1000);
    
    // Create central Hades realm.
    this.hadesCircle = this.add.circle(ARENA_CENTER.x, ARENA_CENTER.y, 75, GOD_CONFIG["Hades"].zoneColor, 0.5);
    
    // Create pie zones for gods except Hades.
    this.pieZones = [];
    let centerX = ARENA_CENTER.x, centerY = ARENA_CENTER.y;
    let godsForZones = GODS.filter(g => g.name !== "Hades");
    const numZones = godsForZones.length;
    for (let i = 0; i < numZones; i++) {
      let startAngle = i * (2*Math.PI/numZones);
      let endAngle = (i+1) * (2*Math.PI/numZones);
      let god = godsForZones[i].name;
      let zoneColor = GOD_CONFIG[god] ? GOD_CONFIG[god].zoneColor : 0xffffff;
      let zone = new PieZone(this, centerX, centerY, ARENA_RADIUS, startAngle, endAngle, god, zoneColor);
      this.pieZones.push(zone);
    }
    
    // Initialize arrays.
    this.meleeAttacks = [];
    this.projectiles = [];
    this.powerUps = [];
    
    // Spawn 13 combatants (players and enemies).
    this.players = [];
    this.enemies = [];
    let nonHadesIndex = 0;
    for (let i = 0; i < GODS.length; i++) {
      let godName = GODS[i].name;
      let spawnX, spawnY;
      if (godName === "Hades") {
        let angle = Phaser.Math.FloatBetween(0, 2*Math.PI);
        let r = Phaser.Math.FloatBetween(0, 75);
        spawnX = ARENA_CENTER.x + r * Math.cos(angle);
        spawnY = ARENA_CENTER.y + r * Math.sin(angle);
      } else {
        let zone = this.pieZones.find(z => z.god === godName);
        if (zone) {
          let angle = Phaser.Math.FloatBetween(zone.startAngle, zone.endAngle);
          let r = Phaser.Math.FloatBetween(0, zone.radius * 0.8);
          spawnX = zone.centerX + r * Math.cos(angle);
          spawnY = zone.centerY + r * Math.sin(angle);
        } else {
          spawnX = Phaser.Math.Between(50, GAME_WIDTH - 50);
          spawnY = Phaser.Math.Between(50, GAME_HEIGHT - 50);
        }
      }
      if (i < 4) {
        let shapeSides = (godName === "Hades") ? 0 : (3 + nonHadesIndex++);
        let player = new Player(this, spawnX, spawnY, i, shapeSides);
        player.god = godName;
        if (godName === "Hades") {
          player.sprite.setTexture("circle_hades");
        } else {
          player.sprite.setTexture("poly_" + shapeSides);
        }
        player.homeZone = (godName === "Hades") ? this.hadesCircle : this.pieZones.find(z => z.god === godName);
        let cfg = GOD_CONFIG[godName];
        player.maxHealth = cfg.health;
        player.health = cfg.health;
        player.damage = cfg.damage;
        player.maxShield = cfg.shield;
        player.shield = cfg.shield;
        player.maxBullets = cfg.bullets;
        player.currentBullets = cfg.bullets;
        this.players.push(player);
      } else {
        let shapeSides = (godName === "Hades") ? 0 : (3 + nonHadesIndex++);
        let enemy = new Enemy(this, spawnX, spawnY, i, shapeSides);
        enemy.god = godName;
        if (godName === "Hades") {
          enemy.sprite.setTexture("circle_hades");
        } else {
          enemy.sprite.setTexture("poly_" + shapeSides);
        }
        enemy.homeZone = this.pieZones.find(z => z.god === godName);
        let cfg = GOD_CONFIG[godName];
        enemy.maxHealth = cfg.health;
        enemy.health = cfg.health;
        enemy.damage = cfg.damage;
        enemy.maxShield = cfg.shield;
        enemy.shield = cfg.shield;
        enemy.maxBullets = cfg.bullets;
        enemy.currentBullets = cfg.bullets;
        this.enemies.push(enemy);
      }
    }
    
    // Spawn power-ups inside the arena.
    this.time.addEvent({
      delay: 15000,
      callback: () => {
        let angle = Phaser.Math.FloatBetween(0, 2*Math.PI);
        let r = Math.sqrt(Math.random()) * ARENA_RADIUS;
        let puX = ARENA_CENTER.x + r * Math.cos(angle);
        let puY = ARENA_CENTER.y + r * Math.sin(angle);
        // Alternate power-up types.
        let type = (Math.random() < 0.5) ? "shield" : "extraSpeed";
        let powerUp = new PowerUp(this, puX, puY, type);
        this.powerUps.push(powerUp);
      },
      loop: true
    });
    
    // Add help icon.
    this.helpIcon = this.add.text(GAME_WIDTH - 30, 10, "?", { fontSize: '24px', fill: '#fff' });
    this.helpIcon.setInteractive();
    this.helpIcon.on('pointerdown', () => {
      if (this.scene.isActive('HelpScene')) {
        this.scene.stop('HelpScene');
      } else {
        this.scene.launch('HelpScene', { previousScene: 'MainScene' });
      }
    });
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === '?') {
        if (this.scene.isActive('HelpScene')) {
          this.scene.stop('HelpScene');
        } else {
          this.scene.launch('HelpScene', { previousScene: 'MainScene' });
        }
      }
    });
    
    // Gamepad assignment.
    if (this.input.gamepad.total > 0) {
      this.input.gamepad.gamepads.forEach((pad, idx) => {
        if (this.players[idx] && !this.players[idx].gamepad) {
          this.players[idx].gamepad = pad;
        }
      });
    }
    this.input.gamepad.on('connected', (pad) => {
      this.players.forEach((player, idx) => {
        if (!player.gamepad && this.input.gamepad.gamepads[idx]) {
          player.gamepad = this.input.gamepad.gamepads[idx];
        }
      });
    });
    
    // Create a minimap camera in the upper-left corner.
    this.minimap = this.cameras.add(10, 10, 200, 150).setZoom(200/GAME_WIDTH).setBackgroundColor(0x111111);
    
    /* 
      Additional Suggestions for More Dynamic Play:
      
      - Implement split-screen mode by creating separate cameras for each local player.
      - Expand enemy AI by refining state machines (e.g., for smarter patrol and evasive maneuvers).
      - Integrate networked multiplayer support (using WebSockets) for remote play.
      - Replace placeholder textures with high-quality assets and add smooth animations.
      - Enhance particle effects and sound effects to improve visual and audio feedback.
      - Refactor code into more modules (e.g., separate UI/HUD, AI, and physics systems) to boost performance.
      - Introduce customizable god abilities and curse modifiers for deeper strategic gameplay.
    */
  }
  
  spawnMeleeAttack(x, y, attackType, shooter) {
    let offset = 0, width = 0, height = 0, damageMultiplier = 1;
    if (attackType === "regular") {
      offset = 20; width = 30; height = 20; damageMultiplier = 1;
    } else if (attackType === "spin") {
      offset = 0; width = 50; height = 50; damageMultiplier = 0.7;
    }
    let attackX = x, attackY = y;
    if (offset > 0) {
      attackX = x + shooter.lastFacing.x * offset;
      attackY = y + shooter.lastFacing.y * offset;
    }
    let rotation = (attackType === "spin") ? 0 : Math.atan2(shooter.lastFacing.y, shooter.lastFacing.x);
    this.spawnMeleeAttackHitbox(attackX, attackY, width, height, rotation, shooter.damage * damageMultiplier, shooter);
  }
  
  spawnMeleeAttackHitbox(x, y, width, height, rotation, damage, shooter) {
    let melee = new MeleeAttack(this, x, y, width, height, rotation, damage, shooter);
    this.meleeAttacks.push(melee);
  }
  
  spawnProjectileAttack(x, y, shooter, dirX, dirY) {
    let speed = 500;
    let mag = Math.sqrt(dirX*dirX + dirY*dirY);
    if (mag === 0) { dirX = shooter.lastFacing.x; dirY = shooter.lastFacing.y; }
    else { dirX /= mag; dirY /= mag; }
    let velX = dirX * speed, velY = dirY * speed;
    let damage = shooter.damage * 1.2;
    let projectile = new ProjectileAttack(this, x, y, "projectile", velX, velY, damage, shooter);
    this.projectiles.push(projectile);
  }
  
  updateProjectileAttacks(delta) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let proj = this.projectiles[i];
      if (!proj.update(delta)) {
        this.projectiles.splice(i, 1);
      } else {
        let allTargets = this.players.concat(this.enemies);
        for (let target of allTargets) {
          if (target !== proj.owner &&
              Phaser.Geom.Intersects.RectangleToRectangle(proj.getBounds(), target.sprite.getBounds())) {
            let dmg = proj.damage;
            if (target.shield > 0) {
              let remainder = dmg - target.shield;
              target.shield = Math.max(0, target.shield - dmg);
              if (remainder > 0) {
                target.health = Math.max(0, target.health - remainder);
              }
            } else {
              target.health = Math.max(0, target.health - dmg);
            }
            proj.destroy();
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }
  
  updatePowerUps(delta) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      let pu = this.powerUps[i];
      if (!pu.update(delta)) {
        this.powerUps.splice(i, 1);
      } else {
        this.players.forEach(player => {
          if (Phaser.Geom.Intersects.RectangleToRectangle(pu.getBounds(), player.sprite.getBounds())) {
            // Apply power-up effect based on type.
            if (pu.type === "shield") {
              player.shield += 20;
            } else if (pu.type === "extraSpeed") {
              player.speed = PLAYER_SPEED * 1.5;
              this.time.delayedCall(5000, () => { player.speed = PLAYER_SPEED; });
            }
            pu.destroy();
            this.powerUps.splice(i, 1);
          }
        });
      }
    }
  }
  
  update(time, delta) {
    this.pieZones.forEach(zone => zone.updateDisplay(this.players));
    this.hadesCircle.setPosition(ARENA_CENTER.x, ARENA_CENTER.y);
    
    for (let i = this.meleeAttacks.length - 1; i >= 0; i--) {
      let attack = this.meleeAttacks[i];
      if (!attack.update(delta)) {
        this.meleeAttacks.splice(i, 1);
      } else {
        let allTargets = this.players.concat(this.enemies);
        let hitSomething = false;
        allTargets.forEach(target => {
          if (target !== attack.owner &&
              Phaser.Geom.Intersects.RectangleToRectangle(attack.getBounds(), target.sprite.getBounds())) {
            let dmg = attack.damage;
            if (target.shield > 0) {
              let remainder = dmg - target.shield;
              target.shield = Math.max(0, target.shield - dmg);
              if (remainder > 0) { target.health = Math.max(0, target.health - remainder); }
            } else {
              target.health = Math.max(0, target.health - dmg);
            }
            hitSomething = true;
          }
        });
        if (hitSomething) {
          attack.destroy();
          this.meleeAttacks.splice(i, 1);
        }
      }
    }
    
    this.updateProjectileAttacks(delta);
    this.updatePowerUps(delta);
    
    for (let i = this.players.length - 1; i >= 0; i--) {
      let player = this.players[i];
      player.update();
      if (player.health <= 0) {
        player.destroy();
        this.players.splice(i, 1);
      }
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let enemy = this.enemies[i];
      enemy.update(time, delta);
      if (enemy.health <= 0) {
        enemy.sprite.destroy();
        enemy.nameText.destroy();
        enemy.healthBar.destroy();
        this.enemies.splice(i, 1);
      }
    }
    
    let allChars = this.players.concat(this.enemies);
    let hudInfo = "Combatants Left:\n";
    allChars.forEach((char, idx) => {
      let label = (char.playerIndex !== undefined) ? ("P" + char.playerIndex + ": " + char.god)
                                                   : ("E" + idx + ": " + char.god);
      hudInfo += label + " - HP: " + char.health + " | Shield: " + char.shield + " | Ammo: " + char.currentBullets + "\n";
    });
    this.hudText.setText(hudInfo);
    
    if (allChars.length > 0) {
      let uniqueGods = new Set(allChars.map(ch => ch.god));
      if (uniqueGods.size === 1) {
        this.scene.start('WinScene', { god: Array.from(uniqueGods)[0] });
      }
    }
  }
}
