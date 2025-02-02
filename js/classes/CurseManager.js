// js/classes/CurseManager.js
import { PLAYER_SPEED } from '../helpers.js';

export default class CurseManager {
  constructor(scene, pieZones) {
    this.scene = scene;
    // Ensure pieZones is an array; if not, default to an empty array.
    this.pieZones = Array.isArray(pieZones) ? pieZones : [];
  }

  applyCurse(player) {
    let applied = false;
    // Iterate over the zones
    for (let zone of this.pieZones) {
      if (zone.contains(player.sprite.x, player.sprite.y)) {
        // Apply the curse logic based on the zone's god.
        switch (zone.god) {
            // 0.5% chance per frame to strike lightning (5 damage)
          case "Zeus":
            // Example: lightning strike
            if (Phaser.Math.Between(1, 1000) <= 5) {
              player.health = Math.max(0, player.health - 5);
              player.sprite.setTint(0xffff00);
              this.scene.time.delayedCall(200, () => { player.sprite.clearTint(); });
            }
            break;
          case "Poseidon":
            player.speed = PLAYER_SPEED * 0.8;
            break;
          case "Ares":
            player.shield = Math.max(0, player.shield - 0.05);
            break;
          case "Artemis":
            if (Phaser.Math.Between(1, 1000) <= 5) {
              player.health = Math.max(0, player.health - 3);
              player.sprite.setTint(0xcccccc);
              this.scene.time.delayedCall(200, () => player.sprite.clearTint());
            }
            break;
          case "Hermes":
            player.turningPenalty = true;
            break;
          case "Dionysus":
            // If player has an assigned camera, rotate that camera slightly.
            if (player.camera) {
              player.camera.rotation = 0.02 * Math.sin(this.scene.time.now / 1000);
            }
            break;
          case "Demeter":
            player.speed = PLAYER_SPEED * 0.7;
            break;
          case "Hera":
            if (player.speed > PLAYER_SPEED) {
              player.speed = PLAYER_SPEED;
            }
            break;
          default:
            break;
        }
        applied = true;
        break; // Only one zone effect applied per update.
      }
    }
    if (!applied) {
      // Reset to defaults if not in any zone.
      player.speed = PLAYER_SPEED;
      player.turningPenalty = false;
    }
  }
}
