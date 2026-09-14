import { ProfileRegistry, UserProfile } from '../types/profile';
import {
  Animal,
  AnimalId,
  CosmeticItem,
  Habitat,
  HabitatId,
  HABITAT_CROPS,
  HARVEST_COOLDOWN_MS,
  IslandState,
  NATIVE_HABITAT_BY_ANIMAL,
  ANIMAL_IDS,
  HABITAT_IDS,
  capacityForLevel,
  isAnimalId,
  isHabitatId,
} from '../types/island';
import { createDefaultIslandState, createNewProfile, INITIAL_ANIMALS, INITIAL_COSMETICS, INITIAL_HABITATS } from './defaultData';

const STORAGE_KEY = 'cozy_animal_typing_trainer_data_v1';
const CURRENT_VERSION = 1;

export function calculateLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // Level formula: Level L requires 50 * L * L total XP
  // Level 1: 0, Level 2: 50, Level 3: 200, Level 4: 450, Level 5: 800, etc.
  let level = 1;
  while (50 * level * level <= xp) {
    level++;
  }
  const baseForCurrent = 50 * (level - 1) * (level - 1);
  const baseForNext = 50 * level * level;
  const currentLevelXp = xp - baseForCurrent;
  const neededForNext = baseForNext - baseForCurrent;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / neededForNext) * 100)));

  return {
    level,
    currentLevelXp,
    nextLevelXp: neededForNext,
    progressPercent,
  };
}

function migrateAnimal(id: AnimalId, raw: unknown): Animal {
  const fallback = INITIAL_ANIMALS[id];
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const assigned = isHabitatId(source.assignedHabitatId) ? source.assignedHabitatId : fallback.assignedHabitatId;
  const native = isHabitatId(source.nativeHabitatId) ? source.nativeHabitatId : NATIVE_HABITAT_BY_ANIMAL[id];

  return {
    ...fallback,
    ...source,
    id,
    nativeHabitatId: native,
    assignedHabitatId: assigned,
    unlocked: typeof source.unlocked === 'boolean' ? source.unlocked : fallback.unlocked,
    happiness: typeof source.happiness === 'number' ? Math.max(0, Math.min(100, source.happiness)) : fallback.happiness,
    hatId: typeof source.hatId === 'string' ? source.hatId : fallback.hatId,
  };
}

function migrateHabitat(id: HabitatId, raw: unknown): Habitat {
  const fallback = INITIAL_HABITATS[id];
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const crop = HABITAT_CROPS[id];
  const level = typeof source.level === 'number' && source.level >= 1 ? Math.min(3, Math.floor(source.level)) : fallback.level;
  const lastHarvestTime = typeof source.lastHarvestTime === 'number' ? source.lastHarvestTime : 0;
  const harvestReady =
    typeof source.harvestReady === 'boolean'
      ? source.harvestReady
      : lastHarvestTime === 0 || Date.now() - lastHarvestTime >= HARVEST_COOLDOWN_MS;

  return {
    ...fallback,
    ...source,
    id,
    level,
    capacity: typeof source.capacity === 'number' && source.capacity > 0 ? source.capacity : capacityForLevel(level),
    biomeTheme: isHabitatId(source.biomeTheme) ? source.biomeTheme : id,
    harvestCropName: typeof source.harvestCropName === 'string' ? source.harvestCropName : crop.harvestCropName,
    harvestCropIcon: typeof source.harvestCropIcon === 'string' ? source.harvestCropIcon : crop.harvestCropIcon,
    harvestReady,
    lastHarvestTime,
    decorations: Array.isArray(source.decorations)
      ? source.decorations.filter((item): item is string => typeof item === 'string')
      : [],
    unlocked: typeof source.unlocked === 'boolean' ? source.unlocked : fallback.unlocked,
    cost: typeof source.cost === 'number' ? source.cost : fallback.cost,
  };
}

function migrateCosmetic(id: string, raw: unknown): CosmeticItem {
  const fallback = INITIAL_COSMETICS[id];
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  if (!fallback) {
    return {
      id,
      name: typeof source.name === 'string' ? source.name : id,
      type: source.type === 'bow' || source.type === 'glasses' || source.type === 'flower' ? source.type : 'hat',
      icon: typeof source.icon === 'string' ? source.icon : '🎩',
      cost: typeof source.cost === 'number' ? source.cost : 0,
      unlocked: source.unlocked === true,
    };
  }

  return {
    ...fallback,
    ...source,
    id,
    unlocked: typeof source.unlocked === 'boolean' ? source.unlocked : fallback.unlocked,
  };
}

export function migrateIslandState(island: any): IslandState {
  const defaults = createDefaultIslandState();
  if (!island || typeof island !== 'object') {
    return defaults;
  }

  const rawAnimals = island.animals && typeof island.animals === 'object' ? island.animals : {};
  const animals = { ...defaults.animals };
  for (const id of ANIMAL_IDS) {
    animals[id] = migrateAnimal(id, rawAnimals[id]);
  }

  const rawHabitats = island.habitats && typeof island.habitats === 'object' ? island.habitats : {};
  const habitats = { ...defaults.habitats };
  for (const id of HABITAT_IDS) {
    habitats[id] = migrateHabitat(id, rawHabitats[id]);
  }

  const rawCosmetics = island.cosmetics && typeof island.cosmetics === 'object' ? island.cosmetics : {};
  const cosmetics = { ...defaults.cosmetics };
  for (const id of Object.keys({ ...INITIAL_COSMETICS, ...rawCosmetics })) {
    cosmetics[id] = migrateCosmetic(id, rawCosmetics[id] ?? cosmetics[id]);
  }

  const selectedHabitatId = isHabitatId(island.selectedHabitatId) ? island.selectedHabitatId : 'meadow';
  const activeCompanionId = isAnimalId(island.activeCompanionId) ? island.activeCompanionId : 'bunny';

  return {
    animals,
    habitats,
    cosmetics,
    feedSnacksCount: typeof island.feedSnacksCount === 'number' ? Math.max(0, island.feedSnacksCount) : defaults.feedSnacksCount,
    selectedHabitatId,
    activeCompanionId,
  };
}

function migrateProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    island: migrateIslandState(profile.island),
  };
}

function migrateRegistry(registry: ProfileRegistry): ProfileRegistry {
  const profiles: Record<string, UserProfile> = {};
  for (const [id, profile] of Object.entries(registry.profiles)) {
    profiles[id] = migrateProfile(profile);
  }
  return { ...registry, profiles };
}

export function loadRegistry(): ProfileRegistry {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialRegistry();
    }
    const parsed = JSON.parse(raw) as ProfileRegistry;
    if (!parsed || typeof parsed !== 'object' || !parsed.profiles || !parsed.activeProfileId) {
      return createInitialRegistry();
    }
    if (!parsed.profiles[parsed.activeProfileId]) {
      const firstId = Object.keys(parsed.profiles)[0];
      if (firstId) {
        parsed.activeProfileId = firstId;
      } else {
        return createInitialRegistry();
      }
    }
    return migrateRegistry(parsed);
  } catch {
    return createInitialRegistry();
  }
}

export function saveRegistry(registry: ProfileRegistry): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

function createInitialRegistry(): ProfileRegistry {
  const defaultProfile = createNewProfile('Little Explorer', '🐰', 1);
  const registry: ProfileRegistry = {
    version: CURRENT_VERSION,
    activeProfileId: defaultProfile.id,
    profiles: {
      [defaultProfile.id]: defaultProfile,
    },
  };
  saveRegistry(registry);
  return registry;
}

export function getActiveProfile(): UserProfile {
  const registry = loadRegistry();
  const profile = registry.profiles[registry.activeProfileId] || createInitialRegistry().profiles[registry.activeProfileId];
  return {
    ...profile,
    island: migrateIslandState(profile.island),
  };
}

export function saveActiveProfile(profile: UserProfile): void {
  const registry = loadRegistry();
  registry.profiles[profile.id] = {
    ...profile,
    lastPlayed: Date.now(),
  };
  saveRegistry(registry);
}

export function createAndSwitchProfile(name: string, avatar: string, startStage: number = 1): UserProfile {
  const registry = loadRegistry();
  const profile = createNewProfile(name, avatar, startStage);
  registry.profiles[profile.id] = profile;
  registry.activeProfileId = profile.id;
  saveRegistry(registry);
  return profile;
}

export function switchActiveProfile(profileId: string): UserProfile | null {
  const registry = loadRegistry();
  if (registry.profiles[profileId]) {
    registry.activeProfileId = profileId;
    saveRegistry(registry);
    return registry.profiles[profileId];
  }
  return null;
}

export function deleteProfile(profileId: string): boolean {
  const registry = loadRegistry();
  const profileIds = Object.keys(registry.profiles);
  if (profileIds.length <= 1) {
    return false; // Cannot delete last remaining profile
  }
  delete registry.profiles[profileId];
  if (registry.activeProfileId === profileId) {
    registry.activeProfileId = Object.keys(registry.profiles)[0];
  }
  saveRegistry(registry);
  return true;
}

export function exportBackupJson(): string {
  const registry = loadRegistry();
  return JSON.stringify(registry, null, 2);
}

export function importBackupJson(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString) as ProfileRegistry;
    if (!parsed || typeof parsed !== 'object' || !parsed.profiles || !parsed.activeProfileId) {
      return { success: false, error: 'Invalid profile backup file format.' };
    }
    const profileKeys = Object.keys(parsed.profiles);
    if (profileKeys.length === 0) {
      return { success: false, error: 'Backup does not contain any profiles.' };
    }
    saveRegistry(migrateRegistry(parsed));
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message || 'Failed to parse JSON backup.' };
  }
}
