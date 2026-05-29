import Phaser from 'phaser';

export class Player {
  graphics: Phaser.GameObjects.Graphics;
  blades: Phaser.GameObjects.Graphics[] = [];
  bladeAngle: number = 0;
  hp: number;
  maxHp: number;
  moveSpeed: number;
  attackDamage: number;
  attackSpeed: number;
  attackRange: number;
  critChance: number;
  critDamage: number;
  lifeSteal: number;
  autoBladeCount: number;
  attackTimer: number = 0;
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.hp = 100;
    this.maxHp = 100;
    this.moveSpeed = 200;
    this.attackDamage = 20;
    this.attackSpeed = 2;
    this.attackRange = 250;
    this.critChance = 0.05;
    this.critDamage = 1.5;
    this.lifeSteal = 0;
    this.autoBladeCount = 0;

    this.graphics = scene.add.graphics();
    this.draw();
  }

  draw() {
    this.graphics.clear();
    this.graphics.fillStyle(0x3399ff, 1);
    this.graphics.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    this.graphics.lineStyle(1, 0x66bbff, 1);
    this.graphics.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }

  update(delta: number, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    let dx = 0;
    let dy = 0;
    if (cursors.left.isDown) dx -= 1;
    if (cursors.right.isDown) dx += 1;
    if (cursors.up.isDown) dy -= 1;
    if (cursors.down.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
      this.x += dx * this.moveSpeed * (delta / 1000);
      this.y += dy * this.moveSpeed * (delta / 1000);
    }

    this.draw();
    this.updateBlades(delta);
  }

  updateBlades(delta: number) {
    // Remove excess blades
    while (this.blades.length > this.autoBladeCount) {
      const b = this.blades.pop()!;
      b.destroy();
    }
    // Add missing blades
    while (this.blades.length < this.autoBladeCount) {
      const g = this.scene.add.graphics();
      this.blades.push(g);
    }
    // Update blade positions
    if (this.blades.length > 0) {
      this.bladeAngle += delta * 0.003;
      const radius = 50;
      for (let i = 0; i < this.blades.length; i++) {
        const angle = this.bladeAngle + (Math.PI * 2 / this.blades.length) * i;
        const bx = this.x + Math.cos(angle) * radius;
        const by = this.y + Math.sin(angle) * radius;
        this.blades[i].clear();
        this.blades[i].fillStyle(0x00ffff, 1);
        this.blades[i].fillRect(bx - 10, by - 4, 20, 8);
      }
    }
  }

  canAttack(delta: number): boolean {
    this.attackTimer += delta;
    const interval = 1000 / this.attackSpeed;
    if (this.attackTimer >= interval) {
      this.attackTimer = 0;
      return true;
    }
    return false;
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
  }

  heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  destroy() {
    this.graphics.destroy();
    this.blades.forEach(b => b.destroy());
  }
}
