import React, { useEffect, useRef } from 'react';
import { Lesson } from '../../types/curriculum';
import { UserProfile, LevelProgress } from '../../types/profile';
import { useTypingEngine, TypingEngineResult } from '../../engine/useTypingEngine';
import { VirtualKeyboard } from '../keyboard/VirtualKeyboard';
import { HandGuide } from '../keyboard/HandGuide';
import { ArrowLeft, RotateCcw, Sparkles, Star, Award, Zap, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../audio/soundManager';

interface TypingArenaProps {
  lesson: Lesson;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onNextLesson?: () => void;
  onGoToSanctuary?: () => void;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  lesson,
  profile,
  onUpdateProfile,
  onBackToMenu,
  onNextLesson,
  onGoToSanctuary,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLessonComplete = (result: TypingEngineResult) => {
    // Determine stars
    let stars = 1;
    if (result.netWpm >= lesson.targetWpm || result.accuracy >= lesson.minAccuracy) {
      stars = 2;
    }
    if (result.netWpm >= lesson.targetWpm && result.accuracy >= lesson.minAccuracy) {
      stars = 3;
    }

    if (stars === 3) {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }

    // Update level progress
    const existingProgress = profile.completedLevels[lesson.id] as LevelProgress | undefined;
    const newStars = Math.max(existingProgress?.stars || 0, stars);
    const newHighWpm = Math.max(existingProgress?.highWpm || 0, result.netWpm);
    const newBestAcc = Math.max(existingProgress?.bestAccuracy || 0, result.accuracy);

    // Update key statistics
    const updatedKeyStats = { ...profile.metrics.keyStats };
    for (const [char, errCount] of Object.entries(result.errorKeys)) {
      const existing = updatedKeyStats[char] || { char, totalAttempts: 0, errors: 0, totalLatencyMs: 0 };
      updatedKeyStats[char] = {
        ...existing,
        errors: existing.errors + errCount,
      };
    }
    // Record attempts and latency
    for (const [char, latencies] of Object.entries(result.keyLatencies)) {
      const existing = updatedKeyStats[char] || { char, totalAttempts: 0, errors: 0, totalLatencyMs: 0 };
      const sumLatency = latencies.reduce((a, b) => a + b, 0);
      updatedKeyStats[char] = {
        ...existing,
        totalAttempts: existing.totalAttempts + latencies.length,
        totalLatencyMs: existing.totalLatencyMs + sumLatency,
      };
    }

    // Check animal unlocks
    const updatedAnimals = { ...profile.island.animals };
    let newlyUnlockedAnimalName = '';
    if (lesson.unlockAnimalId && updatedAnimals[lesson.unlockAnimalId]) {
      if (!updatedAnimals[lesson.unlockAnimalId].unlocked) {
        updatedAnimals[lesson.unlockAnimalId] = {
          ...updatedAnimals[lesson.unlockAnimalId],
          unlocked: true,
        };
        newlyUnlockedAnimalName = updatedAnimals[lesson.unlockAnimalId].name;
      }
    }

    // Compute updated metrics
    const totalWords = profile.metrics.totalWordsTyped + Math.round(lesson.practiceText.length / 5);
    const totalSecs = profile.metrics.totalTimeSeconds + result.durationSeconds;
    const highestWpm = Math.max(profile.metrics.highestWpm, result.netWpm);

    const prevSessions = profile.metrics.sessionHistory || [];
    const newSession = {
      id: 'session_' + Date.now(),
      timestamp: Date.now(),
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      durationSeconds: result.durationSeconds,
      rawWpm: result.rawWpm,
      netWpm: result.netWpm,
      accuracy: result.accuracy,
      stars,
      errorKeys: result.errorKeys,
    };

    const updatedProfile: UserProfile = {
      ...profile,
      xp: profile.xp + lesson.rewardXp + (stars === 3 ? 20 : 0),
      coins: profile.coins + lesson.rewardCoins + (stars === 3 ? 15 : 0),
      completedLevels: {
        ...profile.completedLevels,
        [lesson.id]: {
          stars: newStars,
          highWpm: newHighWpm,
          bestAccuracy: newBestAcc,
          timesPlayed: (existingProgress?.timesPlayed || 0) + 1,
          lastPlayed: Date.now(),
        },
      },
      island: {
        ...profile.island,
        animals: updatedAnimals,
      },
      metrics: {
        ...profile.metrics,
        totalWordsTyped: totalWords,
        totalTimeSeconds: totalSecs,
        highestWpm,
        averageWpm: Math.round((profile.metrics.averageWpm * prevSessions.length + result.netWpm) / (prevSessions.length + 1)),
        averageAccuracy: Math.round((profile.metrics.averageAccuracy * prevSessions.length + result.accuracy) / (prevSessions.length + 1)),
        keyStats: updatedKeyStats,
        sessionHistory: [newSession, ...prevSessions].slice(0, 50),
      },
    };

    onUpdateProfile(updatedProfile);

    if (newlyUnlockedAnimalName) {
      setTimeout(() => {
        soundManager.playCoin();
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
      }, 600);
    }
  };

  const {
    status,
    currentIndex,
    currentChar,
    hasCurrentError,
    comboStreak,
    maxCombo,
    netWpm,
    accuracy,
    handleKeyDown,
    reset,
  } = useTypingEngine({
    targetText: lesson.practiceText,
    strictBackspace: profile.settings.strictBackspace,
    onComplete: handleLessonComplete,
  });

  // Listen to keyboard events globally while in typing arena
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/modals
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      handleKeyDown(e);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKeyDown]);

  const targetChars = lesson.practiceText.split('');

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto space-y-5">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cozy-surface hover:bg-cozy-panel text-cozy-text font-bold text-sm border border-cozy-border transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Levels
        </button>

        <div className="text-center">
          <span className="text-xs uppercase font-extrabold tracking-wider text-cozy-subtext">
            Stage {lesson.stageId} • Lesson {lesson.stageLessonNumber}
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-cozy-text">{lesson.title}</h2>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-cozy-surface hover:bg-cozy-panel text-cozy-subtext font-bold text-xs border border-cozy-border transition"
          title="Restart Lesson"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* Live Metric Ribbon */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {/* Speed / WPM */}
        <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Speed
          </span>
          <div className="text-xl sm:text-2xl font-black text-cozy-text mt-0.5">
            {netWpm} <span className="text-xs font-semibold text-cozy-subtext">WPM</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" /> Accuracy
          </span>
          <div className="text-xl sm:text-2xl font-black text-cozy-text mt-0.5">
            {accuracy}%
          </div>
        </div>

        {/* Combo Streak */}
        <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center relative overflow-hidden">
          <span className="text-[11px] font-bold text-rose-500 uppercase flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Combo
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
            {comboStreak}x
          </div>
          {comboStreak >= 10 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 animate-pulse" />
          )}
        </div>

        {/* Goal / Target */}
        <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Goal
          </span>
          <div className="text-xs sm:text-sm font-bold text-cozy-text mt-1">
            {lesson.targetWpm} WPM • {lesson.minAccuracy}%
          </div>
        </div>
      </div>

      {/* Main Interactive Typing Prompt Arena */}
      <div className="relative p-6 sm:p-10 bg-cozy-surface rounded-3xl border-2 border-cozy-border shadow-sm min-h-[160px] flex flex-col items-center justify-center">
        {/* Error Warning Prompt */}
        {hasCurrentError && (
          <div className="absolute top-3 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200 animate-wiggle">
            Oops! Press <span className="underline">Backspace</span> to fix the character
          </div>
        )}

        {/* Text Display */}
        <div className="text-xl sm:text-2xl md:text-3xl font-mono leading-relaxed tracking-wide text-center flex flex-wrap justify-center select-none max-w-2xl">
          {targetChars.map((char, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            let charClass = 'text-cozy-subtext/40';

            if (isCompleted) {
              charClass = 'text-emerald-600 font-semibold';
            } else if (isCurrent) {
              if (hasCurrentError) {
                charClass = 'bg-red-400 text-white rounded-md px-1 ring-2 ring-red-400 animate-wiggle';
              } else {
                charClass = 'bg-amber-300 text-amber-950 font-black rounded-md px-1 ring-2 ring-amber-400 shadow-sm animate-pulse-glow';
              }
            }

            return (
              <span key={index} className={`relative transition-all duration-100 ${charClass}`}>
                {char === ' ' ? (
                  isCurrent ? (
                    <span className="opacity-90 underline font-sans text-xs px-1">␣space</span>
                  ) : (
                    '\u00A0'
                  )
                ) : (
                  char
                )}
              </span>
            );
          })}
        </div>

        {/* Idle prompt indicator */}
        {status === 'idle' && (
          <p className="text-xs sm:text-sm text-cozy-subtext mt-4 animate-bounce-subtle">
            Start typing anytime on your keyboard to begin!
          </p>
        )}
      </div>

      {/* Visual Keyboard & Hands Guide */}
      {profile.settings.showHandGuide && (
        <HandGuide activeChar={currentChar} />
      )}

      {profile.settings.showKeyboard && (
        <VirtualKeyboard activeChar={currentChar} hasError={hasCurrentError} />
      )}

      {/* Completion Modal */}
      {status === 'completed' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-cozy-surface p-6 sm:p-8 rounded-3xl border-2 border-cozy-border shadow-xl max-w-md w-full text-center space-y-5 animate-bounce-subtle">
            <div className="text-5xl">🎉</div>
            <h3 className="text-2xl font-black text-cozy-text">Lesson Completed!</h3>

            {/* Stars Earned */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((starIdx) => {
                const earned = (netWpm >= lesson.targetWpm && accuracy >= lesson.minAccuracy)
                  ? true
                  : (starIdx <= 2 && (netWpm >= lesson.targetWpm || accuracy >= lesson.minAccuracy))
                  ? true
                  : starIdx === 1;

                return (
                  <Star
                    key={starIdx}
                    className={`w-10 h-10 transition transform ${
                      earned ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-sm' : 'text-slate-200'
                    }`}
                  />
                );
              })}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3 bg-cozy-panel p-4 rounded-2xl border border-cozy-border text-sm">
              <div>
                <span className="text-xs text-cozy-subtext font-semibold">Speed:</span>
                <div className="text-lg font-extrabold text-cozy-text">{netWpm} WPM</div>
              </div>
              <div>
                <span className="text-xs text-cozy-subtext font-semibold">Accuracy:</span>
                <div className="text-lg font-extrabold text-cozy-text">{accuracy}%</div>
              </div>
              <div>
                <span className="text-xs text-cozy-subtext font-semibold">Best Streak:</span>
                <div className="text-lg font-extrabold text-rose-600">{maxCombo}x</div>
              </div>
              <div>
                <span className="text-xs text-cozy-subtext font-semibold">Rewards:</span>
                <div className="text-sm font-extrabold text-amber-600 flex items-center justify-center gap-1">
                  <span>+{lesson.rewardCoins} 🪙</span>
                  <span>+{lesson.rewardXp} XP</span>
                </div>
              </div>
            </div>

            {/* Unlocked Animal Celebration */}
            {lesson.unlockAnimalId && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-3 text-left">
                <span className="text-3xl">
                  {profile.island.animals[lesson.unlockAnimalId]?.icon || '🐾'}
                </span>
                <div>
                  <h5 className="font-extrabold text-emerald-900 text-sm">New Animal Rescued!</h5>
                  <p className="text-xs text-emerald-700">
                    {profile.island.animals[lesson.unlockAnimalId]?.name} joined your sanctuary!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={reset}
                className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-cozy-panel hover:bg-cozy-border text-cozy-text transition"
              >
                Try Again
              </button>
              {onNextLesson && (
                <button
                  onClick={onNextLesson}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition"
                >
                  Next Lesson →
                </button>
              )}
              {onGoToSanctuary && (
                <button
                  onClick={onGoToSanctuary}
                  className="py-3 px-4 rounded-2xl font-bold text-sm bg-purple-500 hover:bg-purple-600 text-white transition flex items-center justify-center gap-1"
                >
                  <Heart className="w-4 h-4 fill-white" /> Sanctuary
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
