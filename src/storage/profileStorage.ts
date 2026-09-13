import { ProfileRegistry, UserProfile } from '../types/profile';
import { createNewProfile } from './defaultData';

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
    // Check if active profile exists
    if (!parsed.profiles[parsed.activeProfileId]) {
      const firstId = Object.keys(parsed.profiles)[0];
      if (firstId) {
        parsed.activeProfileId = firstId;
      } else {
        return createInitialRegistry();
      }
    }
    return parsed;
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
  return registry.profiles[registry.activeProfileId] || createInitialRegistry().profiles[registry.activeProfileId];
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
    saveRegistry(parsed);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message || 'Failed to parse JSON backup.' };
  }
}
