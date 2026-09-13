import React, { useState } from 'react';
import { UserProfile } from '../../types/profile';
import { KEYBOARD_ROWS } from '../keyboard/keyboardLayout';
import { identifyWeakKeys } from '../../curriculum/textGenerator';
import { Zap, Award, Clock, FileText, Star, Target, Sparkles, TrendingUp } from 'lucide-react';

interface AnalyticsDashboardProps {
  profile: UserProfile;
  onPracticeWeakKeys: (weakKeys: string[]) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  profile,
  onPracticeWeakKeys,
}) => {
  const [selectedKeyChar, setSelectedKeyChar] = useState<string | null>(null);

  const keyStats = profile.metrics.keyStats || {};
  const sessions = profile.metrics.sessionHistory || [];
  const weakKeys = identifyWeakKeys(keyStats, 4);

  // Compute total 3-star counts
  const totalThreeStars = Object.values(profile.completedLevels).filter(l => l.stars === 3).length;

  // Format practicing time
  const totalMins = Math.floor(profile.metrics.totalTimeSeconds / 60);
  const totalHours = (totalMins / 60).toFixed(1);

  // Helper to get key heat styling
  const getKeyHeatStyle = (char: string) => {
    const stat = keyStats[char.toLowerCase()];
    if (!stat || stat.totalAttempts === 0) {
      return {
        bg: 'bg-cozy-surface text-cozy-subtext/60 border-cozy-border',
        label: 'Not Practiced',
        accuracy: null,
      };
    }

    const acc = Math.round(((stat.totalAttempts - stat.errors) / stat.totalAttempts) * 100);

    if (acc >= 95) {
      return {
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
        label: 'Mastered',
        accuracy: acc,
      };
    } else if (acc >= 85) {
      return {
        bg: 'bg-teal-100 text-teal-900 border-teal-300 font-bold',
        label: 'Great',
        accuracy: acc,
      };
    } else if (acc >= 70) {
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        label: 'Needs Practice',
        accuracy: acc,
      };
    } else {
      return {
        bg: 'bg-red-100 text-red-900 border-red-400 font-bold animate-pulse',
        label: 'Challenging',
        accuracy: acc,
      };
    }
  };

  const selectedKeyStat = selectedKeyChar ? keyStats[selectedKeyChar.toLowerCase()] : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-cozy-text flex items-center gap-2">
            <span>📊</span> Performance & Metrics
          </h2>
          <p className="text-sm text-cozy-subtext mt-1">
            Track your typing speed, accuracy, and key-by-key mastery over time.
          </p>
        </div>

        {weakKeys.length > 0 && (
          <button
            onClick={() => onPracticeWeakKeys(weakKeys)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" /> Practice Weak Keys ({weakKeys.join(', ')})
          </button>
        )}
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Highest WPM */}
        <div className="bg-cozy-surface p-4 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Top Speed
          </span>
          <div className="text-2xl font-black text-cozy-text mt-1">
            {profile.metrics.highestWpm} <span className="text-xs font-semibold text-cozy-subtext">WPM</span>
          </div>
        </div>

        {/* Average WPM */}
        <div className="bg-cozy-surface p-4 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-500" /> Avg Speed
          </span>
          <div className="text-2xl font-black text-cozy-text mt-1">
            {profile.metrics.averageWpm} <span className="text-xs font-semibold text-cozy-subtext">WPM</span>
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="bg-cozy-surface p-4 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" /> Accuracy
          </span>
          <div className="text-2xl font-black text-cozy-text mt-1">
            {profile.metrics.averageAccuracy}%
          </div>
        </div>

        {/* Total Words Typed */}
        <div className="bg-cozy-surface p-4 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <FileText className="w-3.5 h-3.5 text-purple-500" /> Words
          </span>
          <div className="text-2xl font-black text-cozy-text mt-1">
            {profile.metrics.totalWordsTyped}
          </div>
        </div>

        {/* Total Practice Time */}
        <div className="bg-cozy-surface p-4 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time
          </span>
          <div className="text-2xl font-black text-cozy-text mt-1">
            {totalHours} <span className="text-xs font-semibold text-cozy-subtext">hrs</span>
          </div>
        </div>

        {/* 3-Star Lessons */}
        <div className="bg-cozy-surface p-4 rounded-2xl border border-cozy-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-cozy-subtext uppercase flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 3-Stars
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {totalThreeStars}
          </div>
        </div>
      </div>

      {/* Keyboard Heatmap Section */}
      <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-cozy-text flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" /> Keyboard Accuracy Heatmap
            </h3>
            <p className="text-xs text-cozy-subtext">
              Click any key to inspect your accuracy, attempts, and average latency.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span>95%+</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-teal-400" />
              <span>85-94%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>70-84%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span>&lt;70%</span>
            </div>
          </div>
        </div>

        {/* Visual Matrix */}
        <div className="p-3 bg-cozy-panel/80 rounded-2xl border border-cozy-border overflow-x-auto">
          <div className="flex flex-col gap-1.5 items-center justify-center min-w-[600px] select-none font-mono">
            {KEYBOARD_ROWS.slice(0, 4).map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 justify-center w-full">
                {row.map((key) => {
                  const heat = getKeyHeatStyle(key.primary);
                  const isSelected = selectedKeyChar?.toLowerCase() === key.primary.toLowerCase();
                  const widthClass = key.width ? key.width : 'w-8 sm:w-11';

                  return (
                    <button
                      key={key.code}
                      onClick={() => setSelectedKeyChar(key.primary)}
                      className={`
                        ${widthClass} h-10 sm:h-12
                        rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition
                        ${heat.bg}
                        ${isSelected ? 'ring-4 ring-purple-400 scale-105 z-10' : 'hover:scale-102'}
                      `}
                    >
                      <span>{key.primary}</span>
                      {heat.accuracy !== null && (
                        <span className="text-[9px] opacity-80">{heat.accuracy}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Key Details Bar */}
        {selectedKeyChar && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl border border-purple-300 flex items-center justify-center text-xl font-mono font-black text-purple-900 shadow-xs">
                {selectedKeyChar}
              </div>
              <div>
                <h4 className="font-extrabold text-purple-950 text-sm">Key Details: "{selectedKeyChar}"</h4>
                <span className="text-xs text-purple-700">
                  {selectedKeyStat ? `${selectedKeyStat.totalAttempts} total attempts` : 'No practice data yet'}
                </span>
              </div>
            </div>

            {selectedKeyStat ? (
              <div className="flex items-center gap-6 text-xs text-purple-950">
                <div>
                  <span className="text-purple-600 font-semibold">Errors:</span>
                  <div className="font-extrabold text-sm text-red-600">{selectedKeyStat.errors}</div>
                </div>
                <div>
                  <span className="text-purple-600 font-semibold">Accuracy:</span>
                  <div className="font-extrabold text-sm text-emerald-700">
                    {Math.round(((selectedKeyStat.totalAttempts - selectedKeyStat.errors) / selectedKeyStat.totalAttempts) * 100)}%
                  </div>
                </div>
                <div>
                  <span className="text-purple-600 font-semibold">Avg Latency:</span>
                  <div className="font-extrabold text-sm">
                    {Math.round(selectedKeyStat.totalLatencyMs / selectedKeyStat.totalAttempts)} ms
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Speed History & Progress Chart */}
      <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-cozy-text flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" /> Recent Session Speed Trend
        </h3>

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {/* SVG Speed Sparkline / Bar Chart */}
            <div className="h-40 w-full bg-cozy-panel p-4 rounded-2xl border border-cozy-border flex items-end gap-2 overflow-x-auto">
              {sessions.slice(0, 15).reverse().map((s, idx) => {
                const maxWpm = Math.max(60, profile.metrics.highestWpm);
                const heightPercent = Math.min(100, Math.max(10, Math.round((s.netWpm / maxWpm) * 100)));

                return (
                  <div key={s.id || idx} className="flex-1 flex flex-col items-center gap-1 min-w-[28px] h-full justify-end group">
                    <span className="text-[10px] font-bold text-cozy-subtext opacity-0 group-hover:opacity-100 transition">
                      {s.netWpm}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all duration-300 group-hover:from-emerald-600 group-hover:to-teal-500 shadow-xs"
                    />
                    <span className="text-[9px] text-cozy-subtext truncate max-w-[32px]">
                      #{sessions.length - idx}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recent Sessions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-cozy-panel text-cozy-subtext border-b border-cozy-border">
                  <tr>
                    <th className="p-3 rounded-l-xl">Lesson</th>
                    <th className="p-3">Speed</th>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">Stars</th>
                    <th className="p-3 rounded-r-xl">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cozy-border">
                  {sessions.slice(0, 8).map((s) => (
                    <tr key={s.id} className="hover:bg-cozy-panel/50">
                      <td className="p-3 font-bold text-cozy-text">{s.lessonTitle}</td>
                      <td className="p-3 font-extrabold text-emerald-600">{s.netWpm} WPM</td>
                      <td className="p-3 font-bold">{s.accuracy}%</td>
                      <td className="p-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= s.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-cozy-subtext">
                        {new Date(s.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-cozy-panel rounded-2xl border border-cozy-border text-sm text-cozy-subtext">
            No practice sessions recorded yet! Complete your first lesson to see your speed graphs.
          </div>
        )}
      </div>
    </div>
  );
};
