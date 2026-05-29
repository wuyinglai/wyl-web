import { Player } from '../actors/Player';
import { Enemy } from '../actors/Enemy';
import { Projectile } from '../actors/Projectile';
import { GameState } from '../data/upgrades';

export class CombatSystem {
  projectiles: Projectile[] = [];
  bladeHitCooldowns: Map<number, number> = new Map();

  update(
    delta: number,
    scene: Phaser.Scene,
    player: Player,
    enemies: Enemy[],
    state: GameState,
    onEnemyKilled: (enemy: Enemy) => void,
    onPlayerHit: (damage: number) => void
  ) {
    // Auto attack
    if (player.canAttack(delta)) {
      const target = this.findNearestEnemy(player, enemies);
      if (target) {
        this.shootProjectile(scene, player, target, state);
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const alive = p.update(delta);
      if (!alive || !this.isInBounds(p.x, p.y, scene.scale.width, scene.scale.height)) {
        p.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }
      // Check collision with enemies
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (this.circleCollide(p.x, p.y, p.size / 2, enemy.x, enemy.y, enemy.size / 2)) {
          const died = enemy.takeDamage(p.damage);
          p.alive = false;
          p.destroy();
          this.projectiles.splice(i, 1);
          if (died) {
            onEnemyKilled(enemy);
          }
          break;
        }
      }
    }

    // Blade damage
    if (player.autoBladeCount > 0) {
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        const dist = Math.sqrt(
          (player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2
        );
        if (dist < 60) {
          const enemyId = enemies.indexOf(enemy);
          const lastHit = this.bladeHitCooldowns.get(enemyId) || 0;
          if (Date.now() - lastHit > 500) {
            this.bladeHitCooldowns.set(enemyId, Date.now());
            const bladeDmg = Math.floor(state.attackDamage * 0.5);
            const died = enemy.takeDamage(bladeDmg);
            if (died) {
              onEnemyKilled(enemy);
            }
          }
        }
      }
    }

    // Enemy collision with player
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = Math.sqrt(
        (player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2
      );
      if (dist < 28) {
        onPlayerHit(enemy.damage);
        enemy.alive = false;
        enemy.destroy();
      }
    }
  }

  findNearestEnemy(player: Player, enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = player.attackRange;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = enemy.distanceTo(player.x, player.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  shootProjectile(scene: Phaser.Scene, player: Player, target: Enemy, state: GameState) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    let damage = state.attackDamage;
    let isCrit = false;
    if (Math.random() < state.critChance) {
      damage = Math.floor(damage * state.critDamage);
      isCrit = true;
    }
    const p = new Projectile(scene, player.x, player.y, dx, dy, damage);
    this.projectiles.push(p);
    if (isCrit) {
      console.log(`[Combat] CRIT! Damage: ${damage}`);
    }
  }

  circleCollide(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < r1 + r2;
  }

  isInBounds(x: number, y: number, w: number, h: number): boolean {
    return x > -100 && x < w + 100 && y > -100 && y < h + 100;
  }

  destroy() {
    this.projectiles.forEach(p => p.destroy());
    this.projectiles = [];
  }
}
