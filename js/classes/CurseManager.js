// js/classes/CurseManager.js
import Phaser from 'https://unpkg.com/phaser@3.55.2/dist/phaser.module.js';
import { PLAYER_SPEED } from '../helpers.js';

export default class CurseManager {
  constructor(scene, pieZones) {
    this.scene = scene;
    this.pieZones = pieZones;
  }

  applyCurse(player) {
    let applied = false;
    for (let zone of this.pieZones) {
      if (zone.contains(player.sprite.x, player.sprite.y)) {
        switch(zone.god) {
          case "Zeus":
            // 0.5% chance per frame to strike lightning (5 damage)
            if (Phaser.Math.Between(1, 1000) <= 5) {
              player.health = Math.max(0, player.health - 5);
              player.sprite.setTint(0xffff00);
              // Play lightning sound effect if loaded
              if (this.scene.sound.get('lightningSound')) {
                this.scene.sound.play('lightningSound');
              }
              // Create a brief particle burst for lightning
              let particles = this.scene.add.particles('projectile');
              let emitter = particles.createEmitter({
                x: player.sprite.x,
                y: player.sprite.y,
                speed: { min: -100, max: 100 },
                scale: { start: 1, end: 0 },
                lifespan: 300,
                blendMode: 'ADD'
              });
              this.scene.time.delayedCall(300, () => particles.destroy());
              this.scene.time.delayedCall(200, () => player.sprite.clearTint());
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
      // Reset to defaults if not in any cursed zone.
      player.speed = PLAYER_SPEED;
      player.turningPenalty = false;
    }
  }
}
