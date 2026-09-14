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
    playLevelComplete: vi.fn(),
  },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

function renderIsland(profile: UserProfile) {
  let currentProfile = profile;
  const handleUpdate = vi.fn((updated: UserProfile) => {
    currentProfile = updated;
  });

  const view = render(
    <IslandView profile={currentProfile} onUpdateProfile={handleUpdate} />,
  );

  return {
    handleUpdate,
    getProfile: () => currentProfile,
    rerender: () => {
      view.rerender(
        <IslandView profile={currentProfile} onUpdateProfile={handleUpdate} />,
      );
    },
  };
}

describe('IslandView feeding economy', () => {
  it('does not award coins when feeding an animal (prevents infinite money glitch)', () => {
    const currentProfile = createNewProfile('Test Hero');
    currentProfile.coins = 50;
    currentProfile.island.feedSnacksCount = 5;
    currentProfile.island.animals.bunny.happiness = 50;

    const { handleUpdate, getProfile } = renderIsland(currentProfile);

    const feedButton = screen.getByRole('button', { name: /Feed Snack/i });
    fireEvent.click(feedButton);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    expect(getProfile().island.feedSnacksCount).toBe(4);
    expect(getProfile().island.animals.bunny.happiness).toBe(60);
    expect(getProfile().coins).toBe(50);
  });

  it('disables or prevents feeding when animal happiness is already at 100%', () => {
    const currentProfile = createNewProfile('Test Hero');
    currentProfile.coins = 50;
    currentProfile.island.feedSnacksCount = 5;
    currentProfile.island.animals.bunny.happiness = 100;

    const { handleUpdate } = renderIsland(currentProfile);

    const button = screen.getByRole('button', { name: /Full & Happy|Feed Snack/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(handleUpdate).not.toHaveBeenCalled();
  });
});

describe('IslandView habitat expansion', () => {
  it('selects a habitat when a habitat pill is clicked', () => {
    const profile = createNewProfile('Test Hero');
    const { handleUpdate, getProfile } = renderIsland(profile);

    fireEvent.click(screen.getByRole('button', { name: /Oak Treehouse/i }));

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    expect(getProfile().island.selectedHabitatId).toBe('forest_treehouse');
  });

  it('assigns an unlocked animal to the selected habitat', () => {
    const profile = createNewProfile('Test Hero');
    profile.island.animals.kitten.unlocked = true;

    const { handleUpdate, getProfile } = renderIsland(profile);

    fireEvent.click(screen.getByRole('button', { name: /Assign Animal/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mochi Kitten/i }));

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    expect(getProfile().island.animals.kitten.assignedHabitatId).toBe('meadow');
  });

  it('harvests ready crops for 3 snacks and 15 coins', () => {
    const profile = createNewProfile('Test Hero');
    profile.coins = 50;
    profile.island.feedSnacksCount = 5;
    profile.island.habitats.meadow.harvestReady = true;

    const { handleUpdate, getProfile } = renderIsland(profile);

    fireEvent.click(screen.getByRole('button', { name: /Harvest Clover Berries/i }));

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    expect(getProfile().island.feedSnacksCount).toBe(8);
    expect(getProfile().coins).toBe(65);
    expect(getProfile().island.habitats.meadow.harvestReady).toBe(false);
  });

  it('sets an assigned animal as the active companion and equips a hat', () => {
    const profile = createNewProfile('Test Hero');
    profile.island.animals.kitten.unlocked = true;
    profile.island.animals.kitten.assignedHabitatId = 'meadow';

    const { handleUpdate, getProfile, rerender } = renderIsland(profile);

    fireEvent.click(screen.getByRole('button', { name: /Mochi Kitten/i }));
    fireEvent.click(screen.getByRole('button', { name: /Set as Active Companion/i }));

    expect(getProfile().island.activeCompanionId).toBe('kitten');

    fireEvent.click(screen.getByRole('button', { name: /Boutique & Hats/i }));
    rerender();
    fireEvent.click(screen.getAllByRole('button', { name: /Wear Hat/i })[0]);

    expect(handleUpdate).toHaveBeenCalled();
    expect(getProfile().island.animals.bunny.hatId).toBe('straw_hat');
  });
});
