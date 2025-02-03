// js/scenes/MainScene.js
import GAME_CONFIG, { GODS, GOD_CONFIG } from '../config/gameConfig.js';
import CombatManager from '../managers/CombatManager.js';
import { createPolygonTexture, createCircleTexture } from '../utils/textureHelpers.js';
import Player from '../classes/Player.js';
import Enemy from '../classes/Enemy.js';
import ProjectileAttack from '../classes/ProjectileAttack.js';
import MeleeAttack from '../classes/MeleeAttack.js';
import PieZone from '../classes/PieZone.js';
import PowerUp from '../classes/PowerUp.js';
import CurseManager from '../classes/CurseManager.js';

const ARENA_CENTER = {
  x: GAME_CONFIG.arena.WIDTH / 2,
  y: GAME_CONFIG.arena.HEIGHT / 2
};

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.combatManager = null;
  }
  
  preload() {
    // Generate textures.
    for (let sides = 3; sides <= 14; sides++) {
      let key = "poly_" + sides;
      createPolygonTexture(this, key, sides, 32, 0xffffff);
    }
    createCircleTexture(this, "circle_hades", 32, 0xffffff);
    
    // Load audio assets.
    this.load.audio('bgMusic', 'assets/audio/bgMusic.mp3');
    this.load.audio('lightningSound', 'assets/audio/lightning.mp3');
  }
  
  create() {
    // Enable physics
    this.physics.world.setBounds(0, 0, GAME_CONFIG.arena.WIDTH, GAME_CONFIG.arena.HEIGHT);
    this.physics.world.setBoundsCollision(true);
    
    this.cameras.main.setBackgroundColor(0x111111);
    
    // Create the arena
    this.hadesCircle = this.add.circle(
      ARENA_CENTER.x,
      ARENA_CENTER.y,
      75,
      GOD_CONFIG["Hades"].zoneColor,
      0.5
    );
    
    this.pieZones = [];
    let godsForZones = GODS.filter(g => g.name !== "Hades");
    const numZones = godsForZones.length;
    
    for (let i = 0; i < numZones; i++) {
      let startAngle = i * (2 * Math.PI / numZones);
      let endAngle = (i + 1) * (2 * Math.PI / numZones);
      let god = godsForZones[i].name;
      let zoneColor = GOD_CONFIG[god].zoneColor;
      let zone = new PieZone(
        this,
        ARENA_CENTER.x,
        ARENA_CENTER.y,
        GAME_CONFIG.arena.RADIUS,
        startAngle,
        endAngle,
        god,
        zoneColor
      );
      this.pieZones.push(zone);
    }

    // Initialize combat manager
    this.combatManager = new CombatManager(this);
    
    // Create players
    this.createPlayers();
  }
  
  createPlayers() {
    this.players = [];
    this.enemies = [];  // Initialize enemies array
    
    // Create players first
    const playerConfigs = [
      { x: ARENA_CENTER.x - 100, y: ARENA_CENTER.y, god: GODS[0].name },
      { x: ARENA_CENTER.x + 100, y: ARENA_CENTER.y, god: GODS[1].name }
    ];

    playerConfigs.forEach((config, index) => {
      const shapeSides = config.god === "Hades" ? 0 : (3 + index);
      const player = new Player(this, config.x, config.y, index, shapeSides);
      
      player.god = config.god;
      player.homeZone = (config.god === "Hades") ? 
        this.hadesCircle : 
        this.pieZones.find(z => z.god === config.god);
      
      const godConfig = GOD_CONFIG[config.god];
      Object.assign(player, {
        maxHealth: godConfig.health,
        health: godConfig.health,
        damage: godConfig.damage,
        maxShield: godConfig.shield,
        shield: godConfig.shield,
        maxBullets: godConfig.bullets,
        currentBullets: godConfig.bullets
      });
      
      this.players.push(player);
    });

    // Create enemies for remaining gods
    const remainingGods = GODS.filter(god => 
      !playerConfigs.some(config => config.god === god.name)
    );

    remainingGods.forEach((god, index) => {
      const angle = (index / remainingGods.length) * Math.PI * 2;
      const radius = GAME_CONFIG.arena.RADIUS * 0.8;
      const x = ARENA_CENTER.x + Math.cos(angle) * radius;
      const y = ARENA_CENTER.y + Math.sin(angle) * radius;
      
      const enemy = new Enemy(this, x, y, god.name);
      enemy.god = god.name;
      
      const godConfig = GOD_CONFIG[god.name];
      Object.assign(enemy, {
        maxHealth: godConfig.health,
        health: godConfig.health,
        damage: godConfig.damage,
        maxShield: godConfig.shield,
        shield: godConfig.shield,
        maxBullets: godConfig.bullets,
        currentBullets: godConfig.bullets
      });
      
      this.enemies.push(enemy);
    });
  }
  
  update(time, delta) {
    this.players.forEach(player => player.update(delta));
    this.enemies.forEach(enemy => enemy.update(time, delta));
    this.combatManager.update(delta);
  }
}
