import Phaser from 'phaser';
import { GameState, getRandomUpgrades, UpgradeOption } from '../data/upgrades';

export class UpgradeSystem {
  paused: boolean = false;
  panelGraphics: Phaser.GameObjects.Graphics;
  titleText: Phaser.GameObjects.Text;
  skipText: Phaser.GameObjects.Text;
  buttons: Phaser.GameObjects.Text[] = [];
  scene: Phaser.Scene;
  onUpgradeSelected: (upgradeId: string) => void;
  onSkip: () => void;

  constructor(scene: Phaser.Scene, onUpgradeSelected: (id: string) => void, onSkip: () => void) {
    this.scene = scene;
    this.onUpgradeSelected = onUpgradeSelected;
    this.onSkip = onSkip;

    this.panelGraphics = scene.add.graphics();
    this.panelGraphics.setDepth(100);

    this.titleText = scene.add.text(0, 0, 'LEVEL UP!', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    this.skipText = scene.add.text(0, 0, '[ Skip ]', {
      fontSize: '18px',
      color: '#aaaaaa',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive().setDepth(101);

    this.skipText.on('pointerdown', () => {
      this.hide();
      onSkip();
    });

    this.hide();
  }

  show(state: GameState) {
    this.paused = true;
    const upgrades = getRandomUpgrades(3);
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2;
    const pw = 320;
    const ph = 300;

    this.panelGraphics.clear();
    this.panelGraphics.fillStyle(0x1a1a2e, 0.95);
    this.panelGraphics.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);
    this.panelGraphics.lineStyle(2, 0x4a4a8a, 1);
    this.panelGraphics.strokeRect(cx - pw / 2, cy - ph / 2, pw, ph);

    this.titleText.setPosition(cx, cy - ph / 2 + 35);
    this.titleText.setVisible(true);

    this.clearButtons();

    upgrades.forEach((upgrade: UpgradeOption, i: number) => {
      const btnY = cy - 40 + i * 70;
      const rarityColor = upgrade.rarity === 'rare' ? '#ffaa00' : '#ffffff';
      const bgColor = upgrade.rarity === 'rare' ? '#3a2a00' : '#2a2a4a';

      const btn = this.scene.add.text(cx, btnY, `${upgrade.icon} ${upgrade.name}\n${upgrade.description}`, {
        fontSize: '16px',
        color: rarityColor,
        backgroundColor: bgColor,
        padding: { x: 15, y: 10 },
        align: 'center',
      }).setOrigin(0.5).setInteractive().setDepth(101);

      btn.on('pointerdown', () => {
        this.hide();
        this.onUpgradeSelected(upgrade.id);
      });
      btn.on('pointerover', () => {
        btn.setStyle({ backgroundColor: '#4a4a8a' });
      });
      btn.on('pointerout', () => {
        btn.setStyle({ backgroundColor: bgColor });
      });

      this.buttons.push(btn);
    });

    this.skipText.setPosition(cx, cy + ph / 2 - 35);
    this.skipText.setVisible(true);
  }

  hide() {
    this.paused = false;
    this.panelGraphics.clear();
    this.titleText.setVisible(false);
    this.skipText.setVisible(false);
    this.clearButtons();
  }

  clearButtons() {
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
  }

  destroy() {
    this.panelGraphics.destroy();
    this.titleText.destroy();
    this.skipText.destroy();
    this.clearButtons();
  }
}
