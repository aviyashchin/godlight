// Global configuration constants
export const GAME_WIDTH = 1536;
export const GAME_HEIGHT = 1152;
export const ARENA_CENTER = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
export const ARENA_RADIUS = Math.min(GAME_WIDTH, GAME_HEIGHT) / 2 - 20;
export const PLAYER_SPEED = 100;
export const ENEMY_SPEED = 50;

// Color adjustment functions
export function lightenColor(color, percent) {
  let r = (color >> 16) & 0xFF;
  let g = (color >> 8) & 0xFF;
  let b = color & 0xFF;
  r = Math.min(255, r + Math.floor((255 - r) * percent));
  g = Math.min(255, g + Math.floor((255 - g) * percent));
  b = Math.min(255, b + Math.floor((255 - b) * percent));
  return (r << 16) + (g << 8) + b;
}

export function darkenColor(color, percent) {
  let r = (color >> 16) & 0xFF;
  let g = (color >> 8) & 0xFF;
  let b = color & 0xFF;
  r = Math.max(0, r - Math.floor(r * percent));
  g = Math.max(0, g - Math.floor(g * percent));
  b = Math.max(0, b - Math.floor(b * percent));
  return (r << 16) + (g << 8) + b;
}

// Texture creation helpers
export function createPolygonTexture(scene, key, sides, radius, color) {
  let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  let angleStep = (2 * Math.PI) / sides;
  let points = [];
  for (let i = 0; i < sides; i++) {
    let angle = i * angleStep - Math.PI/2;
    let x = radius * Math.cos(angle) + radius;
    let y = radius * Math.sin(angle) + radius;
    points.push(new Phaser.Geom.Point(x, y));
  }
  graphics.fillStyle(color, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture(key, radius*2, radius*2);
  graphics.destroy();
}

export function createCircleTexture(scene, key, radius, color) {
  let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(color, 1);
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture(key, radius*2, radius*2);
  graphics.destroy();
}

// God-specific constants
export const GOD_ICONS = {
  Zeus: "⚡", Poseidon: "🌊", Athena: "🦉", Ares: "⚔️",
  Aphrodite: "💖", Apollo: "☀️", Artemis: "🌙", Hephaestus: "🔥",
  Hermes: "👟", Dionysus: "🍷", Demeter: "🌾", Hera: "👑", Hades: "💀"
};

export const GOD_BOONS = {
  Zeus: "+25% DMG", Poseidon: "Push Allies", Athena: "30% Heal Chance",
  Ares: "Reflect 15%", Aphrodite: "Healing Mishap", Apollo: "-5% Accu",
  Artemis: "Random Target", Hephaestus: "20% Backfire", Hermes: "Chaotic Move",
  Dionysus: "Screen Spin", Demeter: "Slow Allies", Hera: "Tax Allies", Hades: "Soul Burden"
};

export const GODS = [
  { name: "Zeus",      boon: "Lightning Rod – +25% DMG" },
  { name: "Poseidon",  boon: "Unstable Tides" },
  { name: "Athena",    boon: "Cursed Wisdom" },
  { name: "Ares",      boon: "War's Toll" },
  { name: "Aphrodite", boon: "Heart's Discord" },
  { name: "Apollo",    boon: "Blinding Pride" },
  { name: "Artemis",   boon: "Moon's Madness" },
  { name: "Hephaestus", boon: "Forge's Flaw" },
  { name: "Hermes",    boon: "Chaotic Speed" },
  { name: "Dionysus",  boon: "Eternal Hangover" },
  { name: "Demeter",   boon: "Withering Touch" },
  { name: "Hera",      boon: "Royal Tax" },
  { name: "Hades",     boon: "Soul Burden" }
];

export const GOD_CONFIG = {
  Zeus:      { health: 150, damage: 20, shield: 40, bullets: 12, bulletReload: 900, shieldReload: 4500, zoneColor: 0xffd700 },
  Poseidon:  { health: 170, damage: 15, shield: 45, bullets: 14, bulletReload: 800, shieldReload: 4000, zoneColor: 0x1e90ff },
  Athena:    { health: 130, damage: 12, shield: 55, bullets: 15, bulletReload: 700, shieldReload: 3500, zoneColor: 0xc0c0c0 },
  Ares:      { health: 180, damage: 30, shield: 20, bullets: 8,  bulletReload: 1100, shieldReload: 5500, zoneColor: 0xff4500 },
  Aphrodite: { health: 120, damage: 10, shield: 60, bullets: 16, bulletReload: 600, shieldReload: 3000, zoneColor: 0xff69b4 },
  Apollo:    { health: 130, damage: 18, shield: 35, bullets: 12, bulletReload: 900, shieldReload: 4500, zoneColor: 0xffff66 },
  Artemis:   { health: 125, damage: 16, shield: 30, bullets: 12, bulletReload: 850, shieldReload: 4250, zoneColor: 0x66ff66 },
  Hephaestus:{ health: 200, damage: 22, shield: 25, bullets: 10, bulletReload: 1200, shieldReload: 6000, zoneColor: 0xcd853f },
  Hermes:    { health: 130, damage: 14, shield: 40, bullets: 14, bulletReload: 750, shieldReload: 3750, zoneColor: 0x3cb371 },
  Dionysus:  { health: 140, damage: 13, shield: 45, bullets: 12, bulletReload: 900, shieldReload: 4500, zoneColor: 0xba55d3 },
  Demeter:   { health: 150, damage: 12, shield: 50, bullets: 15, bulletReload: 800, shieldReload: 4000, zoneColor: 0x20b2aa },
  Hera:      { health: 160, damage: 15, shield: 70, bullets: 16, bulletReload: 700, shieldReload: 3500, zoneColor: 0xff69b4 },
  Hades:     { health: 160, damage: 24, shield: 35, bullets: 10, bulletReload: 1000, shieldReload: 5000, zoneColor: 0x8b008b }
};
