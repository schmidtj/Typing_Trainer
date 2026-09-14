import {
  Animal,
  AnimalId,
  CosmeticItem,
  Habitat,
  HabitatId,
  HABITAT_CROPS,
  IslandState,
  NATIVE_HABITAT_BY_ANIMAL,
  capacityForLevel,
} from '../types/island';
import { UserProfile, UserSettings } from '../types/profile';
import { UserMetrics } from '../types/metrics';

export const INITIAL_SETTINGS: UserSettings = {
  soundVolume: 0.7,
  soundMuted: false,
  showKeyboard: true,
  showHandGuide: true,
  fontSize: 'normal',
  strictBackspace: true,
};

export const INITIAL_METRICS: UserMetrics = {
  totalWordsTyped: 0,
  totalTimeSeconds: 0,
  highestWpm: 0,
  averageWpm: 0,
  averageAccuracy: 100,
  keyStats: {},
  sessionHistory: [],
};

function animal(
  id: AnimalId,
  fields: Omit<Animal, 'id' | 'nativeHabitatId' | 'assignedHabitatId'> & {
    assignedHabitatId?: HabitatId;
  },
): Animal {
  return {
    id,
    nativeHabitatId: NATIVE_HABITAT_BY_ANIMAL[id],
    ...fields,
  };
}

export const INITIAL_ANIMALS: Record<AnimalId, Animal> = {
  bunny: animal('bunny', {
    name: 'Barnaby Bunny',
    species: 'Bunny',
    icon: '🐰',
    description: 'Bounces with joy whenever you land on the home row keys!',
    unlockRequirement: 'Available from the start to guide your first steps.',
    unlocked: true,
    assignedHabitatId: 'meadow',
    happiness: 90,
    favoriteFood: 'Crisp Carrot',
  }),
  kitten: animal('kitten', {
    name: 'Mochi Kitten',
    species: 'Kitten',
    icon: '🐱',
    description: 'Loves batting at top-row keys and purring to rhythmic typing.',
    unlockRequirement: 'Complete Stage 1: Home Row Haven.',
    unlocked: false,
    happiness: 80,
    favoriteFood: 'Tuna Treats',
  }),
  fox: animal('fox', {
    name: 'Rusty Fox',
    species: 'Fox',
    icon: '🦊',
    description: 'Quick and clever scout who loves diving down to the bottom row.',
    unlockRequirement: 'Complete Stage 2: Top Row Treks.',
    unlocked: false,
    happiness: 75,
    favoriteFood: 'Sweet Wildberries',
  }),
  panda: animal('panda', {
    name: 'Bao Bao Panda',
    species: 'Panda',
    icon: '🐼',
    description: 'Zen gentle giant who loves reaching high for Capital Shift keys.',
    unlockRequirement: 'Complete Stage 3: Bottom Row Beach.',
    unlocked: false,
    happiness: 85,
    favoriteFood: 'Bamboo Shoots',
  }),
  penguin: animal('penguin', {
    name: 'Pip Penguin',
    species: 'Penguin',
    icon: '🐧',
    description: 'Slides smoothly across number rows and symbols.',
    unlockRequirement: 'Complete Stage 4: Capital Cliffs.',
    unlocked: false,
    happiness: 80,
    favoriteFood: 'Glacier Pops',
  }),
  owl: animal('owl', {
    name: 'Professor Hoot',
    species: 'Owl',
    icon: '🦉',
    description: 'Wise scholar who loves common sight words and reading stories.',
    unlockRequirement: 'Complete Stage 5: Number & Symbol Safari.',
    unlocked: false,
    happiness: 90,
    favoriteFood: 'Acorn Crunch',
  }),
  capybara: animal('capybara', {
    name: 'Cappy Capybara',
    species: 'Capybara',
    icon: '🦫',
    description: 'The most relaxed animal on the island. Never stressed by typos.',
    unlockRequirement: 'Complete Stage 6: Sight Word Woods.',
    unlocked: false,
    happiness: 95,
    favoriteFood: 'Yuzu Melon',
  }),
  otter: animal('otter', {
    name: 'Ollie Otter',
    species: 'Otter',
    icon: '🦦',
    description: 'Fast swimmer who loves floating downstream in speed sprints.',
    unlockRequirement: 'Score 50+ WPM in Berry Catch Arcade.',
    unlocked: false,
    happiness: 85,
    favoriteFood: 'River Clams',
  }),
  dragon: animal('dragon', {
    name: 'Sparky Baby Dragon',
    species: 'Dragon',
    icon: '🐲',
    description: 'Legendary cozy dragon. Breathes sparkling rainbow flames at 80+ WPM!',
    unlockRequirement: 'Master Stage 8 or reach 80+ WPM.',
    unlocked: false,
    happiness: 100,
    favoriteFood: 'Fire Blossom Honey',
  }),
};

function habitat(
  id: HabitatId,
  fields: Pick<Habitat, 'name' | 'icon' | 'unlocked' | 'cost'> & { level?: number },
): Habitat {
  const level = fields.level ?? 1;
  const crop = HABITAT_CROPS[id];
  return {
    id,
    name: fields.name,
    icon: fields.icon,
    unlocked: fields.unlocked,
    cost: fields.cost,
    level,
    capacity: capacityForLevel(level),
    biomeTheme: id,
    harvestCropName: crop.harvestCropName,
    harvestCropIcon: crop.harvestCropIcon,
    harvestReady: true,
    lastHarvestTime: 0,
    decorations: [],
  };
}

export const INITIAL_HABITATS: Record<HabitatId, Habitat> = {
  meadow: habitat('meadow', {
    name: 'Sunny Clover Meadow',
    icon: '🌸',
    unlocked: true,
    cost: 0,
  }),
  forest_treehouse: habitat('forest_treehouse', {
    name: 'Oak Treehouse',
    icon: '🏡',
    unlocked: false,
    cost: 100,
  }),
  crystal_pond: habitat('crystal_pond', {
    name: 'Sparkle Lily Pond',
    icon: '🪷',
    unlocked: false,
    cost: 250,
  }),
  bamboo_grove: habitat('bamboo_grove', {
    name: 'Zen Bamboo Grove',
    icon: '🎋',
    unlocked: false,
    cost: 400,
  }),
  snowy_peak: habitat('snowy_peak', {
    name: 'Frosty Peak Igloo',
    icon: '❄️',
    unlocked: false,
    cost: 600,
  }),
  fairy_hollow: habitat('fairy_hollow', {
    name: 'Starlight Fairy Hollow',
    icon: '✨',
    unlocked: false,
    cost: 1000,
  }),
};

export const INITIAL_COSMETICS: Record<string, CosmeticItem> = {
  straw_hat: { id: 'straw_hat', name: 'Sunny Straw Hat', type: 'hat', icon: '👒', cost: 50, unlocked: true },
  party_hat: { id: 'party_hat', name: 'Party Cone Hat', type: 'hat', icon: '🎉', cost: 75, unlocked: false },
  wizard_hat: { id: 'wizard_hat', name: 'Starry Wizard Hat', type: 'hat', icon: '🧙', cost: 150, unlocked: false },
  crown: { id: 'crown', name: 'Golden Typing Crown', type: 'hat', icon: '👑', cost: 300, unlocked: false },
  red_bow: { id: 'red_bow', name: 'Cheery Red Bow', type: 'bow', icon: '🎀', cost: 60, unlocked: true },
  bell_collar: { id: 'bell_collar', name: 'Chime Bell Collar', type: 'bow', icon: '🔔', cost: 120, unlocked: false },
  star_glasses: { id: 'star_glasses', name: 'Star Sunglasses', type: 'glasses', icon: '⭐', cost: 90, unlocked: false },
  daisy_flower: { id: 'daisy_flower', name: 'Meadow Daisy', type: 'flower', icon: '🌼', cost: 40, unlocked: true },
};

function cloneRecord<T extends Record<string, unknown>>(record: T): T {
  return JSON.parse(JSON.stringify(record)) as T;
}

export function createDefaultIslandState(): IslandState {
  return {
    animals: cloneRecord(INITIAL_ANIMALS),
    habitats: cloneRecord(INITIAL_HABITATS),
    cosmetics: cloneRecord(INITIAL_COSMETICS),
    feedSnacksCount: 5,
    selectedHabitatId: 'meadow',
    activeCompanionId: 'bunny',
  };
}

export function createNewProfile(name: string, avatar: string = '🐰', startAtStage: number = 1): UserProfile {
  const id = 'profile_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    name: name.trim() || 'Hero Typist',
    avatar,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
    level: 1,
    xp: 0,
    coins: 50,
    gems: 5,
    currentStageId: startAtStage,
    currentLessonId: `stage-${startAtStage}-lesson-1`,
    completedLevels: {},
    island: createDefaultIslandState(),
    metrics: { ...INITIAL_METRICS, keyStats: {}, sessionHistory: [] },
    settings: { ...INITIAL_SETTINGS },
    arcadeHighScore: 0,
    achievements: ['first_steps'],
  };
}
