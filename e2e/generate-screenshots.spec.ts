import { test } from '@playwright/test';

test.describe('Generate README Screenshots', () => {
  test.use({
    viewport: { width: 1280, height: 820 },
    deviceScaleFactor: 2,
  });

  const seedProfile = {
    id: 'profile_maya',
    name: 'Maya',
    avatar: '🐰',
    createdAt: Date.now() - 86400000 * 7,
    lastPlayed: Date.now(),
    level: 5,
    xp: 1350,
    coins: 420,
    gems: 15,
    currentStageId: 1,
    currentLessonId: 'stage-1-lesson-1',
    completedLevels: {
      'stage-1-lesson-1': { stars: 3, highWpm: 24, bestAccuracy: 98, timesPlayed: 4, lastPlayed: Date.now() },
      'stage-1-lesson-2': { stars: 3, highWpm: 22, bestAccuracy: 96, timesPlayed: 3, lastPlayed: Date.now() },
      'stage-1-lesson-3': { stars: 3, highWpm: 20, bestAccuracy: 95, timesPlayed: 3, lastPlayed: Date.now() },
      'stage-1-lesson-4': { stars: 3, highWpm: 19, bestAccuracy: 92, timesPlayed: 2, lastPlayed: Date.now() },
      'stage-1-lesson-5': { stars: 3, highWpm: 21, bestAccuracy: 96, timesPlayed: 2, lastPlayed: Date.now() },
      'stage-1-lesson-6': { stars: 3, highWpm: 23, bestAccuracy: 97, timesPlayed: 3, lastPlayed: Date.now() },
      'stage-2-lesson-1': { stars: 3, highWpm: 22, bestAccuracy: 94, timesPlayed: 2, lastPlayed: Date.now() },
      'stage-2-lesson-2': { stars: 2, highWpm: 18, bestAccuracy: 90, timesPlayed: 1, lastPlayed: Date.now() },
    },
    island: {
      animals: {
        bunny: {
          id: 'bunny',
          name: 'Barnaby Bunny',
          species: 'Bunny',
          icon: '🐰',
          description: 'Bounces with joy whenever you land on the home row keys!',
          unlockRequirement: 'Available from the start to guide your first steps.',
          unlocked: true,
          assignedHabitatId: 'meadow',
          nativeHabitatId: 'meadow',
          happiness: 100,
          favoriteFood: 'Crisp Carrot',
          hatId: 'straw_hat',
        },
        kitten: {
          id: 'kitten',
          name: 'Mochi Kitten',
          species: 'Kitten',
          icon: '🐱',
          description: 'Loves batting at top-row keys and purring to rhythmic typing.',
          unlockRequirement: 'Complete Stage 1: Home Row Haven.',
          unlocked: true,
          assignedHabitatId: 'meadow',
          nativeHabitatId: 'meadow',
          happiness: 95,
          favoriteFood: 'Tuna Treats',
          hatId: 'red_bow',
        },
        fox: {
          id: 'fox',
          name: 'Rusty Fox',
          species: 'Fox',
          icon: '🦊',
          description: 'Quick and clever scout who loves diving down to the bottom row.',
          unlockRequirement: 'Complete Stage 2: Top Row Treks.',
          unlocked: true,
          assignedHabitatId: 'forest_treehouse',
          nativeHabitatId: 'forest_treehouse',
          happiness: 85,
          favoriteFood: 'Sweet Wildberries',
          hatId: 'party_hat',
        },
        panda: {
          id: 'panda',
          name: 'Bao Bao Panda',
          species: 'Panda',
          icon: '🐼',
          description: 'Zen gentle giant who loves reaching high for Capital Shift keys.',
          unlockRequirement: 'Complete Stage 3: Bottom Row Beach.',
          unlocked: false,
          nativeHabitatId: 'bamboo_grove',
          happiness: 85,
          favoriteFood: 'Bamboo Shoots',
        },
        penguin: {
          id: 'penguin',
          name: 'Pip Penguin',
          species: 'Penguin',
          icon: '🐧',
          description: 'Slides smoothly across number rows and symbols.',
          unlockRequirement: 'Complete Stage 4: Capital Cliffs.',
          unlocked: false,
          nativeHabitatId: 'snowy_peak',
          happiness: 80,
          favoriteFood: 'Glacier Pops',
        },
        owl: {
          id: 'owl',
          name: 'Professor Hoot',
          species: 'Owl',
          icon: '🦉',
          description: 'Wise scholar who loves common sight words and reading stories.',
          unlockRequirement: 'Complete Stage 5: Number & Symbol Safari.',
          unlocked: false,
          nativeHabitatId: 'forest_treehouse',
          happiness: 90,
          favoriteFood: 'Acorn Crunch',
        },
        capybara: {
          id: 'capybara',
          name: 'Cappy Capybara',
          species: 'Capybara',
          icon: '🦫',
          description: 'The most relaxed animal on the island. Never stressed by typos.',
          unlockRequirement: 'Complete Stage 6: Sight Word Woods.',
          unlocked: false,
          nativeHabitatId: 'crystal_pond',
          happiness: 95,
          favoriteFood: 'Yuzu Melon',
        },
        otter: {
          id: 'otter',
          name: 'Ollie Otter',
          species: 'Otter',
          icon: '🦦',
          description: 'Fast swimmer who loves floating downstream in speed sprints.',
          unlockRequirement: 'Score 50+ WPM in Berry Catch Arcade.',
          unlocked: false,
          nativeHabitatId: 'crystal_pond',
          happiness: 85,
          favoriteFood: 'River Clams',
        },
        dragon: {
          id: 'dragon',
          name: 'Sparky Baby Dragon',
          species: 'Dragon',
          icon: '🐲',
          description: 'Legendary cozy dragon. Breathes sparkling rainbow flames at 80+ WPM!',
          unlockRequirement: 'Master Stage 8 or reach 80+ WPM.',
          unlocked: false,
          nativeHabitatId: 'fairy_hollow',
          happiness: 100,
          favoriteFood: 'Fire Blossom Honey',
        },
      },
      habitats: {
        meadow: {
          id: 'meadow',
          name: 'Sunny Clover Meadow',
          icon: '🌸',
          unlocked: true,
          cost: 0,
          level: 2,
          capacity: 4,
          biomeTheme: 'meadow',
          harvestCropName: 'Clover Berries',
          harvestCropIcon: '🍓',
          harvestReady: true,
          lastHarvestTime: 0,
          decorations: ['daisy_flower'],
        },
        forest_treehouse: {
          id: 'forest_treehouse',
          name: 'Oak Treehouse',
          icon: '🏡',
          unlocked: true,
          cost: 100,
          level: 1,
          capacity: 2,
          biomeTheme: 'forest_treehouse',
          harvestCropName: 'Acorn Clusters',
          harvestCropIcon: '🌰',
          harvestReady: false,
          lastHarvestTime: Date.now() - 30000,
          decorations: [],
        },
        crystal_pond: {
          id: 'crystal_pond',
          name: 'Sparkle Lily Pond',
          icon: '🪷',
          unlocked: false,
          cost: 250,
          level: 1,
          capacity: 2,
          biomeTheme: 'crystal_pond',
          harvestCropName: 'Lily Nectar',
          harvestCropIcon: '🪷',
          harvestReady: true,
          lastHarvestTime: 0,
          decorations: [],
        },
        bamboo_grove: {
          id: 'bamboo_grove',
          name: 'Zen Bamboo Grove',
          icon: '🎋',
          unlocked: false,
          cost: 400,
          level: 1,
          capacity: 2,
          biomeTheme: 'bamboo_grove',
          harvestCropName: 'Bamboo Shoots',
          harvestCropIcon: '🎋',
          harvestReady: true,
          lastHarvestTime: 0,
          decorations: [],
        },
        snowy_peak: {
          id: 'snowy_peak',
          name: 'Frosty Peak Igloo',
          icon: '❄️',
          unlocked: false,
          cost: 600,
          level: 1,
          capacity: 2,
          biomeTheme: 'snowy_peak',
          harvestCropName: 'Frost Berries',
          harvestCropIcon: '🫐',
          harvestReady: true,
          lastHarvestTime: 0,
          decorations: [],
        },
        fairy_hollow: {
          id: 'fairy_hollow',
          name: 'Starlight Fairy Hollow',
          icon: '✨',
          unlocked: false,
          cost: 1000,
          level: 1,
          capacity: 2,
          biomeTheme: 'fairy_hollow',
          harvestCropName: 'Starlight Dew',
          harvestCropIcon: '✨',
          harvestReady: true,
          lastHarvestTime: 0,
          decorations: [],
        },
      },
      cosmetics: {
        straw_hat: { id: 'straw_hat', name: 'Sunny Straw Hat', type: 'hat', icon: '👒', cost: 50, unlocked: true },
        party_hat: { id: 'party_hat', name: 'Party Cone Hat', type: 'hat', icon: '🎉', cost: 75, unlocked: true },
        wizard_hat: { id: 'wizard_hat', name: 'Starry Wizard Hat', type: 'hat', icon: '🧙', cost: 150, unlocked: false },
        crown: { id: 'crown', name: 'Golden Typing Crown', type: 'hat', icon: '👑', cost: 300, unlocked: false },
        red_bow: { id: 'red_bow', name: 'Cheery Red Bow', type: 'bow', icon: '🎀', cost: 60, unlocked: true },
        bell_collar: { id: 'bell_collar', name: 'Chime Bell Collar', type: 'bow', icon: '🔔', cost: 120, unlocked: false },
        star_glasses: { id: 'star_glasses', name: 'Star Sunglasses', type: 'glasses', icon: '⭐', cost: 90, unlocked: false },
        daisy_flower: { id: 'daisy_flower', name: 'Meadow Daisy', type: 'flower', icon: '🌼', cost: 40, unlocked: true },
      },
      feedSnacksCount: 8,
      selectedHabitatId: 'meadow',
      activeCompanionId: 'bunny',
    },
    metrics: {
      totalWordsTyped: 1240,
      totalTimeSeconds: 4200,
      highestWpm: 26,
      averageWpm: 21,
      averageAccuracy: 95,
      keyStats: {
        f: { char: 'f', totalAttempts: 120, errors: 2, totalLatencyMs: 34000 },
        j: { char: 'j', totalAttempts: 115, errors: 1, totalLatencyMs: 33000 },
        d: { char: 'd', totalAttempts: 98, errors: 3, totalLatencyMs: 29000 },
        k: { char: 'k', totalAttempts: 95, errors: 2, totalLatencyMs: 28000 },
        s: { char: 's', totalAttempts: 84, errors: 4, totalLatencyMs: 27000 },
        l: { char: 'l', totalAttempts: 80, errors: 3, totalLatencyMs: 26000 },
        a: { char: 'a', totalAttempts: 90, errors: 5, totalLatencyMs: 31000 },
        ';': { char: ';', totalAttempts: 45, errors: 6, totalLatencyMs: 19000 },
        h: { char: 'h', totalAttempts: 70, errors: 4, totalLatencyMs: 23000 },
        g: { char: 'g', totalAttempts: 65, errors: 5, totalLatencyMs: 22000 },
        r: { char: 'r', totalAttempts: 60, errors: 5, totalLatencyMs: 21000 },
        u: { char: 'u', totalAttempts: 58, errors: 4, totalLatencyMs: 20000 },
        e: { char: 'e', totalAttempts: 85, errors: 6, totalLatencyMs: 28000 },
        i: { char: 'i', totalAttempts: 75, errors: 5, totalLatencyMs: 25000 },
        b: { char: 'b', totalAttempts: 30, errors: 8, totalLatencyMs: 15000 },
        q: { char: 'q', totalAttempts: 20, errors: 7, totalLatencyMs: 11000 },
      },
      sessionHistory: [
        { date: '2026-09-08', wpm: 16, accuracy: 92, lessonId: 'stage-1-lesson-1' },
        { date: '2026-09-09', wpm: 18, accuracy: 94, lessonId: 'stage-1-lesson-3' },
        { date: '2026-09-11', wpm: 21, accuracy: 96, lessonId: 'stage-1-lesson-6' },
        { date: '2026-09-13', wpm: 23, accuracy: 95, lessonId: 'stage-2-lesson-1' },
        { date: '2026-09-14', wpm: 25, accuracy: 97, lessonId: 'stage-2-lesson-2' },
      ],
    },
    settings: {
      soundVolume: 0.7,
      soundMuted: false,
      showKeyboard: true,
      showHandGuide: true,
      fontSize: 'normal',
      strictBackspace: true,
    },
    arcadeHighScore: 840,
    achievements: ['first_steps', 'speedy_paws', 'three_stars'],
  };

  const seedProfile2 = {
    ...seedProfile,
    id: 'profile_leo',
    name: 'Leo',
    avatar: '🦊',
    level: 3,
    xp: 620,
    coins: 180,
  };

  const registry = {
    version: 1,
    activeProfileId: 'profile_maya',
    profiles: {
      profile_maya: seedProfile,
      profile_leo: seedProfile2,
    },
  };

  test('capture all showcase screenshots', async ({ page }) => {
    // 1. Setup local storage
    await page.goto('/');
    await page.evaluate((data) => {
      localStorage.setItem('cozy_animal_typing_trainer_data_v1', JSON.stringify(data));
    }, registry);
    await page.reload();
    await page.waitForTimeout(600);

    // Screenshot 1: Levels / Curriculum Map
    await page.screenshot({ path: 'docs/screenshots/01-level-select-map.png' });

    // Screenshot 2: Typing Arena
    await page.getByText('The Pointer Bumps').click();
    await page.waitForTimeout(500);

    // Type a few letters so the streak and visual feedback are live
    await page.keyboard.type('f j f ', { delay: 100 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'docs/screenshots/02-typing-arena-active.png' });

    // Go to Sanctuary via top navbar
    await page.getByRole('button', { name: /Sanctuary/i }).click();
    await page.waitForTimeout(600);
    // Screenshot 3: Island Sanctuary Living Diorama
    await page.screenshot({ path: 'docs/screenshots/03-sanctuary-diorama.png' });

    // Switch to Boutique tab in Sanctuary
    await page.getByRole('button', { name: /Boutique & Hats/i }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'docs/screenshots/04-sanctuary-boutique.png' });

    // Screenshot 5: Berry Catch Arcade
    await page.getByRole('button', { name: /Arcade/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Start Catching!/i }).click();
    // Wait for fruit to drop
    await page.waitForTimeout(1400);
    await page.screenshot({ path: 'docs/screenshots/05-berry-catch-arcade.png' });

    // Screenshot 6: Metrics & Analytics
    await page.getByRole('button', { name: /Metrics/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/screenshots/06-analytics-heatmap.png' });

    // Screenshot 7: Multi-Player Profile Manager Modal
    await page.locator('header').getByRole('button', { name: /Maya/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/screenshots/07-profile-manager.png' });
  });
});
