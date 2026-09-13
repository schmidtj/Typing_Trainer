import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadRegistry,
  getActiveProfile,
  saveActiveProfile,
  createAndSwitchProfile,
  switchActiveProfile,
  deleteProfile,
  exportBackupJson,
  importBackupJson,
  calculateLevel,
} from '../profileStorage';

describe('profileStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates an initial registry if storage is empty', () => {
    const registry = loadRegistry();
    expect(registry.version).toBe(1);
    expect(registry.activeProfileId).toBeDefined();
    const active = getActiveProfile();
    expect(active.name).toBe('Little Explorer');
    expect(active.coins).toBe(50);
  });

  it('can create a new profile and switch to it', () => {
    const newProfile = createAndSwitchProfile('Sophie', '🐱', 2);
    expect(newProfile.name).toBe('Sophie');
    expect(newProfile.avatar).toBe('🐱');
    expect(newProfile.currentStageId).toBe(2);

    const active = getActiveProfile();
    expect(active.id).toBe(newProfile.id);
    expect(active.name).toBe('Sophie');
  });

  it('allows switching between profiles and prevents deleting the last profile', () => {
    const p1 = getActiveProfile();
    const p2 = createAndSwitchProfile('Player Two', '🦊', 1);

    expect(getActiveProfile().id).toBe(p2.id);

    switchActiveProfile(p1.id);
    expect(getActiveProfile().id).toBe(p1.id);

    // Delete p2
    const deleted = deleteProfile(p2.id);
    expect(deleted).toBe(true);

    // Cannot delete last profile
    const deletedLast = deleteProfile(p1.id);
    expect(deletedLast).toBe(false);
  });

  it('can export and import backup JSON safely', () => {
    const profile = getActiveProfile();
    profile.coins = 999;
    saveActiveProfile(profile);

    const json = exportBackupJson();
    expect(json).toContain('"coins": 999');

    localStorage.clear();
    const importResult = importBackupJson(json);
    expect(importResult.success).toBe(true);

    const restored = getActiveProfile();
    expect(restored.coins).toBe(999);
  });

  it('calculates RPG levels accurately based on XP', () => {
    // 0 XP -> Level 1
    const lvl1 = calculateLevel(0);
    expect(lvl1.level).toBe(1);

    // 50 XP -> Level 2
    const lvl2 = calculateLevel(50);
    expect(lvl2.level).toBe(2);

    // 200 XP -> Level 3
    const lvl3 = calculateLevel(200);
    expect(lvl3.level).toBe(3);
  });
});
