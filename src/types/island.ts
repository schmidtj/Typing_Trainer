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

export interface Animal {
  id: AnimalId;
  name: string;
  species: string;
  icon: string;
  description: string;
  unlockRequirement: string;
  unlocked: boolean;
  assignedHabitatId?: string;
  hatId?: string;
  happiness: number; // 0-100
  favoriteFood: string;
}

export type HabitatId =
  | 'meadow'
  | 'forest_treehouse'
  | 'crystal_pond'
  | 'bamboo_grove'
  | 'snowy_peak'
  | 'fairy_hollow';

export interface Habitat {
  id: HabitatId;
  name: string;
  icon: string;
  unlocked: boolean;
  cost: number;
  level: number;
  capacity: number;
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
}
