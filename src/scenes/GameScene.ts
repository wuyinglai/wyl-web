import Phaser from 'phaser';
import { Player } from '../actors/Player';
import { Enemy } from '../actors/Enemy';
import { SpawnSystem } from '../systems/SpawnSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { GameState, createInitialState, applyUpgrade } from '../data/upgrades';

export class GameScene extends Phaser.Scene {
  player!: Player;
  spawnSystem!: SpawnSystem;
  combatSystem!: CombatSystem;
  upgradeSystem!: UpgradeSystem;
  state!: GameState;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  hpText!: Phaser.GameObjects.Text;
  expText!: Phaser.GameObjects.Text;
  levelText!: Phaser.GameObjects.Text;
  killsText!: Phaser.GameObjects.Text;
  fpsText!: Phaser.GameObjects.Text;
  gameOverText!: Phaser.GameObjects.Text;
  bgGraphics!: Phaser.GameObjects.Graphics;
  gameOver: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    console.log('[GameScene] Creating game scene...');
    const w = this.scale.width;
    const h = this.scale.height;

    // Background
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.fillStyle(0x1a1a2e, 1);
    this.bgGraphics.fillRect(0, 0, w, h);

    // Grid lines for visual reference
    this.bgGraphics.lineStyle(1, 0x2a2a4e, 0.3);
    for (let x = 0; x < w; x += 64) {
      this.bgGraphics.lineBetween(x, 0, x, h);
    }
    for (let y = 0; y < h; y += 64) {
      this.bgGraphics.lineBetween(0, y, w, y);
    }

    // Player
    this.player = new Player(this, w / 2, h / 2);

    // Systems
    this.spawnSystem = new SpawnSystem();
    this.combatSystem = new CombatSystem();
    this.upgradeSystem = new UpgradeSystem(
      this,
      (upgradeId) => this.handleUpgrade(upgradeId),
      () => console.log('[GameScene] Upgrade skipped')
    );

    // State
    this.state = createInitialState();

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    // Also bind WASD
    const wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;
    (this.cursors as any).W = wasd.W;
    (this.cursors as any).A = wasd.A;
    (this.cursors as any).S = wasd.S;
    (this.cursors as any).D = wasd.D;

    // UI
    this.hpText = this.add.text(16, 16, '', { fontSize: '18px', color: '#ff4444', fontFamily: 'monospace' }).setDepth(200);
    this.expText = this.add.text(16, 40, '', { fontSize: '16px', color: '#44ff44', fontFamily: 'monospace' }).setDepth(200);
    this.levelText = this.add.text(16, 62, '', { fontSize: '16px', color: '#ffff44', fontFamily: 'monospace' }).setDepth(200);
    this.killsText = this.add.text(16, 84, '', { fontSize: '16px', color: '#ff88ff', fontFamily: 'monospace' }).setDepth(200);
    this.fpsText = this.add.text(w - 16, 16, '', { fontSize: '14px', color: '#888888', fontFamily: 'monospace' }).setOrigin(1, 0).setDepth(200);
    this.gameOverText = this.add.text(w / 2, h / 2, '游戏结束\n点击重新开始', {
      fontSize: '36px', color: '#ff0000', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5).setDepth(300).setVisible(false);

    this.gameOverText.setInteractive();
    this.gameOverText.on('pointerdown', () => {
      this.scene.restart();
    });

    this.updateUI();
    console.log('[GameScene] Game scene created successfully');
  }

  update(time: number, delta: number) {
    if (this.gameOver) return;

    // FPS
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);

    // Player movement (combine arrow keys and WASD)
    const c = this.cursors as any;
    const mergedCursors = {
      left: c.left.isDown || c.A?.isDown,
      right: c.right.isDown || c.D?.isDown,
      up: c.up.isDown || c.W?.isDown,
      down: c.down.isDown || c.S?.isDown,
    };
    this.player.update(delta, mergedCursors as Phaser.Types.Input.Keyboard.CursorKeys);

    // Sync player stats from state
    this.player.attackDamage = this.state.attackDamage;
    this.player.attackSpeed = this.state.attackSpeed;
    this.player.attackRange = this.state.attackRange;
    this.player.moveSpeed = this.state.moveSpeed;
    this.player.critChance = this.state.critChance;
    this.player.critDamage = this.state.critDamage;
    this.player.lifeSteal = this.state.lifeSteal;
    this.player.autoBladeCount = this.state.autoBladeCount;

    // Spawn enemies
    const enemies = this.spawnSystem.update(
      delta, this, this.player.x, this.player.y,
      this.scale.width, this.scale.height
    );

    // Combat
    if (!this.upgradeSystem.paused) {
      this.combatSystem.update(
        delta, this, this.player, enemies, this.state,
        (enemy) => this.onEnemyKilled(enemy),
        (damage) => this.onPlayerHit(damage)
      );
    }

    // Update enemies (move toward player)
    for (const enemy of enemies) {
      if (enemy.alive) {
        enemy.update(delta, this.player.x, this.player.y);
      }
    }

    // Clean up dead enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      if (!enemies[i].alive) {
        enemies[i].destroy();
        this.spawnSystem.removeEnemy(enemies[i]);
      }
    }

    this.updateUI();
  }

  onEnemyKilled(enemy: Enemy) {
    this.state.kills++;
    this.state.exp += enemy.expValue;
    console.log(`[Game] Enemy killed! EXP +${enemy.expValue}, Total: ${this.state.exp}/${this.state.expToNext}`);

    // Life steal
    if (this.state.lifeSteal > 0) {
      const healAmount = Math.floor(this.state.maxHp * this.state.lifeSteal);
      this.player.heal(healAmount);
      this.state.hp = this.player.hp;
      if (healAmount > 0) {
        console.log(`[Game] Life steal: +${healAmount} HP`);
      }
    }

    // Check level up
    if (this.state.exp >= this.state.expToNext) {
      this.levelUp();
    }
  }

  onPlayerHit(damage: number) {
    this.player.takeDamage(damage);
    this.state.hp = this.player.hp;
    console.log(`[Game] Player hit! HP: ${this.state.hp}/${this.state.maxHp}`);

    if (this.state.hp <= 0) {
      this.doGameOver();
    }
  }

  levelUp() {
    this.state.level++;
    this.state.exp -= this.state.expToNext;
    this.state.expToNext = Math.floor(this.state.expToNext * 1.2) + 50;
    console.log(`[Game] LEVEL UP! Level: ${this.state.level}`);

    // Show upgrade panel
    this.upgradeSystem.show(this.state);
  }

  handleUpgrade(upgradeId: string) {
    this.state = applyUpgrade(this.state, upgradeId);
    // Re-apply to player
    this.player.hp = this.state.hp;
    this.player.maxHp = this.state.maxHp;
    console.log(`[Game] Upgrade selected: ${upgradeId}`);
  }

  doGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    console.log(`[Game] GAME OVER! Level: ${this.state.level}, Kills: ${this.state.kills}`);
  }

  updateUI() {
    this.hpText.setText(`生命: ${this.state.hp} / ${this.state.maxHp}`);
    const expPct = Math.floor((this.state.exp / this.state.expToNext) * 100);
    this.expText.setText(`经验: ${this.state.exp} / ${this.state.expToNext} (${expPct}%)`);
    this.levelText.setText(`等级: ${this.state.level}`);
    this.killsText.setText(`击杀: ${this.state.kills}`);
  }
}
