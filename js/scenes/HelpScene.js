import { GAME_WIDTH, GAME_HEIGHT } from '../helpers.js';

export default class HelpScene extends Phaser.Scene {
  constructor() { super('HelpScene'); }
  init(data) { this.previousScene = data.previousScene || 'MainScene'; }
  create() {
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    let helpText =
`Keyboard Controls:

Player 0:
  Move: Arrow Keys
  Sprint: SHIFT
  Regular Melee: SPACE
  Spin Melee: Q
  Projectile Attack: E

Player 1:
  Move: W A S D
  Sprint: CONTROL
  Regular Melee: F
  Spin Melee: G
  Projectile Attack: H

Player 2:
  Move: I J K L
  Sprint: U
  Regular Melee: O
  Spin Melee: P
  Projectile Attack: [

Player 3:
  Move: Numpad 8/4/6/2
  Sprint: Numpad 0
  Regular Melee: Numpad 1
  Spin Melee: Numpad 3
  Projectile Attack: Numpad 5

Additional:
  Press "?" to toggle this help screen.`;
    this.add.text(50, 50, helpText, { fontSize: '20px', fill: '#fff', wordWrap: { width: GAME_WIDTH - 100 } });
    this.input.keyboard.once('keydown-?', () => { this.scene.stop('HelpScene'); });
    let closeBtn = document.createElement("button");
    closeBtn.id = "closeHelpBtn";
    closeBtn.textContent = "Close Help";
    closeBtn.onclick = () => { closeBtn.remove(); this.scene.stop('HelpScene'); };
    document.body.appendChild(closeBtn);
  }
}
