import { KeyMetric } from '../types/metrics';

const WORD_BANK_BY_KEY: Record<string, string[]> = {
  a: ['apple', 'acorn', 'animal', 'always', 'around', 'awake', 'autumn'],
  b: ['bunny', 'basket', 'berry', 'butterfly', 'bright', 'bubble', 'breeze'],
  c: ['cat', 'clover', 'cozy', 'cupcake', 'calm', 'cloud', 'crystal'],
  d: ['daisy', 'dragon', 'dance', 'delight', 'dream', 'door', 'dewdrop'],
  e: ['emerald', 'early', 'earth', 'evergreen', 'enchanted', 'echo'],
  f: ['flower', 'forest', 'fairy', 'fox', 'feather', 'friendly', 'firefly'],
  g: ['garden', 'glow', 'green', 'gentle', 'gold', 'grasshopper', 'glade'],
  h: ['honey', 'heart', 'happy', 'haven', 'hollow', 'home', 'harmony'],
  i: ['island', 'ivy', 'ice', 'insect', 'imagine', 'indigo', 'illumine'],
  j: ['joy', 'jump', 'jolly', 'jasmine', 'journey', 'juniper', 'jewel'],
  k: ['kitten', 'kind', 'kite', 'koala', 'kingdom', 'keeper'],
  l: ['lily', 'leaf', 'little', 'lovely', 'lantern', 'lullaby', 'lavender'],
  m: ['meadow', 'moon', 'magic', 'morning', 'moss', 'melody', 'maple'],
  n: ['nest', 'nature', 'nectar', 'noble', 'night', 'newt', 'nutmeg'],
  o: ['owl', 'ocean', 'orchid', 'open', 'orange', 'otter'],
  p: ['panda', 'penguin', 'petal', 'puppy', 'peace', 'plum', 'pebble'],
  q: ['quiet', 'quilt', 'queen', 'quick', 'quaint'],
  r: ['rabbit', 'river', 'rainbow', 'rose', 'rustle', 'robin', 'ripple'],
  s: ['sunshine', 'star', 'sweet', 'spring', 'squirrel', 'song', 'sparkle'],
  t: ['tree', 'tulip', 'twilight', 'tea', 'treasure', 'turtle', 'tender'],
  u: ['umbrella', 'under', 'unfurl', 'unicorn', 'uplift'],
  v: ['violet', 'valley', 'velvet', 'vine', 'vibrant'],
  w: ['wildflower', 'whisper', 'water', 'willow', 'woodland', 'warm'],
  x: ['extra', 'relax', 'explore', 'fox', 'box', 'six'],
  y: ['yellow', 'yuzu', 'yarn', 'young', 'yesterday'],
  z: ['zen', 'zebra', 'zephyr', 'zigzag', 'breeze', 'cozy'],
};

export function identifyWeakKeys(keyStats: Record<string, KeyMetric>, limit: number = 3): string[] {
  const candidates: { char: string; errorRate: number }[] = [];

  for (const [char, stat] of Object.entries(keyStats)) {
    // Only analyze alphanumeric characters with at least 3 attempts
    if (char.length === 1 && char !== ' ' && stat.totalAttempts >= 3) {
      const errorRate = stat.errors / stat.totalAttempts;
      if (errorRate > 0.05) {
        candidates.push({ char, errorRate });
      }
    }
  }

  candidates.sort((a, b) => b.errorRate - a.errorRate);
  return candidates.slice(0, limit).map(c => c.char);
}

export function generateWeakKeyDrill(weakKeys: string[]): string {
  if (weakKeys.length === 0) {
    return 'The sunny island breeze rustles through the quiet green trees and cozy gardens.';
  }

  const selectedWords: string[] = [];

  weakKeys.forEach(k => {
    const lower = k.toLowerCase();
    const words = WORD_BANK_BY_KEY[lower];
    if (words) {
      selectedWords.push(...words.slice(0, 3));
    }
  });

  // Shuffle and build a friendly sentence
  const shuffled = [...selectedWords].sort(() => Math.random() - 0.5).slice(0, 8);
  if (shuffled.length < 4) {
    return 'Barnaby Bunny and Mochi Kitten love practicing gentle words in the sunshine.';
  }

  return shuffled.join(' ') + '.';
}
