import { lightenColor, darkenColor } from '../helpers.js';
import { GOD_ICONS, GOD_BOONS } from '../helpers.js';

export default class PieZone {
  constructor(scene, centerX, centerY, radius, startAngle, endAngle, god, zoneColor) {
    this.scene = scene;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.god = god;
    this.zoneColor = zoneColor;
    this.graphics = scene.add.graphics();
    this.text = scene.add.text(0, 0, god, { fontFamily: 'monospace', fontSize: '14px', fill: '#fff' });
    this.updateDisplay([]);
  }
  contains(x, y) {
    let dx = x - this.centerX, dy = y - this.centerY;
    let dist = Math.sqrt(dx*dx+dy*dy);
    if (dist > this.radius) return false;
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2*Math.PI;
    return (this.startAngle > this.endAngle)
      ? (angle >= this.startAngle || angle < this.endAngle)
      : (angle >= this.startAngle && angle < this.endAngle);
  }
  updateDisplay(players) {
    this.graphics.clear();
    let active = players.some(player => player.god === this.god && this.contains(player.sprite.x, player.sprite.y));
    if (active) {
      let light = lightenColor(this.zoneColor, 0.3);
      this.graphics.fillGradientStyle(light, this.zoneColor, this.zoneColor, light, 1);
    } else {
      let dark = darkenColor(this.zoneColor, 0.3);
      this.graphics.fillGradientStyle(dark, this.zoneColor, this.zoneColor, dark, 1);
    }
    this.graphics.slice(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle, false);
    this.graphics.fillPath();
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.graphics.slice(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle, false);
    this.graphics.strokePath();
    let midAngle = (this.startAngle + this.endAngle) / 2;
    let labelRadius = this.radius * 0.5;
    let tx = this.centerX + labelRadius * Math.cos(midAngle) - 20;
    let ty = this.centerY + labelRadius * Math.sin(midAngle) - 10;
    this.text.setText(this.god + (active ? "\n" + GOD_ICONS[this.god] + " " + GOD_BOONS[this.god] : ""));
    this.text.setPosition(tx, ty);
  }
}
