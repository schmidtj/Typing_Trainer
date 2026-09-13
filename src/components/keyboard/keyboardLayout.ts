import { FingerType } from '../../types/curriculum';

export interface KeyDefinition {
  primary: string;
  shifted?: string;
  code: string;
  finger: FingerType;
  width?: string;
  isHomeRowBump?: boolean;
}

export const FINGER_COLORS: Record<FingerType, { bg: string; text: string; border: string; label: string; hand: 'left' | 'right' | 'both' }> = {
  'left-pinky': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: 'Left Pinky', hand: 'left' },
  'left-ring': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', label: 'Left Ring', hand: 'left' },
  'left-middle': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: 'Left Middle', hand: 'left' },
  'left-index': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Left Pointer', hand: 'left' },
  'right-index': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', label: 'Right Pointer', hand: 'right' },
  'right-middle': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Right Middle', hand: 'right' },
  'right-ring': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', label: 'Right Ring', hand: 'right' },
  'right-pinky': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', label: 'Right Pinky', hand: 'right' },
  'thumb': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Thumbs', hand: 'both' },
};

export const KEYBOARD_ROWS: KeyDefinition[][] = [
  // Row 0 - Numbers & Symbols
  [
    { primary: '`', shifted: '~', code: 'Backquote', finger: 'left-pinky' },
    { primary: '1', shifted: '!', code: 'Digit1', finger: 'left-pinky' },
    { primary: '2', shifted: '@', code: 'Digit2', finger: 'left-ring' },
    { primary: '3', shifted: '#', code: 'Digit3', finger: 'left-middle' },
    { primary: '4', shifted: '$', code: 'Digit4', finger: 'left-index' },
    { primary: '5', shifted: '%', code: 'Digit5', finger: 'left-index' },
    { primary: '6', shifted: '^', code: 'Digit6', finger: 'right-index' },
    { primary: '7', shifted: '&', code: 'Digit7', finger: 'right-index' },
    { primary: '8', shifted: '*', code: 'Digit8', finger: 'right-middle' },
    { primary: '9', shifted: '(', code: 'Digit9', finger: 'right-ring' },
    { primary: '0', shifted: ')', code: 'Digit0', finger: 'right-pinky' },
    { primary: '-', shifted: '_', code: 'Minus', finger: 'right-pinky' },
    { primary: '=', shifted: '+', code: 'Equal', finger: 'right-pinky' },
    { primary: 'Backspace', code: 'Backspace', finger: 'right-pinky', width: 'w-16 sm:w-20' },
  ],
  // Row 1 - Top Row
  [
    { primary: 'Tab', code: 'Tab', finger: 'left-pinky', width: 'w-12 sm:w-16' },
    { primary: 'q', shifted: 'Q', code: 'KeyQ', finger: 'left-pinky' },
    { primary: 'w', shifted: 'W', code: 'KeyW', finger: 'left-ring' },
    { primary: 'e', shifted: 'E', code: 'KeyE', finger: 'left-middle' },
    { primary: 'r', shifted: 'R', code: 'KeyR', finger: 'left-index' },
    { primary: 't', shifted: 'T', code: 'KeyT', finger: 'left-index' },
    { primary: 'y', shifted: 'Y', code: 'KeyY', finger: 'right-index' },
    { primary: 'u', shifted: 'U', code: 'KeyU', finger: 'right-index' },
    { primary: 'i', shifted: 'I', code: 'KeyI', finger: 'right-middle' },
    { primary: 'o', shifted: 'O', code: 'KeyO', finger: 'right-ring' },
    { primary: 'p', shifted: 'P', code: 'KeyP', finger: 'right-pinky' },
    { primary: '[', shifted: '{', code: 'BracketLeft', finger: 'right-pinky' },
    { primary: ']', shifted: '}', code: 'BracketRight', finger: 'right-pinky' },
    { primary: '\\', shifted: '|', code: 'Backslash', finger: 'right-pinky', width: 'w-10 sm:w-12' },
  ],
  // Row 2 - Home Row
  [
    { primary: 'Caps', code: 'CapsLock', finger: 'left-pinky', width: 'w-14 sm:w-18' },
    { primary: 'a', shifted: 'A', code: 'KeyA', finger: 'left-pinky' },
    { primary: 's', shifted: 'S', code: 'KeyS', finger: 'left-ring' },
    { primary: 'd', shifted: 'D', code: 'KeyD', finger: 'left-middle' },
    { primary: 'f', shifted: 'F', code: 'KeyF', finger: 'left-index', isHomeRowBump: true },
    { primary: 'g', shifted: 'G', code: 'KeyG', finger: 'left-index' },
    { primary: 'h', shifted: 'H', code: 'KeyH', finger: 'right-index' },
    { primary: 'j', shifted: 'J', code: 'KeyJ', finger: 'right-index', isHomeRowBump: true },
    { primary: 'k', shifted: 'K', code: 'KeyK', finger: 'right-middle' },
    { primary: 'l', shifted: 'L', code: 'KeyL', finger: 'right-ring' },
    { primary: ';', shifted: ':', code: 'Semicolon', finger: 'right-pinky' },
    { primary: "'", shifted: '"', code: 'Quote', finger: 'right-pinky' },
    { primary: 'Enter', code: 'Enter', finger: 'right-pinky', width: 'w-16 sm:w-20' },
  ],
  // Row 3 - Bottom Row
  [
    { primary: 'Shift', code: 'ShiftLeft', finger: 'left-pinky', width: 'w-16 sm:w-24' },
    { primary: 'z', shifted: 'Z', code: 'KeyZ', finger: 'left-pinky' },
    { primary: 'x', shifted: 'X', code: 'KeyX', finger: 'left-ring' },
    { primary: 'c', shifted: 'C', code: 'KeyC', finger: 'left-middle' },
    { primary: 'v', shifted: 'V', code: 'KeyV', finger: 'left-index' },
    { primary: 'b', shifted: 'B', code: 'KeyB', finger: 'left-index' },
    { primary: 'n', shifted: 'N', code: 'KeyN', finger: 'right-index' },
    { primary: 'm', shifted: 'M', code: 'KeyM', finger: 'right-index' },
    { primary: ',', shifted: '<', code: 'Comma', finger: 'right-middle' },
    { primary: '.', shifted: '>', code: 'Period', finger: 'right-ring' },
    { primary: '/', shifted: '?', code: 'Slash', finger: 'right-pinky' },
    { primary: 'Shift', code: 'ShiftRight', finger: 'right-pinky', width: 'w-16 sm:w-24' },
  ],
  // Row 4 - Spacebar
  [
    { primary: 'Space', code: 'Space', finger: 'thumb', width: 'w-64 sm:w-96' },
  ],
];

// Helper to look up which key definition matches a character
export function getCharKeyInfo(char: string): { key: KeyDefinition; needsShift: boolean; shiftHand?: 'left' | 'right' } | null {
  if (char === ' ') {
    return {
      key: { primary: 'Space', code: 'Space', finger: 'thumb' },
      needsShift: false,
    };
  }

  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.primary === char) {
        return { key, needsShift: false };
      }
      if (key.shifted && key.shifted === char) {
        // For shifted keys, if key is typed with right hand, use left shift; if typed with left hand, use right shift!
        const shiftHand = key.finger.startsWith('left') ? 'right' : 'left';
        return { key, needsShift: true, shiftHand };
      }
    }
  }

  // Fallback case-insensitive search
  const lower = char.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.primary === lower) {
        const isUpper = char !== lower;
        const shiftHand = key.finger.startsWith('left') ? 'right' : 'left';
        return { key, needsShift: isUpper, shiftHand: isUpper ? shiftHand : undefined };
      }
    }
  }

  return null;
}
