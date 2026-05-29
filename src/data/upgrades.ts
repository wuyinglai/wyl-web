export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare';
}

export const UPGRADES: UpgradeOption[] = [
  { id: 'attack_up', name: '攻击力提升', description: '攻击力 +10', icon: '⚔️', rarity: 'common' },
  { id: 'attack_speed_up', name: '攻速提升', description: '攻击速度 +20%', icon: '⚡', rarity: 'common' },
  { id: 'health_up', name: '生命提升', description: '最大生命 +30', icon: '❤️', rarity: 'common' },
  { id: 'life_steal', name: '生命偷取', description: '击杀回复 5% 生命', icon: '🧛', rarity: 'rare' },
  { id: 'auto_blade', name: '自动飞刃', description: '+1 个环绕飞刃', icon: '🌀', rarity: 'rare' },
  { id: 'crit_heavy', name: '暴击重击', description: '暴击率 +15%, 暴击伤害 +50%', icon: '💥', rarity: 'rare' },
];

export interface GameState {
  hp: number;
  maxHp: number;
  exp: number;
  expToNext: number;
  level: number;
  kills: number;
  attackDamage: number;
  attackSpeed: number;
  attackRange: number;
  moveSpeed: number;
  critChance: number;
  critDamage: number;
  lifeSteal: number;
  autoBladeCount: number;
}

export function createInitialState(): GameState {
  return {
    hp: 100,
    maxHp: 100,
    exp: 0,
    expToNext: 100,
    level: 1,
    kills: 0,
    attackDamage: 20,
    attackSpeed: 2,
    attackRange: 250,
    moveSpeed: 200,
    critChance: 0.05,
    critDamage: 1.5,
    lifeSteal: 0,
    autoBladeCount: 0,
  };
}

export function applyUpgrade(state: GameState, upgradeId: string): GameState {
  const s = { ...state };
  switch (upgradeId) {
    case 'attack_up':
      s.attackDamage += 10;
      break;
    case 'attack_speed_up':
      s.attackSpeed *= 1.2;
      break;
    case 'health_up':
      s.maxHp += 30;
      s.hp += 30;
      break;
    case 'life_steal':
      s.lifeSteal += 0.05;
      break;
    case 'auto_blade':
      s.autoBladeCount += 1;
      break;
    case 'crit_heavy':
      s.critChance += 0.15;
      s.critDamage += 0.5;
      break;
  }
  return s;
}

export function getRandomUpgrades(count: number): UpgradeOption[] {
  const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
