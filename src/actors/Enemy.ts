import Phaser from 'phaser';

export class Enemy {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  expValue: number;
  alive: boolean = true;
  size: number = 24;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number = 1) {
    this.x = x;
    this.y = y;
    this.hp = 30 + level * 5;
    this.maxHp = this.hp;
    this.speed = 80 + level * 3;
    this.damage = 10 + level * 2;
    this.expValue = 10 + level * 3;
    this.graphics = scene.add.graphics();
    this.draw();
  }

  draw() {
    this.graphics.clear();
    this.graphics.fillStyle(0xe63333, 1);
    this.graphics.fillCircle(this.x, this.y, this.size / 2);
    this.graphics.lineStyle(1, 0xff6666, 1);
    this.graphics.strokeCircle(this.x, this.y, this.size / 2);
    // HP bar
    const barW = this.size;
    const barH = 4;
    const barX = this.x - barW / 2;
    const barY = this.y - this.size / 2 - 8;
    this.graphics.fillStyle(0x333333, 1);
    this.graphics.fillRect(barX, barY, barW, barH);
    const hpRatio = this.hp / this.maxHp;
    this.graphics.fillStyle(hpRatio > 0.5 ? 0x33ff33 : hpRatio > 0.25 ? 0xffff33 : 0xff3333, 1);
    this.graphics.fillRect(barX, barY, barW * hpRatio, barH);
  }

  update(delta: number, targetX: number, targetY: number) {
    if (!this.alive) return;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 5) {
      this.x += (dx / dist) * this.speed * (delta / 1000);
      this.y += (dy / dist) * this.speed * (delta / 1000);
    }
    this.draw();
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
      return true; // died
    }
    this.draw();
    return false;
  }

  distanceTo(x: number, y: number): number {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  destroy() {
    this.graphics.destroy();
  }
}
