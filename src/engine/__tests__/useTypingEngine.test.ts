import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypingEngine } from '../useTypingEngine';

// Mock Web Audio soundManager
vi.mock('../../audio/soundManager', () => ({
  soundManager: {
    playKeypress: vi.fn(),
    playSpace: vi.fn(),
    playError: vi.fn(),
    playComboMilestone: vi.fn(),
    playLevelComplete: vi.fn(),
  },
}));

describe('useTypingEngine', () => {
  it('initializes in idle state at index 0', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ targetText: 'cat' })
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentChar).toBe('c');
    expect(result.current.accuracy).toBe(100);
  });

  it('progresses index and combo on correct keystrokes', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTypingEngine({ targetText: 'hi', onComplete })
    );

    // Type 'h'
    act(() => {
      result.current.handleKeyDown({ key: 'h', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    });

    expect(result.current.status).toBe('typing');
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentChar).toBe('i');
    expect(result.current.comboStreak).toBe(1);

    // Type 'i'
    act(() => {
      result.current.handleKeyDown({ key: 'i', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.comboStreak).toBe(2);
    expect(onComplete).toHaveBeenCalled();
  });

  it('handles error in strict backspace mode by blocking until backspace', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ targetText: 'cat', strictBackspace: true })
    );

    // Type wrong key 'x' instead of 'c'
    act(() => {
      result.current.handleKeyDown({ key: 'x', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    });

    expect(result.current.hasCurrentError).toBe(true);
    expect(result.current.currentIndex).toBe(0); // Did not advance
    expect(result.current.comboStreak).toBe(0);

    // Try typing another key while error is present
    act(() => {
      result.current.handleKeyDown({ key: 'c', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    });
    expect(result.current.currentIndex).toBe(0); // Still blocked

    // Backspace clears the error
    act(() => {
      result.current.handleKeyDown({ key: 'Backspace', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    });
    expect(result.current.hasCurrentError).toBe(false);

    // Now typing 'c' succeeds
    act(() => {
      result.current.handleKeyDown({ key: 'c', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    });
    expect(result.current.currentIndex).toBe(1);
  });
});
