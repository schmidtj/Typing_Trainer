import React from 'react';
import { Heart, Star } from 'lucide-react';
import { Animal, AnimalId, HabitatId } from '../../types/island';

interface HabitatAnimalSpriteProps {
  animal: Animal;
  habitatId: HabitatId;
  activeCompanionId: AnimalId;
  hatIcon?: string;
  selected?: boolean;
  loved?: boolean;
  onClick?: () => void;
}

export const HabitatAnimalSprite: React.FC<HabitatAnimalSpriteProps> = ({
  animal,
  habitatId,
  activeCompanionId,
  hatIcon,
  selected = false,
  loved = false,
  onClick,
}) => {
  const isNative = animal.nativeHabitatId === habitatId;
  const isCompanion = animal.id === activeCompanionId;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition ${
        selected
          ? 'bg-white ring-4 ring-emerald-400 shadow-md -translate-y-1'
          : 'bg-white/80 hover:bg-white shadow-xs hover:-translate-y-0.5'
      }`}
    >
      {loved && (
        <div className="absolute -top-3 text-rose-500 font-extrabold flex items-center gap-1 z-20 animate-bounce">
          <Heart className="w-5 h-5 fill-rose-500" />
          <span className="text-xs">+Happiness!</span>
        </div>
      )}

      <div className="relative text-4xl sm:text-5xl select-none animate-bounce-subtle">
        <span>{animal.icon}</span>
        {hatIcon && (
          <span className="absolute -top-2.5 -right-2 text-xl sm:text-2xl">{hatIcon}</span>
        )}
        {isCompanion && (
          <span
            className="absolute -top-2 -left-2 text-sm bg-amber-100 border border-amber-300 rounded-full w-6 h-6 flex items-center justify-center"
            title="Active Companion"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          </span>
        )}
        {isNative && (
          <span
            className="absolute -bottom-1 -right-2 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full px-1.5 py-0.5"
            title="Native Harmony"
          >
            Harmony
          </span>
        )}
      </div>

      <span className="font-bold text-cozy-text text-xs sm:text-sm text-center">{animal.name}</span>

      <div className="w-full flex items-center gap-1">
        <Heart className="w-3 h-3 text-rose-400 fill-rose-400 shrink-0" />
        <div className="w-full bg-rose-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-rose-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${animal.happiness}%` }}
          />
        </div>
      </div>
    </button>
  );
};
