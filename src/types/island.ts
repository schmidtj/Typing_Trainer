export type AnimalId =
  | 'bunny'
  | 'kitten'
  | 'fox'
  | 'panda'
  | 'penguin'
  | 'owl'
  | 'capybara'
  | 'otter'
  | 'dragon';

export const ANIMAL_IDS: readonly AnimalId[] = [
  'bunny',
  'kitten',
  'fox',
  'panda',
  'penguin',
  'owl',
  'capybara',
  'otter',
  'dragon',
];

export type HabitatId =
  | 'meadow'
  | 'forest_treehouse'
  | 'crystal_pond'
  | 'bamboo_grove'
  | 'snowy_peak'
  | 'fairy_hollow';

export const HABITAT_IDS: readonly HabitatId[] = [
  'meadow',
  'forest_treehouse',
  'crystal_pond',
  'bamboo_grove',
  'snowy_peak',
  'fairy_hollow',
];

export const NATIVE_HABITAT_BY_ANIMAL: Record<AnimalId, HabitatId> = {
  bunny: 'meadow',
  kitten: 'meadow',
  fox: 'forest_treehouse',
  panda: 'bamboo_grove',
  penguin: 'snowy_peak',
  owl: 'forest_treehouse',
  capybara: 'crystal_pond',
  otter: 'crystal_pond',
  dragon: 'fairy_hollow',
};

export const HABITAT_CROPS: Record<HabitatId, { harvestCropName: string; harvestCropIcon: string }> = {
  meadow: { harvestCropName: 'Clover Berries', harvestCropIcon: '🍓' },
  forest_treehouse: { harvestCropName: 'Acorn Clusters', harvestCropIcon: '🌰' },
  crystal_pond: { harvestCropName: 'Lily Nectar', harvestCropIcon: '🪷' },
  bamboo_grove: { harvestCropName: 'Bamboo Shoots', harvestCropIcon: '🎋' },
  snowy_peak: { harvestCropName: 'Frost Berries', harvestCropIcon: '🫐' },
  fairy_hollow: { harvestCropName: 'Starlight Dew', harvestCropIcon: '✨' },
};

export const MAX_HABITAT_LEVEL = 3;
export const HABITAT_CAPACITY_BY_LEVEL: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6,
};
export const HABITAT_UPGRADE_COST: Record<number, number> = {
  1: 75,
  2: 180,
};
export const HARVEST_SNACK_REWARD = 3;
export const HARVEST_COIN_REWARD = 15;
export const LEVEL_3_HARVEST_BONUS = 0.1;
export const HARVEST_COOLDOWN_MS = 60_000;
export const COMPANION_LESSON_BONUS_XP = 10;

export function isAnimalId(value: unknown): value is AnimalId {
  return typeof value === 'string' && (ANIMAL_IDS as readonly string[]).includes(value);
}

export function isHabitatId(value: unknown): value is HabitatId {
  return typeof value === 'string' && (HABITAT_IDS as readonly string[]).includes(value);
}

export function capacityForLevel(level: number): number {
  if (level >= 3) return HABITAT_CAPACITY_BY_LEVEL[3];
  if (level >= 2) return HABITAT_CAPACITY_BY_LEVEL[2];
  return HABITAT_CAPACITY_BY_LEVEL[1];
}

export function upgradeCostForLevel(level: number): number {
  return HABITAT_UPGRADE_COST[level] ?? 0;
}

export function harvestRewardsForLevel(level: number): { snacks: number; coins: number } {
  const bonus = level >= MAX_HABITAT_LEVEL ? 1 + LEVEL_3_HARVEST_BONUS : 1;
  return {
    snacks: HARVEST_SNACK_REWARD,
    coins: Math.round(HARVEST_COIN_REWARD * bonus),
  };
}

export interface Animal {
  id: AnimalId;
  name: string;
  species: string;
  icon: string;
  description: string;
  unlockRequirement: string;
  unlocked: boolean;
  assignedHabitatId?: HabitatId;
  nativeHabitatId: HabitatId;
  hatId?: string;
  happiness: number;
  favoriteFood: string;
}

export interface Habitat {
  id: HabitatId;
  name: string;
  icon: string;
  unlocked: boolean;
  cost: number;
  level: number;
  capacity: number;
  biomeTheme: HabitatId;
  harvestCropName: string;
  harvestCropIcon: string;
  harvestReady: boolean;
  lastHarvestTime: number;
  decorations: string[];
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'hat' | 'bow' | 'glasses' | 'flower';
  icon: string;
  cost: number;
  unlocked: boolean;
}

export interface IslandState {
  animals: Record<AnimalId, Animal>;
  habitats: Record<HabitatId, Habitat>;
  cosmetics: Record<string, CosmeticItem>;
  feedSnacksCount: number;
  selectedHabitatId: HabitatId;
  activeCompanionId: AnimalId;
}
