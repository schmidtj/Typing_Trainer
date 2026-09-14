import { UserProfile } from '../types/profile';
import {
  Animal,
  AnimalId,
  HabitatId,
  IslandState,
  MAX_HABITAT_LEVEL,
  capacityForLevel,
  harvestRewardsForLevel,
  upgradeCostForLevel,
} from '../types/island';

export function residentsOf(island: IslandState, habitatId: HabitatId): Animal[] {
  return Object.values(island.animals).filter(
    (animal) => animal.unlocked && animal.assignedHabitatId === habitatId,
  );
}

export function feedAnimal(profile: UserProfile, animalId: AnimalId): UserProfile | null {
  const animal = profile.island.animals[animalId];
  if (!animal?.unlocked || profile.island.feedSnacksCount <= 0 || animal.happiness >= 100) {
    return null;
  }

  return {
    ...profile,
    island: {
      ...profile.island,
      feedSnacksCount: profile.island.feedSnacksCount - 1,
      animals: {
        ...profile.island.animals,
        [animalId]: {
          ...animal,
          happiness: Math.min(100, animal.happiness + 10),
        },
      },
    },
  };
}

export function buySnacks(profile: UserProfile): UserProfile | null {
  if (profile.coins < 20) return null;
  return {
    ...profile,
    coins: profile.coins - 20,
    island: {
      ...profile.island,
      feedSnacksCount: profile.island.feedSnacksCount + 5,
    },
  };
}

export function buyCosmetic(profile: UserProfile, cosmeticId: string): UserProfile | null {
  const cosmetic = profile.island.cosmetics[cosmeticId];
  if (!cosmetic || cosmetic.unlocked || profile.coins < cosmetic.cost) return null;

  return {
    ...profile,
    coins: profile.coins - cosmetic.cost,
    island: {
      ...profile.island,
      cosmetics: {
        ...profile.island.cosmetics,
        [cosmeticId]: { ...cosmetic, unlocked: true },
      },
    },
  };
}

export function equipCosmetic(
  profile: UserProfile,
  animalId: AnimalId,
  cosmeticId: string | undefined,
): UserProfile | null {
  const animal = profile.island.animals[animalId];
  if (!animal?.unlocked) return null;
  if (cosmeticId) {
    const cosmetic = profile.island.cosmetics[cosmeticId];
    if (!cosmetic?.unlocked) return null;
  }

  return {
    ...profile,
    island: {
      ...profile.island,
      animals: {
        ...profile.island.animals,
        [animalId]: { ...animal, hatId: cosmeticId },
      },
    },
  };
}

export function unlockHabitat(profile: UserProfile, habitatId: HabitatId): UserProfile | null {
  const habitat = profile.island.habitats[habitatId];
  if (!habitat || habitat.unlocked || profile.coins < habitat.cost) return null;

  return {
    ...profile,
    coins: profile.coins - habitat.cost,
    island: {
      ...profile.island,
      habitats: {
        ...profile.island.habitats,
        [habitatId]: { ...habitat, unlocked: true },
      },
    },
  };
}

export function selectHabitat(profile: UserProfile, habitatId: HabitatId): UserProfile {
  return {
    ...profile,
    island: {
      ...profile.island,
      selectedHabitatId: habitatId,
    },
  };
}

export function setActiveCompanion(profile: UserProfile, animalId: AnimalId): UserProfile | null {
  const animal = profile.island.animals[animalId];
  if (!animal?.unlocked) return null;

  return {
    ...profile,
    island: {
      ...profile.island,
      activeCompanionId: animalId,
    },
  };
}

export function assignAnimal(
  profile: UserProfile,
  animalId: AnimalId,
  habitatId: HabitatId,
): UserProfile | null {
  const animal = profile.island.animals[animalId];
  const habitat = profile.island.habitats[habitatId];
  if (!animal?.unlocked || !habitat?.unlocked) return null;

  const occupied = residentsOf(profile.island, habitatId).filter((resident) => resident.id !== animalId);
  if (occupied.length >= habitat.capacity) return null;

  return {
    ...profile,
    island: {
      ...profile.island,
      animals: {
        ...profile.island.animals,
        [animalId]: { ...animal, assignedHabitatId: habitatId },
      },
    },
  };
}

export function harvestHabitat(profile: UserProfile, habitatId: HabitatId): UserProfile | null {
  const habitat = profile.island.habitats[habitatId];
  if (!habitat?.unlocked || !habitat.harvestReady) return null;

  const rewards = harvestRewardsForLevel(habitat.level);
  return {
    ...profile,
    coins: profile.coins + rewards.coins,
    island: {
      ...profile.island,
      feedSnacksCount: profile.island.feedSnacksCount + rewards.snacks,
      habitats: {
        ...profile.island.habitats,
        [habitatId]: {
          ...habitat,
          harvestReady: false,
          lastHarvestTime: Date.now(),
        },
      },
    },
  };
}

export function upgradeHabitat(profile: UserProfile, habitatId: HabitatId): UserProfile | null {
  const habitat = profile.island.habitats[habitatId];
  if (!habitat?.unlocked || habitat.level >= MAX_HABITAT_LEVEL) return null;

  const cost = upgradeCostForLevel(habitat.level);
  if (cost <= 0 || profile.coins < cost) return null;

  const nextLevel = habitat.level + 1;
  const decoration = nextLevel === 2 ? 'Garden Lanterns' : 'Harmony Fountain';

  return {
    ...profile,
    coins: profile.coins - cost,
    island: {
      ...profile.island,
      habitats: {
        ...profile.island.habitats,
        [habitatId]: {
          ...habitat,
          level: nextLevel,
          capacity: capacityForLevel(nextLevel),
          decorations: [...habitat.decorations, decoration],
        },
      },
    },
  };
}

export function assignableAnimals(island: IslandState, habitatId: HabitatId): Animal[] {
  return Object.values(island.animals).filter((animal) => {
    if (!animal.unlocked) return false;
    return animal.assignedHabitatId !== habitatId;
  });
}

export function unlockedHabitatsWithRoom(island: IslandState, exceptAnimalId?: AnimalId): HabitatId[] {
  return Object.values(island.habitats)
    .filter((habitat) => {
      if (!habitat.unlocked) return false;
      const occupied = residentsOf(island, habitat.id).filter((animal) => animal.id !== exceptAnimalId);
      return occupied.length < habitat.capacity;
    })
    .map((habitat) => habitat.id);
}
