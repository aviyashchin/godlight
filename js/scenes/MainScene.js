// js/scenes/MainScene.js
import { GAME_WIDTH, GAME_HEIGHT, ARENA_CENTER, ARENA_RADIUS, PLAYER_SPEED, ENEMY_SPEED } from '../helpers.js';
import { createPolygonTexture, createCircleTexture } from '../helpers.js';
import { GODS, GOD_CONFIG } from '../helpers.js';
import Player from '../classes/Player.js';
import Enemy from '../classes/Enemy.js';
import ProjectileAttack from '../classes/ProjectileAttack.js';
import MeleeAttack from '../classes/MeleeAttack.js';
import PieZone from '../classes/PieZone.js';
import PowerUp from '../classes/PowerUp.js';
import CurseManager from '../classes/CurseManager.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }
  
  preload() {
    // Generate textures.
    for (let sides = 3; sides <= 14; sides++) {
      let key = "poly_" + sides;
      createPolygonTexture(this, key, sides, 32, 0xffffff);
    }
    createCircleTexture(this, "circle_hades", 32, 0xffffff);
    let projGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    projGraphics.fillStyle(0xffffff, 1);
    projGraphics.fillRect(0, 0, 16, 16);
    projGraphics.generateTexture("projectile", 16, 16);
    projGraphics.destroy();
    
    // Load audio assets.
    this.load.audio('bgMusic', 'assets/audio/bgMusic.mp3');
    this.load.audio('lightningSound', 'assets/audio/lightning.mp3');
    
    // Initialize EasyStar for pathfinding.
    this.easyStar = new EasyStar.js();
    const gridCols = 48, gridRows = 36;
    const grid = [];
    for (let y = 0; y < gridRows; y++) {
      const col = [];
      for (let x = 0; x < gridCols; x++) {
        col.push((x >= 20 && x <= 25 && y >= 10 && y <= 30) ? 1 : 0);
      }
      grid.push(col);
    }
    this.easyStar.setGrid(grid);
    this.easyStar.setAcceptableTiles([0]);
    window.easyStar = this.easyStar;
  }
  
  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    this.curseManager = new CurseManager(this, this.pieZones);

    ARENA_CENTER.x = GAME_WIDTH / 2;
    ARENA_CENTER.y = GAME_HEIGHT / 2;
    
    // Start background music.
    let music = this.sound.add('bgMusic');
    music.play({ loop: true });
    
    // Create the title.
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
    
    // Create a global HUD (fallback if no split-screen).
    this.hudText = this.add.text(20, GAME_HEIGHT - 90, "", { fontSize: '16px', fill: '#fff' })
      .setDepth(1000);
    
    // Create central Hades realm and pie zones.
    this.hadesCircle = this.add.circle(ARENA_CENTER.x, ARENA_CENTER.y, 75, GOD_CONFIG["Hades"].zoneColor, 0.5);
    this.pieZones = [];
    let godsForZones = GODS.filter(g => g.name !== "Hades");
    const numZones = godsForZones.length;
    for (let i = 0; i < numZones; i++) {
      let startAngle = i * (2*Math.PI/numZones);
      let endAngle = (i+1) * (2*Math.PI/numZones);
      let god = godsForZones[i].name;
      let zoneColor = GOD_CONFIG[god] ? GOD_CONFIG[god].zoneColor : 0xffffff;
      let zone = new PieZone(this, ARENA_CENTER.x, ARENA_CENTER.y, ARENA_RADIUS, startAngle, endAngle, god, zoneColor);
      this.pieZones.push(zone);
    }
    
    // Initialize arrays for attacks, power-ups, and combatants.
    this.meleeAttacks = [];
    this.projectiles = [];
    this.powerUps = [];
    // --- Create Combatants ---
    // For testing, create exactly 2 players and the remaining as enemies.
    this.players = [];
    this.enemies = [];
    // Create 2 players for local two-player mode.
    for (let i = 0; i < 2; i++) {
      // For simplicity, we choose a god from GODS (or assign a default god)
      let godName = GODS[i].name; // Use first 2 gods for players
      // Spawn at different positions.
      let spawnX = ARENA_CENTER.x + (i === 0 ? -100 : 100);
      let spawnY = ARENA_CENTER.y;
      let shapeSides = (godName === "Hades") ? 0 : (3 + i);
      let player = new Player(this, spawnX, spawnY, i, shapeSides);
      player.god = godName;
      player.sprite.setTexture(godName === "Hades" ? "circle_hades" : "poly_" + shapeSides);
      // Assign each player a home zone from the pieZones (or fallback to hadesCircle)
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
    }
    // Create the rest as enemies (if desired, or skip for testing).
    for (let i = 2; i < GODS.length; i++) {
      let godName = GODS[i].name;
      let spawnX = Phaser.Math.Between(50, GAME_WIDTH - 50);
      let spawnY = Phaser.Math.Between(50, GAME_HEIGHT - 50);
      let shapeSides = (godName === "Hades") ? 0 : (3 + i);
      let enemy = new Enemy(this, spawnX, spawnY, i, shapeSides);
      enemy.god = godName;
      enemy.sprite.setTexture(godName === "Hades" ? "circle_hades" : "poly_" + shapeSides);
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

    // --- Create Two-Player Side-by-Side Split-Screen ---  
    if (this.players.length === 2) {
      // Remove the default camera.
      if (this.cameras.main) {
        this.cameras.remove(this.cameras.main);
      }
      this.playerCameras = [];
      let camWidth = GAME_WIDTH / 2;
      let camHeight = GAME_HEIGHT;
      // Create two cameras – player 0 on the left, player 1 on the right.
      this.players.forEach((player, i) => {
        let x = i * camWidth;  // 0 for player 0, camWidth for player 1.
        let y = 0;
        let cam = this.cameras.add(x, y, camWidth, camHeight);
        cam.startFollow(player.sprite);
        this.playerCameras.push(cam);
        // Save reference to the player's camera (for use in curse effects, etc.)
        player.camera = cam;
        // Create individual HUD overlays for each player.
        player.hudText = this.add.text(x + 10, y + 10, "", { fontSize: '14px', fill: '#fff' })
                                .setScrollFactor(0).setDepth(2000);
      });
    }

    // --- Gamepad Assignment ---
    // If there is at least one gamepad connected:
    if (this.input.gamepad.total > 0) {
      const pads = this.input.gamepad.gamepads;
      if (pads.length >= 2) {
        // If two gamepads are available, assign each to one player.
        this.players[0].gamepad = pads[0];
        this.players[1].gamepad = pads[1];
      } else {
        // If only one gamepad is connected, assign it only to player 0.
        this.players[0].gamepad = pads[0];
        // Player 1 will then use keyboard input.
      }
    }
    // Optionally remove or adjust any 'gamepad connected' event listeners that might reassign controllers.

  }
  
  updateProjectileAttacks(delta) {
    // (As previously implemented)
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
              if (remainder > 0) target.health = Math.max(0, target.health - remainder);
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
    // Update zones.
    this.pieZones.forEach(zone => zone.updateDisplay(this.players));
    this.hadesCircle.setPosition(ARENA_CENTER.x, ARENA_CENTER.y);
    if (this.curseManager) {
      this.curseManager.applyCurse(player);
    }

    // Update melee attacks.
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
              if (remainder > 0) target.health = Math.max(0, target.health - remainder);
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
    
    // Update players.
    for (let i = this.players.length - 1; i >= 0; i--) {
      let player = this.players[i];
      player.update();
      // Apply curse effects via CurseManager.
      this.curseManager.applyCurse(player);
      // Update individual HUD if present.
      if (player.hudText) {
        player.hudText.setText(`P${player.playerIndex}: ${player.god}\nHP: ${Math.floor(player.health)} | Shield: ${Math.floor(player.shield)} | Ammo: ${player.currentBullets}`);
      }
      if (player.health <= 0) {
        player.destroy();
        this.players.splice(i, 1);
      }
    }
    
    // Update enemies.
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
    
    // Global HUD (if no split-screen).
    if (!this.playerCameras) {
      let allChars = this.players.concat(this.enemies);
      let hudInfo = "Combatants Left:\n";
      allChars.forEach((char, idx) => {
        let label = (char.playerIndex !== undefined) ? ("P" + char.playerIndex + ": " + char.god)
                                                     : ("E" + idx + ": " + char.god);
        hudInfo += label + " - HP: " + Math.floor(char.health) + " | Shield: " + Math.floor(char.shield) + " | Ammo: " + char.currentBullets + "\n";
      });
      this.hudText.setText(hudInfo);
    }
    
    // Win condition check.
    let allChars = this.players.concat(this.enemies);
    if (allChars.length > 0) {
      let uniqueGods = new Set(allChars.map(ch => ch.god));
      if (uniqueGods.size === 1) {
        this.scene.start('WinScene', { god: Array.from(uniqueGods)[0] });
      }
    }
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
}
