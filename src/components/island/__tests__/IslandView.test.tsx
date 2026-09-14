import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IslandView } from '../IslandView';
import { createNewProfile } from '../../../storage/defaultData';
import { UserProfile } from '../../../types/profile';

vi.mock('../../../audio/soundManager', () => ({
  soundManager: {
    playFeedAnimal: vi.fn(),
    playCoin: vi.fn(),
    playKeypress: vi.fn(),
  },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('IslandView feeding economy', () => {
  it('does not award coins when feeding an animal (prevents infinite money glitch)', () => {
    let currentProfile = createNewProfile('Test Hero');
    currentProfile.coins = 50;
    currentProfile.island.feedSnacksCount = 5;
    currentProfile.island.animals.bunny.happiness = 50;

    const handleUpdate = vi.fn((updated: UserProfile) => {
      currentProfile = updated;
    });

    render(
      <IslandView profile={currentProfile} onUpdateProfile={handleUpdate} />
    );

    const feedButton = screen.getByRole('button', { name: /Feed Snack/i });
    fireEvent.click(feedButton);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    // Snack count must decrease
    expect(currentProfile.island.feedSnacksCount).toBe(4);
    // Happiness must increase
    expect(currentProfile.island.animals.bunny.happiness).toBe(60);
    // Coins must NOT increase (no +5 infinite coin glitch)
    expect(currentProfile.coins).toBe(50);
  });

  it('disables or prevents feeding when animal happiness is already at 100%', () => {
    let currentProfile = createNewProfile('Test Hero');
    currentProfile.coins = 50;
    currentProfile.island.feedSnacksCount = 5;
    currentProfile.island.animals.bunny.happiness = 100;

    const handleUpdate = vi.fn((updated: UserProfile) => {
      currentProfile = updated;
    });

    render(
      <IslandView profile={currentProfile} onUpdateProfile={handleUpdate} />
    );

    const button = screen.getByRole('button', { name: /Full & Happy|Feed Snack/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(handleUpdate).not.toHaveBeenCalled();
  });
});
