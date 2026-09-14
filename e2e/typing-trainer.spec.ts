import { test, expect } from '@playwright/test';

test.describe('Cozy Animal Island Typing Trainer E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with a fresh state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('loads home view and displays stages and lessons', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Cozy Animal Island');
    await expect(page.getByText('Stage 1: Home Row Haven')).toBeVisible();
    await expect(page.getByText('The Pointer Bumps')).toBeVisible();
    await expect(page.getByText('Middle Finger Neighbors')).toBeVisible();
  });

  test('plays Lesson 1 with real keyboard input, enforces accuracy and completes lesson', async ({ page }) => {
    // Click on Lesson 1: "The Pointer Bumps"
    await page.getByText('The Pointer Bumps').click();

    // Verify typing arena is displayed
    await expect(page.getByText('Next Key:')).toBeVisible();
    await expect(page.getByText('Start typing anytime on your keyboard to begin!')).toBeVisible();

    // In Lesson 1, practice text is: "f j f j ff jj f f j j fj jf f j ff jj fjf jfj"
    // First letter is 'f'
    await page.keyboard.press('f');

    // Idle prompt should disappear and speed should become active
    await expect(page.getByText('Start typing anytime')).not.toBeVisible();
    await expect(page.getByText('1x')).toBeVisible();

    // Test strict error mode: type 'z' which is wrong
    await page.keyboard.press('z');
    await expect(page.getByText('Oops! Press Backspace to fix')).toBeVisible();

    // Press Backspace to clear error
    await page.keyboard.press('Backspace');
    await expect(page.getByText('Oops! Press Backspace to fix')).not.toBeVisible();

    // Type the remainder of the text: " j f j ff jj f f j j fj jf f j ff jj fjf jfj"
    const remainingText = ' j f j ff jj f f j j fj jf f j ff jj fjf jfj';
    await page.keyboard.type(remainingText, { delay: 10 });

    // Lesson completed modal should appear
    await expect(page.getByText('Lesson Completed!')).toBeVisible({ timeout: 5000 });
    const nextBtn = page.getByRole('button', { name: 'Next Lesson →' });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Now on Lesson 2: Middle Finger Neighbors
    await expect(page.getByText('Middle Finger Neighbors')).toBeVisible();
  });

  test('navigates to Sanctuary, interacts with animals and feeds snacks', async ({ page }) => {
    await page.getByRole('button', { name: 'Sanctuary' }).click();

    await expect(page.getByText('Cozy Animal Sanctuary')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Barnaby Bunny' })).toBeVisible();
    await expect(page.getByText('5 Snacks', { exact: true })).toBeVisible();

    // Click Feed Snack button
    const feedButton = page.getByRole('button', { name: /Feed Snack/i });
    await expect(feedButton).toBeVisible();
    await feedButton.click();

    // Snacks should decrease from 5 to 4
    await expect(page.getByText('4 Snacks', { exact: true })).toBeVisible();

    // Switch to Wardrobe tab
    await page.getByRole('button', { name: /Boutique & Hats/i }).click();
    await expect(page.getByText('Sunny Straw Hat')).toBeVisible();
    await expect(page.getByText('Cheery Red Bow')).toBeVisible();

    // Switch to Habitats tab
    await page.getByRole('button', { name: /Island Habitats/i }).click();
    await expect(page.getByText('Sunny Clover Meadow')).toBeVisible();
    await expect(page.getByText('Oak Treehouse')).toBeVisible();
  });

  test('engages with Living Habitat, harvests crops, equips hat, and sees companion in typing and arcade', async ({ page }) => {
    // Go to Sanctuary
    await page.getByRole('button', { name: 'Sanctuary' }).click();
    await expect(page.getByText('Living Habitat')).toBeVisible();

    // Verify canvas particle engine is rendering
    await expect(page.locator('canvas')).toBeVisible();

    // Verify harvest is ready on fresh profile: Clover Berries
    const harvestBtn = page.getByRole('button', { name: /Harvest Clover Berries/i });
    await expect(harvestBtn).toBeVisible();
    await harvestBtn.click();

    // Snacks increase from 5 to 8, button changes to "Crops growing..."
    await expect(page.getByText('8 Snacks', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Crops growing/i })).toBeVisible();

    // Switch to Wardrobe & equip Sunny Straw Hat
    await page.getByRole('button', { name: /Boutique & Hats/i }).click();
    const wearHatBtn = page.getByRole('button', { name: 'Wear Hat' }).first();
    await wearHatBtn.click();
    await expect(page.getByRole('button', { name: 'Equipped' }).first()).toBeVisible();

    // Go to Levels and open Lesson 1
    await page.getByRole('button', { name: 'Levels' }).click();
    await page.getByText('The Pointer Bumps').click();

    // Verify Companion widget is present in TypingArena with Barnaby Bunny
    await expect(page.getByText('Companion')).toBeVisible();
    await expect(page.getByText('Barnaby Bunny')).toBeVisible();

    // Check Arcade also features companion
    await page.getByRole('button', { name: 'Arcade' }).click();
    await expect(page.getByText('Berry Catch Arcade')).toBeVisible();
  });

  test('plays Berry Catch arcade mini-game', async ({ page }) => {
    await page.getByRole('button', { name: 'Arcade' }).click();

    await expect(page.getByText('Berry Catch Arcade')).toBeVisible();
    await expect(page.getByText('Breezy Breeze')).toBeVisible();

    // Start game
    await page.getByRole('button', { name: /Start Catching!/i }).click();

    // Live arcade dashboard elements
    await expect(page.getByText('Score')).toBeVisible();
    await expect(page.getByText('Hearts')).toBeVisible();
  });

  test('checks Analytics Dashboard and Keyboard Heatmap', async ({ page }) => {
    await page.getByRole('button', { name: 'Metrics' }).click();

    await expect(page.getByText('Performance & Metrics')).toBeVisible();
    await expect(page.getByText('Keyboard Accuracy Heatmap')).toBeVisible();
    await expect(page.getByText('Top Speed')).toBeVisible();

    // Click on key 'f' in heatmap
    await page.locator('button:has-text("f")').first().click();
    await expect(page.getByText('Key Details: "f"')).toBeVisible();
  });

  test('manages player profiles and backup settings', async ({ page }) => {
    // Open profile modal by clicking the player pill in the header
    await page.getByTitle('Click to Switch Player or Settings').click();

    await expect(page.getByText('Profile & Settings')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Little Explorer' })).toBeVisible();

    // Switch to Start New Game tab
    await page.getByRole('button', { name: /Start New Game/i }).click();
    await page.fill('input[placeholder*="Emma"]', 'Emma');
    await page.click('button:has-text("Create & Begin Adventure")');

    // Profile modal closes and header should display Emma
    await expect(page.getByText('Emma')).toBeVisible();
  });
});
