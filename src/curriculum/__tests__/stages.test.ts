import { describe, it, expect } from 'vitest';
import { CURRICULUM_STAGES, findLessonById, getNextLessonId } from '../stages';
import { identifyWeakKeys, generateWeakKeyDrill } from '../textGenerator';

describe('curriculum and stages', () => {
  it('defines all 8 progressive stages', () => {
    expect(CURRICULUM_STAGES.length).toBe(8);
    expect(CURRICULUM_STAGES[0].title).toContain('Home Row');
    expect(CURRICULUM_STAGES[7].title).toContain('100+ WPM');
  });

  it('can look up a lesson and resolve the next lesson in sequence', () => {
    const found = findLessonById('stage-1-lesson-1');
    expect(found).not.toBeNull();
    expect(found?.lesson.title).toBe('The Pointer Bumps');

    const nextId = getNextLessonId('stage-1-lesson-1');
    expect(nextId).toBe('stage-1-lesson-2');

    // Transitions across stages
    const lastLessonOfStage1 = CURRICULUM_STAGES[0].lessons[CURRICULUM_STAGES[0].lessons.length - 1];
    const nextAfterStage1 = getNextLessonId(lastLessonOfStage1.id);
    expect(nextAfterStage1).toBe('stage-2-lesson-1');
  });

  it('identifies weak keys accurately from error rates', () => {
    const mockKeyStats = {
      a: { char: 'a', totalAttempts: 20, errors: 0, totalLatencyMs: 4000 },
      b: { char: 'b', totalAttempts: 10, errors: 4, totalLatencyMs: 3500 }, // 40% error rate
      p: { char: 'p', totalAttempts: 10, errors: 2, totalLatencyMs: 2500 }, // 20% error rate
      z: { char: 'z', totalAttempts: 1, errors: 1, totalLatencyMs: 500 },   // under min attempts (1 < 3)
    };

    const weak = identifyWeakKeys(mockKeyStats, 2);
    expect(weak).toEqual(['b', 'p']);
  });

  it('generates a practice drill targeting weak keys', () => {
    const drill = generateWeakKeyDrill(['b', 'p']);
    expect(drill.length).toBeGreaterThan(10);
    expect(drill.endsWith('.')).toBe(true);
  });
});
