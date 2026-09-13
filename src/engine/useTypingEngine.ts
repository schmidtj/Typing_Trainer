import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../audio/soundManager';

export interface TypedChar {
  char: string;
  isCorrect: boolean;
  expectedChar: string;
}

export interface TypingEngineResult {
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  errorKeys: Record<string, number>;
  keyLatencies: Record<string, number[]>;
  durationSeconds: number;
  maxCombo: number;
}

export interface TypingEngineProps {
  targetText: string;
  strictBackspace?: boolean;
  onComplete?: (result: TypingEngineResult) => void;
}

export type EngineStatus = 'idle' | 'typing' | 'paused' | 'completed';

export function useTypingEngine({
  targetText,
  strictBackspace = true,
  onComplete,
}: TypingEngineProps) {
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedHistory, setTypedHistory] = useState<TypedChar[]>([]);
  const [hasCurrentError, setHasCurrentError] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const [rawWpm, setRawWpm] = useState(0);
  const [netWpm, setNetWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const startTimeRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number | null>(null);
  const errorKeysRef = useRef<Record<string, number>>({});
  const keyLatenciesRef = useRef<Record<string, number[]>>({});

  // Reset engine whenever target text changes
  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentIndex(0);
    setTypedHistory([]);
    setHasCurrentError(false);
    setComboStreak(0);
    setMaxCombo(0);
    setErrorCount(0);
    setRawWpm(0);
    setNetWpm(0);
    setAccuracy(100);
    startTimeRef.current = null;
    lastKeyTimeRef.current = null;
    errorKeysRef.current = {};
    keyLatenciesRef.current = {};
  }, []);

  useEffect(() => {
    reset();
  }, [targetText, reset]);

  // Live WPM calculation timer
  useEffect(() => {
    if (status !== 'typing') return;

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
      if (elapsedMinutes <= 0) return;

      const totalTyped = typedHistory.length;
      const computedRawWpm = Math.round((totalTyped / 5) / elapsedMinutes);
      const computedNetWpm = Math.max(0, Math.round(computedRawWpm - (errorCount / elapsedMinutes)));
      const computedAcc = totalTyped > 0
        ? Math.max(0, Math.min(100, Math.round(((totalTyped - errorCount) / totalTyped) * 100)))
        : 100;

      setRawWpm(computedRawWpm);
      setNetWpm(computedNetWpm);
      setAccuracy(computedAcc);
    }, 250);

    return () => clearInterval(interval);
  }, [status, typedHistory.length, errorCount]);

  const handleKeyDown = useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    if (status === 'completed' || status === 'paused') return;

    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    const now = Date.now();
    const expected = targetText[currentIndex];

    // Start timer on first keystroke
    if (status === 'idle') {
      setStatus('typing');
      startTimeRef.current = now;
      lastKeyTimeRef.current = now;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (hasCurrentError) {
        // Clear current error
        setHasCurrentError(false);
        soundManager.playKeypress(comboStreak);
        return;
      }
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setTypedHistory(prev => prev.slice(0, -1));
        setHasCurrentError(false);
      }
      return;
    }

    // If there is currently an uncorrected error in strict mode, require backspace first
    if (hasCurrentError && strictBackspace) {
      soundManager.playError();
      return;
    }

    // Only process single printable characters
    if (e.key.length !== 1) return;

    e.preventDefault();

    // Track latency
    if (lastKeyTimeRef.current) {
      const latency = now - lastKeyTimeRef.current;
      if (!keyLatenciesRef.current[expected]) {
        keyLatenciesRef.current[expected] = [];
      }
      keyLatenciesRef.current[expected].push(latency);
    }
    lastKeyTimeRef.current = now;

    const isMatch = e.key === expected;

    if (isMatch) {
      // Correct keystroke!
      if (expected === ' ') {
        soundManager.playSpace();
      } else {
        soundManager.playKeypress(comboStreak + 1);
      }

      const nextCombo = comboStreak + 1;
      setComboStreak(nextCombo);
      setMaxCombo(prev => Math.max(prev, nextCombo));

      // Milestone celebration sounds
      if (nextCombo === 10 || nextCombo === 25 || nextCombo === 50 || nextCombo === 100) {
        soundManager.playComboMilestone();
      }

      setTypedHistory(prev => [
        ...prev,
        { char: e.key, isCorrect: true, expectedChar: expected },
      ]);

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Check if finished
      if (nextIndex >= targetText.length) {
        setStatus('completed');
        soundManager.playLevelComplete();

        const durationSec = Math.max(1, Math.round((now - (startTimeRef.current || now)) / 1000));
        const durationMin = durationSec / 60;
        const totalChars = targetText.length;
        const finalRaw = Math.round((totalChars / 5) / durationMin);
        const finalNet = Math.max(0, Math.round(finalRaw - (errorCount / durationMin)));
        const finalAcc = Math.max(0, Math.min(100, Math.round(((totalChars - errorCount) / totalChars) * 100)));

        setRawWpm(finalRaw);
        setNetWpm(finalNet);
        setAccuracy(finalAcc);

        if (onComplete) {
          onComplete({
            rawWpm: finalRaw,
            netWpm: finalNet,
            accuracy: finalAcc,
            errorKeys: { ...errorKeysRef.current },
            keyLatencies: { ...keyLatenciesRef.current },
            durationSeconds: durationSec,
            maxCombo: Math.max(maxCombo, nextCombo),
          });
        }
      }
    } else {
      // Incorrect keystroke!
      soundManager.playError();
      setComboStreak(0);
      setErrorCount(prev => prev + 1);

      // Record error for this expected character
      errorKeysRef.current[expected] = (errorKeysRef.current[expected] || 0) + 1;

      if (strictBackspace) {
        setHasCurrentError(true);
      } else {
        // In relaxed mode, advance with error
        setTypedHistory(prev => [
          ...prev,
          { char: e.key, isCorrect: false, expectedChar: expected },
        ]);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex >= targetText.length) {
          setStatus('completed');
          soundManager.playLevelComplete();
        }
      }
    }
  }, [
    status,
    currentIndex,
    targetText,
    hasCurrentError,
    strictBackspace,
    comboStreak,
    maxCombo,
    errorCount,
    onComplete,
  ]);

  const pause = useCallback(() => {
    if (status === 'typing') setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status === 'paused') setStatus('typing');
  }, [status]);

  return {
    status,
    currentIndex,
    currentChar: targetText[currentIndex] || '',
    typedHistory,
    hasCurrentError,
    comboStreak,
    maxCombo,
    errorCount,
    rawWpm,
    netWpm,
    accuracy,
    handleKeyDown,
    reset,
    pause,
    resume,
  };
}
