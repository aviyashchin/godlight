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
  Zeus: {
    health: 100,
    damage: 12,
    shield: 20,
    bullets: 10,
    bulletReload: 1000,
    shieldReload: 5000,
    zoneColor: 0xffff00
  },
  Poseidon: {
    health: 120,
    damage: 10,
    shield: 25,
    bullets: 8,
    bulletReload: 1200,
    shieldReload: 4500,
    zoneColor: 0x0000ff
  },
  Hades: {
    health: 150,
    damage: 8,
    shield: 30,
    bullets: 6,
    bulletReload: 1500,
    shieldReload: 4000,
    zoneColor: 0x800080
  },
  Ares: {
    health: 90,
    damage: 15,
    shield: 15,
    bullets: 12,
    bulletReload: 800,
    shieldReload: 6000,
    zoneColor: 0xff0000
  },
  Athena: {
    health: 110,
    damage: 11,
    shield: 22,
    bullets: 9,
    bulletReload: 1100,
    shieldReload: 4800,
    zoneColor: 0x808080
  },
  Apollo: {
    health: 100,
    damage: 13,
    shield: 18,
    bullets: 11,
    bulletReload: 900,
    shieldReload: 5200,
    zoneColor: 0xffa500
  },
  Artemis: {
    health: 100,
    damage: 10,
    shield: 20,
    bullets: 8,
    bulletReload: 1000,
    shieldReload: 4500,
    zoneColor: 0x008000
  },
  Demeter: {
    health: 120,
    damage: 10,
    shield: 25,
    bullets: 8,
    bulletReload: 1200,
    shieldReload: 4500,
    zoneColor: 0x964B00
  },
  Dionysus: {
    health: 100,
    damage: 10,
    shield: 20,
    bullets: 8,
    bulletReload: 1000,
    shieldReload: 4500,
    zoneColor: 0x800020
  },
  Hephaestus: {
    health: 100,
    damage: 10,
    shield: 20,
    bullets: 8,
    bulletReload: 1000,
    shieldReload: 4500,
    zoneColor: 0xCD7F32
  },
  Hermes: {
    health: 100,
    damage: 10,
    shield: 20,
    bullets: 8,
    bulletReload: 1000,
    shieldReload: 4500,
    zoneColor: 0xC0C0C0
  },
  Hera: {
    health: 100,
    damage: 10,
    shield: 20,
    bullets: 8,
    bulletReload: 1000,
    shieldReload: 4500,
    zoneColor: 0x4B0082
  }
};

// Combat configuration
export const GAME_CONFIG = {
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