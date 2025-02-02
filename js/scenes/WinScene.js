import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../helpers.js';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene');
  }
  init(data) { this.winningGod = data.god; }
  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    this.add.text(GAME_WIDTH/2 - 200, GAME_HEIGHT/2 - 100, "The " + this.winningGod + " has won!", { fontSize: '48px', fill: '#fff' });
    let btn = document.createElement("button");
    btn.id = "restartBtn";
    btn.textContent = "Restart Game";
    btn.onclick = () => { btn.remove(); this.scene.start('MainScene'); };
    document.body.appendChild(btn);
  }
}
