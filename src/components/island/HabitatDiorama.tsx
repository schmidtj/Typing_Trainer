import React, { useMemo, useState } from 'react';
import { Heart, Sparkles, Utensils, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../../types/profile';
import { Animal, AnimalId, HabitatId, HABITAT_IDS, MAX_HABITAT_LEVEL, upgradeCostForLevel } from '../../types/island';
import { soundManager } from '../../audio/soundManager';
import {
  assignableAnimals,
  assignAnimal,
  feedAnimal,
  harvestHabitat,
  residentsOf,
  selectHabitat,
  setActiveCompanion,
  unlockedHabitatsWithRoom,
  upgradeHabitat,
} from '../../island/islandActions';
import { HabitatParticleCanvas } from './HabitatParticleCanvas';
import { HabitatAnimalSprite } from './HabitatAnimalSprite';
import { HABITAT_SCENE } from './habitatTheme';

interface HabitatDioramaProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const HabitatDiorama: React.FC<HabitatDioramaProps> = ({ profile, onUpdateProfile }) => {
  const selectedHabitatId = profile.island.selectedHabitatId;
  const habitat = profile.island.habitats[selectedHabitatId];
  const residents = useMemo(
    () => residentsOf(profile.island, selectedHabitatId),
    [profile.island, selectedHabitatId],
  );
  const [focusedAnimalId, setFocusedAnimalId] = useState<AnimalId>(
    residents[0]?.id ?? 'bunny',
  );
  const [heartAnimId, setHeartAnimId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const focusedAnimal = profile.island.animals[focusedAnimalId];
  const scene = HABITAT_SCENE[selectedHabitatId];
  const upgradeCost = upgradeCostForLevel(habitat.level);
  const canUpgrade = habitat.unlocked && habitat.level < MAX_HABITAT_LEVEL && profile.coins >= upgradeCost;
  const candidates = assignableAnimals(profile.island, selectedHabitatId);
  const moveTargets = unlockedHabitatsWithRoom(profile.island, focusedAnimalId).filter(
    (id) => id !== selectedHabitatId,
  );

  const playHearts = (animalId: AnimalId) => {
    setHeartAnimId(animalId);
    window.setTimeout(() => setHeartAnimId(null), 1000);
  };

  const handleSelectHabitat = (habitatId: HabitatId) => {
    const next = selectHabitat(profile, habitatId);
    const nextResidents = residentsOf(next.island, habitatId);
    setFocusedAnimalId(nextResidents[0]?.id ?? focusedAnimalId);
    setAssignOpen(false);
    onUpdateProfile(next);
  };

  const handlePet = (animal: Animal) => {
    if (!animal.unlocked) return;
    soundManager.playFeedAnimal();
    playHearts(animal.id);
    setFocusedAnimalId(animal.id);
  };

  const handleFeed = (animalId: AnimalId) => {
    const next = feedAnimal(profile, animalId);
    if (!next) return;
    soundManager.playFeedAnimal();
    playHearts(animalId);
    onUpdateProfile(next);
  };

  const handleCompanion = (animalId: AnimalId) => {
    const next = setActiveCompanion(profile, animalId);
    if (!next) return;
    soundManager.playKeypress(2);
    onUpdateProfile(next);
  };

  const handleMove = (animalId: AnimalId, habitatId: HabitatId) => {
    const next = assignAnimal(profile, animalId, habitatId);
    if (!next) return;
    soundManager.playKeypress(1);
    onUpdateProfile(next);
  };

  const handleAssign = (animalId: AnimalId) => {
    const next = assignAnimal(profile, animalId, selectedHabitatId);
    if (!next) return;
    soundManager.playKeypress(1);
    setAssignOpen(false);
    setFocusedAnimalId(animalId);
    onUpdateProfile(next);
  };

  const handleHarvest = () => {
    const next = harvestHabitat(profile, selectedHabitatId);
    if (!next) return;
    soundManager.playCoin();
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
    onUpdateProfile(next);
  };

  const handleUpgrade = () => {
    const next = upgradeHabitat(profile, selectedHabitatId);
    if (!next) return;
    soundManager.playLevelComplete();
    confetti({ particleCount: 55, spread: 80, origin: { y: 0.6 } });
    onUpdateProfile(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {HABITAT_IDS.map((habitatId) => {
          const item = profile.island.habitats[habitatId];
          const active = habitatId === selectedHabitatId;
          return (
            <button
              key={habitatId}
              type="button"
              onClick={() => handleSelectHabitat(habitatId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                active
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : item.unlocked
                    ? 'bg-white text-cozy-text border-cozy-border hover:bg-cozy-panel'
                    : 'bg-cozy-panel text-cozy-subtext border-dashed border-cozy-border'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      <div
        className={`relative overflow-hidden rounded-3xl border-2 border-emerald-200/80 min-h-[360px] bg-gradient-to-b ${scene.gradient}`}
      >
        <HabitatParticleCanvas biome={habitat.biomeTheme} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-emerald-950 text-lg flex items-center gap-2">
                <span>{habitat.icon}</span> {habitat.name}
              </h3>
              <p className="text-xs text-emerald-800 font-semibold">
                Level {habitat.level} • {residents.length}/{habitat.capacity} residents
                {habitat.level >= MAX_HABITAT_LEVEL ? ' • +10% harvest bonus' : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleHarvest}
                disabled={!habitat.unlocked || !habitat.harvestReady}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white shadow-xs"
              >
                <span>{habitat.harvestCropIcon}</span>
                {habitat.harvestReady ? `Harvest ${habitat.harvestCropName}` : 'Crops growing...'}
              </button>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={!canUpgrade}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white shadow-xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                {habitat.level >= MAX_HABITAT_LEVEL
                  ? 'Max Level'
                  : `Upgrade Habitat (${upgradeCost} 🪙)`}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {residents.map((animal) => {
              const hat = animal.hatId ? profile.island.cosmetics[animal.hatId] : undefined;
              return (
                <HabitatAnimalSprite
                  key={animal.id}
                  animal={animal}
                  habitatId={selectedHabitatId}
                  activeCompanionId={profile.island.activeCompanionId}
                  hatIcon={hat?.icon}
                  selected={focusedAnimalId === animal.id}
                  loved={heartAnimId === animal.id}
                  onClick={() => handlePet(animal)}
                />
              );
            })}

            {habitat.unlocked && residents.length < habitat.capacity && (
              <button
                type="button"
                onClick={() => setAssignOpen((open) => !open)}
                className="min-h-[140px] rounded-2xl border-2 border-dashed border-emerald-400 bg-white/60 hover:bg-white text-emerald-800 font-bold text-sm flex flex-col items-center justify-center gap-1"
              >
                <span className="text-2xl">🐾</span>
                Assign Animal
              </button>
            )}
          </div>

          {assignOpen && (
            <div className="bg-white/90 border border-emerald-200 rounded-2xl p-3 space-y-2">
              <p className="text-xs font-bold text-emerald-900">Choose a friend to move in</p>
              <div className="flex flex-wrap gap-2">
                {candidates.length === 0 && (
                  <span className="text-xs text-cozy-subtext">No other unlocked animals to assign.</span>
                )}
                {candidates.map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => handleAssign(animal.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold"
                  >
                    {animal.icon} {animal.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {focusedAnimal?.unlocked && focusedAnimal.assignedHabitatId === selectedHabitatId && (
            <div className="bg-white/90 border border-cozy-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{focusedAnimal.icon}</span>
                <div>
                  <h4 className="font-extrabold text-cozy-text">{focusedAnimal.name}</h4>
                  <p className="text-xs text-cozy-subtext">{focusedAnimal.species} • loves {focusedAnimal.favoriteFood}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePet(focusedAnimal)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" /> Pet
                </button>
                <button
                  type="button"
                  onClick={() => handleFeed(focusedAnimal.id)}
                  disabled={profile.island.feedSnacksCount <= 0 || focusedAnimal.happiness >= 100}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white flex items-center gap-1.5"
                >
                  <Utensils className="w-3.5 h-3.5" />
                      {focusedAnimal.happiness >= 100
                    ? 'Full & Happy! (100% ❤️)'
                    : profile.island.feedSnacksCount <= 0
                      ? 'No Snacks Left'
                      : `Feed Snack (${focusedAnimal.favoriteFood})`}
                </button>
                <button
                  type="button"
                  onClick={() => handleCompanion(focusedAnimal.id)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {profile.island.activeCompanionId === focusedAnimal.id
                    ? 'Active Companion'
                    : 'Set as Active Companion'}
                </button>
              </div>

              {moveTargets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-cozy-subtext">Move to</span>
                  {moveTargets.map((habitatId) => (
                    <button
                      key={habitatId}
                      type="button"
                      onClick={() => handleMove(focusedAnimal.id, habitatId)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cozy-panel border border-cozy-border hover:bg-white"
                    >
                      {profile.island.habitats[habitatId].icon} {profile.island.habitats[habitatId].name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
