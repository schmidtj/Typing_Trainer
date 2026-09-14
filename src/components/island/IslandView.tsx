import React, { useState } from 'react';
import { UserProfile } from '../../types/profile';
import { Animal, AnimalId, HabitatId } from '../../types/island';
import { soundManager } from '../../audio/soundManager';
import { Heart, Sparkles, ShoppingBag, Utensils, Home, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface IslandViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const IslandView: React.FC<IslandViewProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<AnimalId>('bunny');
  const [activeTab, setActiveTab] = useState<'sanctuary' | 'wardrobe' | 'habitats'>('sanctuary');
  const [heartAnimId, setHeartAnimId] = useState<string | null>(null);

  const selectedAnimal = profile.island.animals[selectedAnimalId];
  const totalUnlockedAnimals = Object.values(profile.island.animals).filter(a => a.unlocked).length;

  const handlePetAnimal = (animal: Animal) => {
    if (!animal.unlocked) return;
    soundManager.playFeedAnimal();
    setHeartAnimId(animal.id);
    setTimeout(() => setHeartAnimId(null), 1000);
  };

  const handleFeedAnimal = (animalId: AnimalId) => {
    if (profile.island.feedSnacksCount <= 0) return;
    const current = profile.island.animals[animalId];
    if (!current || current.happiness >= 100) return;

    soundManager.playFeedAnimal();
    setHeartAnimId(animalId);
    setTimeout(() => setHeartAnimId(null), 1200);

    const updatedAnimals = { ...profile.island.animals };
    updatedAnimals[animalId] = {
      ...current,
      happiness: Math.min(100, current.happiness + 10),
    };

    onUpdateProfile({
      ...profile,
      island: {
        ...profile.island,
        animals: updatedAnimals,
        feedSnacksCount: profile.island.feedSnacksCount - 1,
      },
    });
  };

  const handleBuySnacks = () => {
    if (profile.coins < 20) return;
    soundManager.playCoin();
    onUpdateProfile({
      ...profile,
      coins: profile.coins - 20,
      island: {
        ...profile.island,
        feedSnacksCount: profile.island.feedSnacksCount + 5,
      },
    });
  };

  const handleBuyCosmetic = (cosmeticId: string, cost: number) => {
    if (profile.coins < cost) return;
    soundManager.playCoin();
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });

    const updatedCosmetics = { ...profile.island.cosmetics };
    if (updatedCosmetics[cosmeticId]) {
      updatedCosmetics[cosmeticId] = {
        ...updatedCosmetics[cosmeticId],
        unlocked: true,
      };
    }

    onUpdateProfile({
      ...profile,
      coins: profile.coins - cost,
      island: {
        ...profile.island,
        cosmetics: updatedCosmetics,
      },
    });
  };

  const handleEquipCosmetic = (animalId: AnimalId, cosmeticId: string | undefined) => {
    soundManager.playKeypress(1);
    const updatedAnimals = { ...profile.island.animals };
    if (updatedAnimals[animalId]) {
      updatedAnimals[animalId] = {
        ...updatedAnimals[animalId],
        hatId: cosmeticId,
      };
    }

    onUpdateProfile({
      ...profile,
      island: {
        ...profile.island,
        animals: updatedAnimals,
      },
    });
  };

  const handleUnlockHabitat = (habitatId: HabitatId, cost: number) => {
    if (profile.coins < cost) return;
    soundManager.playLevelComplete();
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });

    const updatedHabitats = { ...profile.island.habitats };
    if (updatedHabitats[habitatId]) {
      updatedHabitats[habitatId] = {
        ...updatedHabitats[habitatId],
        unlocked: true,
      };
    }

    onUpdateProfile({
      ...profile,
      coins: profile.coins - cost,
      island: {
        ...profile.island,
        habitats: updatedHabitats,
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Sanctuary Header */}
      <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-cozy-text flex items-center gap-2">
              <span>🏝️</span> Cozy Animal Sanctuary
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              {totalUnlockedAnimals} / 9 Rescued
            </span>
          </div>
          <p className="text-sm text-cozy-subtext mt-1">
            Feed, dress up, and care for your animal friends as you master typing!
          </p>
        </div>

        {/* Currency & Snacks Display */}
        <div className="flex items-center gap-3 bg-cozy-panel px-4 py-2.5 rounded-2xl border border-cozy-border">
          <div className="flex items-center gap-1.5 font-bold text-amber-700">
            <span className="text-lg">🪙</span>
            <span>{profile.coins}</span>
          </div>
          <div className="w-px h-6 bg-cozy-border" />
          <div className="flex items-center gap-1.5 font-bold text-rose-600">
            <Utensils className="w-4 h-4" />
            <span>{profile.island.feedSnacksCount} Snacks</span>
          </div>
          <button
            onClick={handleBuySnacks}
            disabled={profile.coins < 20}
            className="text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
          >
            +5 Snacks (20🪙)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveTab('sanctuary')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ${
            activeTab === 'sanctuary'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-cozy-surface text-cozy-subtext hover:bg-cozy-panel border border-cozy-border'
          }`}
        >
          <span>🐾</span> Animals Meadow
        </button>
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ${
            activeTab === 'wardrobe'
              ? 'bg-purple-500 text-white shadow-sm'
              : 'bg-cozy-surface text-cozy-subtext hover:bg-cozy-panel border border-cozy-border'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Boutique & Hats
        </button>
        <button
          onClick={() => setActiveTab('habitats')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ${
            activeTab === 'habitats'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-cozy-surface text-cozy-subtext hover:bg-cozy-panel border border-cozy-border'
          }`}
        >
          <Home className="w-4 h-4" /> Island Habitats
        </button>
      </div>

      {/* TAB 1: SANCTUARY MEADOW */}
      {activeTab === 'sanctuary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Animal Roster Grid */}
          <div className="lg:col-span-2 bg-gradient-to-b from-emerald-50 via-green-50 to-amber-50 p-6 rounded-3xl border-2 border-emerald-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                <span>🌸</span> Sanctuary Residents
              </h3>
              <span className="text-xs text-emerald-700 font-semibold">Click an animal to interact</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.values(profile.island.animals).map((animal) => {
                const isSelected = selectedAnimalId === animal.id;
                const isLoved = heartAnimId === animal.id;
                const hat = animal.hatId ? profile.island.cosmetics[animal.hatId] : null;

                return (
                  <div
                    key={animal.id}
                    onClick={() => {
                      setSelectedAnimalId(animal.id);
                      if (animal.unlocked) handlePetAnimal(animal);
                    }}
                    className={`
                      relative p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                      ${isSelected ? 'ring-4 ring-emerald-400 bg-white shadow-md -translate-y-1' : 'bg-white/80 hover:bg-white shadow-xs hover:-translate-y-0.5'}
                      ${!animal.unlocked ? 'opacity-60 grayscale' : ''}
                    `}
                  >
                    {/* Floating Heart Animation on Pet/Feed */}
                    {isLoved && (
                      <div className="absolute -top-3 animate-bounce text-rose-500 font-extrabold flex items-center gap-1 z-20">
                        <Heart className="w-5 h-5 fill-rose-500" />
                        <span className="text-xs">+Happiness!</span>
                      </div>
                    )}

                    {/* Animal Avatar & Hat */}
                    <div className="relative text-4xl sm:text-5xl mb-2 select-none">
                      {animal.icon}
                      {hat && (
                        <span className="absolute -top-2.5 -right-2 text-xl sm:text-2xl">
                          {hat.icon}
                        </span>
                      )}
                    </div>

                    <span className="font-bold text-cozy-text text-xs sm:text-sm text-center">
                      {animal.name}
                    </span>

                    {animal.unlocked ? (
                      <div className="w-full mt-2 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400 shrink-0" />
                        <div className="w-full bg-rose-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-rose-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${animal.happiness}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-cozy-subtext font-semibold">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Animal Detail Card */}
          <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm flex flex-col justify-between">
            {selectedAnimal ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-5xl p-3 bg-cozy-panel rounded-2xl border border-cozy-border">
                    {selectedAnimal.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-cozy-text">{selectedAnimal.name}</h4>
                    <span className="text-xs font-semibold text-cozy-subtext">{selectedAnimal.species} Companion</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-cozy-subtext leading-relaxed">
                  {selectedAnimal.description}
                </p>

                {selectedAnimal.unlocked ? (
                  <div className="space-y-3 pt-2 border-t border-cozy-border">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-rose-600 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500" /> Happiness
                        </span>
                        <span>{selectedAnimal.happiness}%</span>
                      </div>
                      <div className="w-full bg-rose-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full"
                          style={{ width: `${selectedAnimal.happiness}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-cozy-panel p-3 rounded-2xl border border-cozy-border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-cozy-subtext">Favorite Food:</span>
                        <span className="font-bold text-cozy-text">{selectedAnimal.favoriteFood}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cozy-subtext">Equipped Accessory:</span>
                        <span className="font-bold text-cozy-text">
                          {selectedAnimal.hatId
                            ? profile.island.cosmetics[selectedAnimal.hatId]?.name
                            : 'None'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFeedAnimal(selectedAnimal.id)}
                      disabled={profile.island.feedSnacksCount <= 0 || selectedAnimal.happiness >= 100}
                      className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <Utensils className="w-4 h-4" />
                      {selectedAnimal.happiness >= 100
                        ? 'Full & Happy! (100% ❤️)'
                        : profile.island.feedSnacksCount <= 0
                        ? 'No Snacks Left'
                        : 'Feed Snack (+10 Happiness)'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-600" /> How to Unlock:
                    </span>
                    <p className="text-amber-800 leading-relaxed">
                      {selectedAnimal.unlockRequirement}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: WARDROBE & BOUTIQUE */}
      {activeTab === 'wardrobe' && (
        <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-cozy-text flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600" /> Island Boutique & Dressing Room
              </h3>
              <p className="text-xs text-cozy-subtext mt-0.5">
                Styling: <span className="font-bold text-cozy-text">{selectedAnimal?.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-sm">
              <span>🪙</span> {profile.coins} Coins
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Unequip / None Option */}
            <div
              onClick={() => handleEquipCosmetic(selectedAnimalId, undefined)}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition ${
                !selectedAnimal?.hatId ? 'border-purple-500 bg-purple-50' : 'border-cozy-border bg-cozy-panel hover:bg-white'
              }`}
            >
              <span className="text-3xl mb-2">🚫</span>
              <span className="font-bold text-xs text-cozy-text">No Accessory</span>
            </div>

            {Object.values(profile.island.cosmetics).map((item) => {
              const isEquipped = selectedAnimal?.hatId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-between transition ${
                    isEquipped ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300' : 'border-cozy-border bg-cozy-panel'
                  }`}
                >
                  <span className="text-3xl mb-1">{item.icon}</span>
                  <span className="font-bold text-xs text-cozy-text text-center mb-2">{item.name}</span>

                  {item.unlocked ? (
                    <button
                      onClick={() => handleEquipCosmetic(selectedAnimalId, item.id)}
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                        isEquipped
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-cozy-border text-cozy-text hover:bg-purple-100'
                      }`}
                    >
                      {isEquipped ? 'Equipped' : 'Wear Hat'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyCosmetic(item.id, item.cost)}
                      disabled={profile.coins < item.cost}
                      className="w-full py-1.5 px-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white shadow-xs transition"
                    >
                      Buy ({item.cost} 🪙)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ISLAND HABITATS */}
      {activeTab === 'habitats' && (
        <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-cozy-text flex items-center gap-2">
              <Home className="w-5 h-5 text-sky-600" /> Expand Your Island Habitats
            </h3>
            <span className="text-xs text-cozy-subtext">Build new cozy homes for rescued friends</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(profile.island.habitats).map((habitat) => {
              return (
                <div
                  key={habitat.id}
                  className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition ${
                    habitat.unlocked
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-cozy-border bg-cozy-panel'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl p-2 bg-white rounded-xl shadow-xs">{habitat.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-cozy-text text-sm sm:text-base">{habitat.name}</h4>
                      <span className="text-xs text-cozy-subtext">Capacity: {habitat.capacity} animals</span>
                    </div>
                  </div>

                  {habitat.unlocked ? (
                    <div className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 px-3 rounded-xl text-center border border-emerald-200">
                      ✓ Open & Active
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUnlockHabitat(habitat.id, habitat.cost)}
                      disabled={profile.coins < habitat.cost}
                      className="w-full py-2.5 px-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Build Habitat ({habitat.cost} 🪙)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
