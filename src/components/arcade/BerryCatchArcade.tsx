import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../../types/profile';
import { soundManager } from '../../audio/soundManager';
import { ArrowLeft, Play, RotateCcw, Heart, Zap, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BerryCatchArcadeProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBack: () => void;
}

interface FallingBerry {
  id: string;
  word: string;
  x: number; // percentage 10% - 90%
  y: number; // percentage 0% - 100%
  speed: number;
  icon: string;
  color: string;
}

const BERRIES = ['🍓', '🫐', '🍒', '🍇', '🍎', '🍑'];

const WORD_POOLS = {
  easy: [
    'cat', 'dog', 'sun', 'hat', 'cup', 'red', 'run', 'fox', 'jam', 'tree',
    'fish', 'frog', 'bear', 'duck', 'star', 'cake', 'kite', 'lion', 'bird', 'rose'
  ],
  medium: [
    'bunny', 'kitten', 'puppy', 'flower', 'meadow', 'garden', 'forest', 'island',
    'spring', 'silver', 'bright', 'yellow', 'stream', 'little', 'sparkle', 'butter'
  ],
  hard: [
    'blossom', 'sunshine', 'rainbow', 'butterfly', 'delight', 'whisper', 'harmony',
    'fantastic', 'wonderful', 'mountain', 'velocity', 'champion', 'dragonfly', 'starlight'
  ]
};

export const BerryCatchArcade: React.FC<BerryCatchArcadeProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [berries, setBerries] = useState<FallingBerry[]>([]);
  const [typedInput, setTypedInput] = useState('');
  const [score, setScore] = useState(0);
  const [wordsCaught, setWordsCaught] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [arcadeWpm, setArcadeWpm] = useState(0);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const spawnTimerRef = useRef<number>(0);
  const gameStartRef = useRef<number>(0);
  const totalLettersTypedRef = useRef<number>(0);

  const startGame = () => {
    setGameState('playing');
    setBerries([]);
    setTypedInput('');
    setScore(0);
    setWordsCaught(0);
    setHearts(3);
    setCombo(0);
    setMaxCombo(0);
    setArcadeWpm(0);
    lastTimeRef.current = Date.now();
    gameStartRef.current = Date.now();
    spawnTimerRef.current = 0;
    totalLettersTypedRef.current = 0;
  };

  const spawnBerry = useCallback(() => {
    const pool = WORD_POOLS[difficulty];
    const word = pool[Math.floor(Math.random() * pool.length)];
    const x = Math.floor(Math.random() * 70) + 15; // 15% to 85%
    const icon = BERRIES[Math.floor(Math.random() * BERRIES.length)];
    const baseSpeed = (difficulty === 'easy' ? 7 : difficulty === 'medium' ? 11 : 16);

    const newBerry: FallingBerry = {
      id: 'berry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      word,
      x,
      y: 0,
      speed: baseSpeed,
      icon,
      color: 'bg-white',
    };

    setBerries(prev => [...prev, newBerry]);
  }, [difficulty]);

  // Main game tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Update WPM
      const elapsedMins = (now - gameStartRef.current) / 60000;
      if (elapsedMins > 0.05) {
        setArcadeWpm(Math.round((totalLettersTypedRef.current / 5) / elapsedMins));
      }

      // Spawning
      spawnTimerRef.current += delta;
      const spawnInterval = difficulty === 'easy' ? 3.0 : difficulty === 'medium' ? 2.2 : 1.5;
      if (spawnTimerRef.current >= spawnInterval) {
        spawnBerry();
        spawnTimerRef.current = 0;
      }

      // Update positions
      setBerries(prev => {
        const next: FallingBerry[] = [];
        let lostHeart = false;

        for (const b of prev) {
          const nextY = b.y + b.speed * delta;
          if (nextY >= 88) {
            // Hit bottom basket ground!
            lostHeart = true;
          } else {
            next.push({ ...b, y: nextY });
          }
        }

        if (lostHeart) {
          soundManager.playError();
          setCombo(0);
          setHearts(h => {
            const newH = h - 1;
            if (newH <= 0) {
              setGameState('gameover');
            }
            return newH;
          });
        }

        return next;
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, difficulty, spawnBerry]);

  // Handle game over logic
  useEffect(() => {
    if (gameState === 'gameover') {
      soundManager.playLevelComplete();

      // Check high score & unlocks
      const coinsEarned = Math.round(score / 10);
      const isNewHigh = score > profile.arcadeHighScore;

      const updatedAnimals = { ...profile.island.animals };
      if (arcadeWpm >= 50 && !updatedAnimals.otter.unlocked) {
        updatedAnimals.otter = {
          ...updatedAnimals.otter,
          unlocked: true,
        };
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
      }

      onUpdateProfile({
        ...profile,
        arcadeHighScore: Math.max(profile.arcadeHighScore, score),
        coins: profile.coins + coinsEarned,
        xp: profile.xp + Math.round(score / 5),
        island: {
          ...profile.island,
          animals: updatedAnimals,
        },
      });

      if (isNewHigh) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    }
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard capture for game
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        setTypedInput(prev => prev.slice(0, -1));
        return;
      }

      if (e.key.length !== 1 || e.key === ' ') return;
      e.preventDefault();

      const nextInput = typedInput + e.key.toLowerCase();
      totalLettersTypedRef.current += 1;

      // Check if any falling berry matches nextInput
      const matching = berries.filter(b => b.word.toLowerCase().startsWith(nextInput));

      if (matching.length > 0) {
        soundManager.playKeypress(combo);
        setTypedInput(nextInput);

        // Check if any berry was fully typed!
        const completedBerry = matching.find(b => b.word.toLowerCase() === nextInput);
        if (completedBerry) {
          // Berry caught!
          soundManager.playCoin();
          const nextCombo = combo + 1;
          setCombo(nextCombo);
          setMaxCombo(prev => Math.max(prev, nextCombo));

          const multiplier = Math.min(5, Math.floor(nextCombo / 3) + 1);
          const points = completedBerry.word.length * 10 * multiplier;
          setScore(s => s + points);
          setWordsCaught(w => w + 1);

          // Remove berry
          setBerries(prev => prev.filter(b => b.id !== completedBerry.id));
          setTypedInput('');
        }
      } else {
        // Mistype
        soundManager.playError();
        setCombo(0);
        setTypedInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, typedInput, berries, combo]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cozy-surface hover:bg-cozy-panel text-cozy-text font-bold text-sm border border-cozy-border transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-cozy-text flex items-center justify-center gap-2">
            <span>🫐</span> Berry Catch Arcade
          </h2>
          <span className="text-xs text-cozy-subtext font-semibold">
            Catch falling berries by typing before they reach the ground!
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200 text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>High: {profile.arcadeHighScore}</span>
        </div>
      </div>

      {/* MENU SCREEN */}
      {gameState === 'menu' && (
        <div className="bg-gradient-to-b from-sky-50 via-emerald-50 to-amber-50 p-8 rounded-3xl border-2 border-emerald-200 shadow-sm text-center space-y-6">
          <div className="text-6xl animate-bounce-subtle">🧺🍓🫐</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-cozy-text">Ready to Catch Sweet Berries?</h3>
            <p className="text-xs sm:text-sm text-cozy-subtext mt-1 max-w-md mx-auto">
              Test your speed and reflexes. Catch berries into Barnaby & Ollie Otter's baskets!
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-lg mx-auto">
            <button
              onClick={() => setDifficulty('easy')}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition ${
                difficulty === 'easy'
                  ? 'border-emerald-500 bg-white shadow-md'
                  : 'border-cozy-border bg-white/70 hover:bg-white'
              }`}
            >
              <div className="text-2xl mb-1">🌱</div>
              <div className="font-extrabold text-cozy-text text-sm">Breezy Breeze</div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">20-40 WPM</div>
            </button>

            <button
              onClick={() => setDifficulty('medium')}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition ${
                difficulty === 'medium'
                  ? 'border-amber-500 bg-white shadow-md'
                  : 'border-cozy-border bg-white/70 hover:bg-white'
              }`}
            >
              <div className="text-2xl mb-1">🌊</div>
              <div className="font-extrabold text-cozy-text text-sm">River Rapids</div>
              <div className="text-xs text-amber-600 font-semibold mt-0.5">40-70 WPM</div>
            </button>

            <button
              onClick={() => setDifficulty('hard')}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition ${
                difficulty === 'hard'
                  ? 'border-rose-500 bg-white shadow-md'
                  : 'border-cozy-border bg-white/70 hover:bg-white'
              }`}
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-extrabold text-cozy-text text-sm">Mastery Rush</div>
              <div className="text-xs text-rose-600 font-semibold mt-0.5">70-100+ WPM</div>
            </button>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base rounded-2xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5 fill-white" /> Start Catching!
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Live Arcade Dashboard */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center">
              <span className="text-[11px] font-bold text-cozy-subtext uppercase">Score</span>
              <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">{score}</div>
            </div>

            <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center">
              <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Speed
              </span>
              <div className="text-xl sm:text-2xl font-black text-cozy-text mt-0.5">{arcadeWpm} WPM</div>
            </div>

            <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center">
              <span className="text-[11px] font-bold text-rose-500 uppercase flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Multiplier
              </span>
              <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
                {Math.min(5, Math.floor(combo / 3) + 1)}x
              </div>
            </div>

            <div className="bg-cozy-surface p-3 rounded-2xl border border-cozy-border shadow-xs text-center">
              <span className="text-[11px] font-bold text-cozy-subtext uppercase">Hearts</span>
              <div className="flex items-center justify-center gap-1 text-lg sm:text-xl font-black mt-1">
                {[1, 2, 3].map(h => (
                  <Heart
                    key={h}
                    className={`w-5 h-5 ${
                      h <= hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Falling Canvas Arena */}
          <div className="relative h-96 w-full bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-100 rounded-3xl border-2 border-cozy-border shadow-inner overflow-hidden">
            {/* Background Clouds & Sun */}
            <div className="absolute top-4 left-6 text-3xl opacity-75">☁️</div>
            <div className="absolute top-8 right-12 text-2xl opacity-75">☁️</div>
            <div className="absolute top-3 right-4 text-4xl">☀️</div>

            {/* Falling Berries */}
            {berries.map(b => {
              const isMatchPrefix = typedInput.length > 0 && b.word.toLowerCase().startsWith(typedInput);
              const matchedPart = isMatchPrefix ? b.word.substring(0, typedInput.length) : '';
              const remainderPart = isMatchPrefix ? b.word.substring(typedInput.length) : b.word;

              return (
                <div
                  key={b.id}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-transform"
                >
                  <span className="text-3xl filter drop-shadow-sm">{b.icon}</span>
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-mono font-bold shadow-md border ${
                      isMatchPrefix
                        ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-300 scale-105'
                        : 'bg-white/95 border-cozy-border text-cozy-text'
                    }`}
                  >
                    {isMatchPrefix ? (
                      <>
                        <span className="text-emerald-600 underline font-black">{matchedPart}</span>
                        <span>{remainderPart}</span>
                      </>
                    ) : (
                      <span>{b.word}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bottom Basket & Animals Ground */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-emerald-300 via-emerald-200 to-transparent flex items-end justify-center pb-2 gap-8">
              <div className="text-3xl">🐰</div>
              <div className="text-4xl">🧺</div>
              <div className="text-3xl">🦦</div>
            </div>

            {/* Current Typed Buffer Indicator */}
            {typedInput && (
              <div className="absolute bottom-16 inset-x-0 flex justify-center">
                <div className="bg-amber-400 text-amber-950 font-mono font-extrabold text-sm px-4 py-1 rounded-full shadow-md border border-amber-500 animate-pulse">
                  Typing: {typedInput}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <div className="bg-cozy-surface p-8 rounded-3xl border-2 border-cozy-border shadow-lg text-center space-y-6 max-w-md mx-auto animate-bounce-subtle">
          <div className="text-5xl">🧺✨</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-cozy-text">Basket Full!</h3>
            <p className="text-xs sm:text-sm text-cozy-subtext mt-1">
              Wonderful job catching berries for our island friends!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-cozy-panel p-4 rounded-2xl border border-cozy-border text-sm">
            <div>
              <span className="text-xs text-cozy-subtext font-semibold">Final Score:</span>
              <div className="text-xl font-black text-amber-600">{score}</div>
            </div>
            <div>
              <span className="text-xs text-cozy-subtext font-semibold">Speed:</span>
              <div className="text-xl font-black text-cozy-text">{arcadeWpm} WPM</div>
            </div>
            <div>
              <span className="text-xs text-cozy-subtext font-semibold">Words Caught:</span>
              <div className="text-lg font-bold text-cozy-text">{wordsCaught}</div>
            </div>
            <div>
              <span className="text-xs text-cozy-subtext font-semibold">Best Streak:</span>
              <div className="text-lg font-bold text-rose-600">{maxCombo}x</div>
            </div>
          </div>

          {arcadeWpm >= 50 && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-3 text-left">
              <span className="text-3xl">🦦</span>
              <div>
                <h5 className="font-extrabold text-emerald-900 text-sm">Ollie Otter Rescued!</h5>
                <p className="text-xs text-emerald-700">
                  You scored over 50 WPM and unlocked Ollie Otter in your sanctuary!
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setGameState('menu')}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-cozy-panel hover:bg-cozy-border text-cozy-text transition"
            >
              Mode Menu
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
