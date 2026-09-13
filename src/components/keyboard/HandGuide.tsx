import React from 'react';
import { getCharKeyInfo, FINGER_COLORS } from './keyboardLayout';
import { FingerType } from '../../types/curriculum';

interface HandGuideProps {
  activeChar: string;
}

interface FingerSpec {
  id: FingerType;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  height: number;
  color: string;
}

const LEFT_FINGERS: FingerSpec[] = [
  { id: 'left-pinky', label: 'Left Pinky', shortLabel: 'Pinky', x: 22, y: 44, height: 46, color: '#f87171' },
  { id: 'left-ring', label: 'Left Ring', shortLabel: 'Ring', x: 42, y: 28, height: 62, color: '#fb923c' },
  { id: 'left-middle', label: 'Left Middle', shortLabel: 'Middle', x: 62, y: 18, height: 72, color: '#facc15' },
  { id: 'left-index', label: 'Left Pointer', shortLabel: 'Pointer', x: 82, y: 26, height: 64, color: '#4ade80' },
  { id: 'thumb', label: 'Left Thumb', shortLabel: 'Thumb', x: 104, y: 64, height: 38, color: '#94a3b8' },
];

const RIGHT_FINGERS: FingerSpec[] = [
  { id: 'thumb', label: 'Right Thumb', shortLabel: 'Thumb', x: 26, y: 64, height: 38, color: '#94a3b8' },
  { id: 'right-index', label: 'Right Pointer', shortLabel: 'Pointer', x: 48, y: 26, height: 64, color: '#2dd4bf' },
  { id: 'right-middle', label: 'Right Middle', shortLabel: 'Middle', x: 68, y: 18, height: 72, color: '#60a5fa' },
  { id: 'right-ring', label: 'Right Ring', shortLabel: 'Ring', x: 88, y: 28, height: 62, color: '#818cf8' },
  { id: 'right-pinky', label: 'Right Pinky', shortLabel: 'Pinky', x: 108, y: 44, height: 46, color: '#f472b6' },
];

export const HandGuide: React.FC<HandGuideProps> = ({ activeChar }) => {
  const targetInfo = getCharKeyInfo(activeChar);
  const activeFinger = targetInfo?.key.finger;
  const shiftHand = targetInfo?.shiftHand;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 py-2 px-4 bg-cozy-surface/60 rounded-2xl border border-cozy-border">
      {/* Left Hand */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-cozy-subtext uppercase tracking-wider mb-1">Left Hand</span>
        <svg viewBox="0 0 130 110" className="w-28 sm:w-36 h-24 sm:h-28 overflow-visible">
          {/* Palm base */}
          <path
            d="M 22 75 C 22 105, 105 105, 105 75 C 105 55, 22 55, 22 75 Z"
            fill="#f7f3ea"
            stroke="#e6decb"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Fingers */}
          {LEFT_FINGERS.map((finger) => {
            const isFingerActive = activeFinger === finger.id;
            const isShiftActive = shiftHand === 'left' && finger.id === 'left-pinky';
            const isLit = isFingerActive || isShiftActive;

            return (
              <g key={finger.id + finger.x} className="transition-all duration-200">
                {/* Finger Capsule */}
                <rect
                  x={finger.x - 7}
                  y={finger.y}
                  width="14"
                  height={finger.height}
                  rx="7"
                  fill={isLit ? finger.color : '#f0e9dc'}
                  stroke={isLit ? '#3c3836' : '#dcd4c3'}
                  strokeWidth={isLit ? '2.5' : '1.5'}
                  className={isLit ? 'animate-bounce-subtle filter drop-shadow-md' : ''}
                />
                {/* Finger tip marker */}
                <circle
                  cx={finger.x}
                  cy={finger.y + 7}
                  r={isLit ? '4' : '2'}
                  fill={isLit ? '#ffffff' : '#c9bfad'}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Center Guidance Prompt */}
      <div className="text-center px-2 py-1">
        {targetInfo ? (
          <div className="flex flex-col items-center">
            <span className="text-xs text-cozy-subtext font-semibold">Use Finger:</span>
            <span className="text-sm sm:text-base font-extrabold text-cozy-text mt-0.5">
              {FINGER_COLORS[targetInfo.key.finger].label}
            </span>
            {targetInfo.needsShift && (
              <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mt-1">
                + {shiftHand === 'right' ? 'Right' : 'Left'} Shift
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-cozy-subtext">Rest hands on Home Row (ASDF - JKL;)</span>
        )}
      </div>

      {/* Right Hand */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-cozy-subtext uppercase tracking-wider mb-1">Right Hand</span>
        <svg viewBox="0 0 130 110" className="w-28 sm:w-36 h-24 sm:h-28 overflow-visible">
          {/* Palm base */}
          <path
            d="M 25 75 C 25 105, 108 105, 108 75 C 108 55, 25 55, 25 75 Z"
            fill="#f7f3ea"
            stroke="#e6decb"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Fingers */}
          {RIGHT_FINGERS.map((finger) => {
            const isFingerActive = activeFinger === finger.id;
            const isShiftActive = shiftHand === 'right' && finger.id === 'right-pinky';
            const isLit = isFingerActive || isShiftActive;

            return (
              <g key={finger.id + finger.x} className="transition-all duration-200">
                {/* Finger Capsule */}
                <rect
                  x={finger.x - 7}
                  y={finger.y}
                  width="14"
                  height={finger.height}
                  rx="7"
                  fill={isLit ? finger.color : '#f0e9dc'}
                  stroke={isLit ? '#3c3836' : '#dcd4c3'}
                  strokeWidth={isLit ? '2.5' : '1.5'}
                  className={isLit ? 'animate-bounce-subtle filter drop-shadow-md' : ''}
                />
                {/* Finger tip marker */}
                <circle
                  cx={finger.x}
                  cy={finger.y + 7}
                  r={isLit ? '4' : '2'}
                  fill={isLit ? '#ffffff' : '#c9bfad'}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
