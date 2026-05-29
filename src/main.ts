import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

// Global error handling
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[GLOBAL ERROR]', message, source, lineno, colno, error);
  return false;
};

window.onunhandledrejection = (event) => {
  console.error('[UNHANDLED PROMISE]', event.reason);
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'app',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

console.log('WYL WEB GAME STARTED');
console.log(`[Init] Phaser version: ${Phaser.VERSION}`);
console.log(`[Init] Canvas: ${config.width}x${config.height}`);
