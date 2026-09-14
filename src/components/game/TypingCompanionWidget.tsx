import React, { useEffect, useRef, useState } from 'react';
import { Animal } from '../../types/island';

interface TypingCompanionWidgetProps {
  animal: Animal;
  hatIcon?: string;
  comboStreak: number;
  hasError: boolean;
  lessonComplete: boolean;
}

const COMBO_CHEERS: Record<number, string> = {
  5: 'Nice streak!',
  10: 'Keep going!',
  20: 'Wow!!',
  50: 'Legendary!',
};

const ENCOURAGEMENT = 'You have got this!';
const CELEBRATION = 'You did it! Bonus XP!';

export const TypingCompanionWidget: React.FC<TypingCompanionWidgetProps> = ({
  animal,
  hatIcon,
  comboStreak,
  hasError,
  lessonComplete,
}) => {
  const [bubble, setBubble] = useState<string | null>(null);
  const seenMilestones = useRef(new Set<number>());

  useEffect(() => {
    const milestones = [5, 10, 20, 50];
    for (const mark of milestones) {
      if (comboStreak >= mark && !seenMilestones.current.has(mark)) {
        seenMilestones.current.add(mark);
        setBubble(COMBO_CHEERS[mark]);
      }
    }
    if (comboStreak === 0) {
      seenMilestones.current.clear();
    }
  }, [comboStreak]);

  useEffect(() => {
    if (hasError) {
      setBubble(ENCOURAGEMENT);
    }
  }, [hasError]);

  useEffect(() => {
    if (lessonComplete) {
      setBubble(CELEBRATION);
    }
  }, [lessonComplete]);

  useEffect(() => {
    if (!bubble) return;
    const timer = window.setTimeout(() => setBubble(null), 2200);
    return () => window.clearTimeout(timer);
  }, [bubble]);

  return (
    <div className="flex items-center gap-3 bg-cozy-surface border border-cozy-border rounded-2xl px-3 py-2 shadow-xs">
      <div className="relative text-3xl animate-bounce-subtle">
        <span>{animal.icon}</span>
        {hatIcon && <span className="absolute -top-2 -right-2 text-lg">{hatIcon}</span>}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold text-cozy-subtext uppercase tracking-wide">
          Companion
        </p>
        <p className="text-sm font-bold text-cozy-text truncate">{animal.name}</p>
        {bubble && (
          <p className="mt-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-2 py-1">
            {bubble}
          </p>
        )}
      </div>
    </div>
  );
};
