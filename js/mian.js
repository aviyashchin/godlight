import MainScene from './scenes/MainScene.js';
import WinScene from './scenes/WinScene.js';
import HelpScene from './scenes/HelpScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './helpers.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: [MainScene, WinScene, HelpScene],
  parent: 'phaser-example',
  input: { gamepad: true }
};

const game = new Phaser.Game(config);
