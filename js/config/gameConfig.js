// Game dimensions and arena settings
export const GAME_WIDTH = 1536;
export const GAME_HEIGHT = 1152;
export const ARENA_CENTER = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
export const ARENA_RADIUS = 566;

// Movement speeds
export const PLAYER_SPEED = 100;
export const ENEMY_SPEED = 50;

// God configurations
export const GODS = [
  { name: "Zeus", color: 0xffff00 },
  { name: "Poseidon", color: 0x0000ff },
  { name: "Hades", color: 0x800080 },
  { name: "Ares", color: 0xff0000 },
  { name: "Athena", color: 0x808080 },
  { name: "Apollo", color: 0xffa500 },
  { name: "Artemis", color: 0x008000 },
  { name: "Demeter", color: 0x964B00 },
  { name: "Dionysus", color: 0x800020 },
  { name: "Hephaestus", color: 0xCD7F32 },
  { name: "Hermes", color: 0xC0C0C0 },
  { name: "Hera", color: 0x4B0082 }
];

export const GOD_CONFIG = {
  Zeus: { health: 150, damage: 20, shield: 40, bullets: 12, bulletReload: 900, shieldReload: 4500, zoneColor: 0xffd700 },
  Poseidon: { health: 170, damage: 15, shield: 45, bullets: 14, bulletReload: 800, shieldReload: 4000, zoneColor: 0x1e90ff },
  Athena: { health: 130, damage: 12, shield: 55, bullets: 15, bulletReload: 700, shieldReload: 3500, zoneColor: 0xc0c0c0 },
  Ares: { health: 180, damage: 30, shield: 20, bullets: 8, bulletReload: 1100, shieldReload: 5500, zoneColor: 0xff4500 },
  Apollo: { health: 130, damage: 18, shield: 35, bullets: 12, bulletReload: 900, shieldReload: 4500, zoneColor: 0xffff66 },
  Artemis: { health: 125, damage: 16, shield: 30, bullets: 12, bulletReload: 850, shieldReload: 4250, zoneColor: 0x66ff66 },
  Hephaestus: { health: 200, damage: 22, shield: 25, bullets: 10, bulletReload: 1200, shieldReload: 6000, zoneColor: 0xcd853f },
  Hermes: { health: 130, damage: 14, shield: 40, bullets: 14, bulletReload: 750, shieldReload: 3750, zoneColor: 0x3cb371 },
  Dionysus: { health: 140, damage: 13, shield: 45, bullets: 12, bulletReload: 900, shieldReload: 4500, zoneColor: 0xba55d3 },
  Demeter: { health: 150, damage: 12, shield: 50, bullets: 15, bulletReload: 800, shieldReload: 4000, zoneColor: 0x20b2aa },
  Hera: { health: 160, damage: 15, shield: 70, bullets: 16, bulletReload: 700, shieldReload: 3500, zoneColor: 0xff69b4 },
  Hades: { health: 160, damage: 24, shield: 35, bullets: 10, bulletReload: 1000, shieldReload: 5000, zoneColor: 0x8b008b }
};

// Combat configuration
export const GAME_CONFIG = {
  arena: {
    WIDTH: GAME_WIDTH,
    HEIGHT: GAME_HEIGHT,
    RADIUS: ARENA_RADIUS
  },
  combat: {
    COOLDOWNS: {
      MELEE: 500,
      SPIN: 1000,
      PROJECTILE: 500
    },
    DAMAGE: {
      MELEE: 10,
      SPIN: 7,
      PROJECTILE: 12
    }
  },
  player: {
    BASE_SPEED: PLAYER_SPEED,
    SPRINT_MULTIPLIER: 1.5,
    MAX_HEALTH: 100,
    MAX_SHIELD: 20,
    RELOAD_RATE: 1000,
    SHIELD_REGEN_RATE: 5000
  },
  powerups: {
    TYPES: ['shield', 'extraSpeed', 'damage'],
    LIFETIME: 10000,
    EFFECTS: {
      SHIELD_BOOST: 20,
      SPEED_BOOST: 1.5,
      DAMAGE_BOOST: 1.3
    }
  }
};

export default GAME_CONFIG;