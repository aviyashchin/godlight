const GAME_CONFIG = {
  arena: {
    WIDTH: 1536,
    HEIGHT: 1152,
    RADIUS: 566
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
    BASE_SPEED: 100,
    SPRINT_MULTIPLIER: 1.5,
    RELOAD_RATE: 1000,
    SHIELD_REGEN_RATE: 5000
  }
};

export default GAME_CONFIG;
