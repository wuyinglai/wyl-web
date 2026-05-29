import Phaser from 'phaser';

export class Projectile {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number = 400;
  damage: number;
  alive: boolean = true;
  lifetime: number = 3000;
  elapsed: number = 0;
  size: number = 6;

  constructor(scene: Phaser.Scene, x: number, y: number, dirX: number, dirY: number, damage: number) {
    this.x = x;
    this.y = y;
    this.damage = damage;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    this.dx = (dirX / len);
    this.dy = (dirY / len);
    this.graphics = scene.add.graphics();
    this.draw();
  }

  draw() {
    this.graphics.clear();
    this.graphics.fillStyle(0xffdd33, 1);
    this.graphics.fillCircle(this.x, this.y, this.size / 2);
    this.graphics.lineStyle(1, 0xffff66, 1);
    this.graphics.strokeCircle(this.x, this.y, this.size / 2);
  }

  update(delta: number): boolean {
    this.elapsed += delta;
    if (this.elapsed >= this.lifetime) {
      this.alive = false;
      return false;
    }
    this.x += this.dx * this.speed * (delta / 1000);
    this.y += this.dy * this.speed * (delta / 1000);
    this.draw();
    return true;
  }

  destroy() {
    this.graphics.destroy();
  }
}
