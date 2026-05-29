import { Enemy } from '../actors/Enemy';

export class SpawnSystem {
  enemies: Enemy[] = [];
  spawnTimer: number = 0;
  spawnInterval: number = 2000;
  spawnCount: number = 0;
  difficultyTimer: number = 0;
  difficulty: number = 1;
  maxEnemies: number = 30;

  update(delta: number, scene: Phaser.Scene, playerX: number, playerY: number, canvasW: number, canvasH: number): Enemy[] {
    // Spawn timer
    this.spawnTimer += delta;
    this.difficultyTimer += delta;

    // Increase difficulty every 10 seconds
    if (this.difficultyTimer >= 10000) {
      this.difficultyTimer = 0;
      this.difficulty += 1;
      this.spawnInterval = Math.max(500, this.spawnInterval - 100);
      console.log(`[SpawnSystem] Difficulty increased to ${this.difficulty}`);
    }

    // Spawn enemy
    if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
      this.spawnTimer = 0;
      const pos = this.getSpawnPosition(playerX, playerY, canvasW, canvasH);
      const enemy = new Enemy(scene, pos.x, pos.y, this.difficulty);
      this.enemies.push(enemy);
      this.spawnCount++;
    }

    return this.enemies;
  }

  getSpawnPosition(playerX: number, playerY: number, canvasW: number, canvasH: number): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvasW, canvasH) * 0.6;
    return {
      x: playerX + Math.cos(angle) * dist,
      y: playerY + Math.sin(angle) * dist,
    };
  }

  removeEnemy(enemy: Enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx >= 0) {
      this.enemies.splice(idx, 1);
    }
  }

  getAliveEnemies(): Enemy[] {
    return this.enemies.filter(e => e.alive);
  }
}
