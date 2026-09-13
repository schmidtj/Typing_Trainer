import React from 'react';
import { KEYBOARD_ROWS, getCharKeyInfo, FINGER_COLORS } from './keyboardLayout';

interface VirtualKeyboardProps {
  activeChar: string;
  hasError?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeChar,
  hasError = false,
}) => {
  const targetInfo = getCharKeyInfo(activeChar);

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 bg-cozy-panel/90 backdrop-blur-sm rounded-3xl border-2 border-cozy-border shadow-sm">
      {/* Target hint bubble */}
      <div className="flex items-center justify-between mb-3 px-2 text-xs sm:text-sm text-cozy-subtext">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cozy-text">Next Key:</span>
          {targetInfo ? (
            <span className="px-2 py-0.5 rounded-lg bg-cozy-surface font-mono font-bold text-cozy-text border border-cozy-border shadow-xs">
              {targetInfo.key.primary === 'Space' ? 'Spacebar ␣' : targetInfo.key.shifted && activeChar === targetInfo.key.shifted ? targetInfo.key.shifted : targetInfo.key.primary}
            </span>
          ) : (
            <span>-</span>
          )}
          {targetInfo?.needsShift && (
            <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200">
              Hold {targetInfo.shiftHand === 'right' ? 'Right' : 'Left'} Shift
            </span>
          )}
        </div>

        {targetInfo && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{
              backgroundColor: targetInfo.key.finger === 'left-pinky' ? '#f87171' :
                targetInfo.key.finger === 'left-ring' ? '#fb923c' :
                targetInfo.key.finger === 'left-middle' ? '#facc15' :
                targetInfo.key.finger === 'left-index' ? '#4ade80' :
                targetInfo.key.finger === 'right-index' ? '#2dd4bf' :
                targetInfo.key.finger === 'right-middle' ? '#60a5fa' :
                targetInfo.key.finger === 'right-ring' ? '#818cf8' :
                targetInfo.key.finger === 'right-pinky' ? '#f472b6' : '#94a3b8'
            }} />
            <span className="font-semibold text-cozy-text">{FINGER_COLORS[targetInfo.key.finger].label}</span>
          </div>
        )}
      </div>

      {/* Keyboard Matrix */}
      <div className="flex flex-col gap-1.5 sm:gap-2 items-center justify-center select-none font-mono">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 sm:gap-1.5 justify-center w-full">
            {row.map((key) => {
              const isTargetKey = targetInfo?.key.code === key.code;
              const isTargetShift =
                targetInfo?.needsShift &&
                ((targetInfo.shiftHand === 'left' && key.code === 'ShiftLeft') ||
                 (targetInfo.shiftHand === 'right' && key.code === 'ShiftRight'));

              let keyStyle = 'bg-cozy-surface text-cozy-text border-cozy-border hover:bg-cozy-panel';
              if (isTargetShift) {
                keyStyle = 'bg-purple-200 text-purple-900 border-purple-400 ring-2 ring-purple-300 animate-pulse';
              } else if (isTargetKey) {
                if (hasError) {
                  keyStyle = 'bg-red-200 text-red-900 border-red-400 ring-2 ring-red-300 animate-wiggle';
                } else {
                  keyStyle = 'bg-amber-100 text-amber-900 border-amber-400 ring-4 ring-amber-200 shadow-md transform -translate-y-0.5 scale-105';
                }
              }

              const widthClass = key.width ? key.width : 'w-7 sm:w-11 md:w-12';

              return (
                <div
                  key={key.code}
                  className={`
                    ${widthClass} h-9 sm:h-12 md:h-13
                    flex flex-col items-center justify-center
                    rounded-xl border-2 transition-all duration-150 relative text-xs sm:text-sm font-semibold
                    shadow-xs
                    ${keyStyle}
                  `}
                >
                  {/* Subtle finger color stripe at bottom */}
                  <div
                    className={`absolute bottom-0 inset-x-1 h-1 rounded-full opacity-60 ${
                      key.finger === 'left-pinky' ? 'bg-red-400' :
                      key.finger === 'left-ring' ? 'bg-orange-400' :
                      key.finger === 'left-middle' ? 'bg-yellow-400' :
                      key.finger === 'left-index' ? 'bg-emerald-400' :
                      key.finger === 'right-index' ? 'bg-teal-400' :
                      key.finger === 'right-middle' ? 'bg-blue-400' :
                      key.finger === 'right-ring' ? 'bg-indigo-400' :
                      key.finger === 'right-pinky' ? 'bg-pink-400' : 'bg-slate-300'
                    }`}
                  />

                  {/* Tactile bump on F and J */}
                  {key.isHomeRowBump && (
                    <div className="absolute bottom-2.5 w-2 h-0.5 bg-cozy-subtext/70 rounded-full" />
                  )}

                  {/* Character displays */}
                  {key.shifted ? (
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[10px] text-cozy-subtext opacity-75">{key.shifted}</span>
                      <span className="text-xs sm:text-sm font-bold">{key.primary}</span>
                    </div>
                  ) : (
                    <span className="font-bold">{key.primary}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
