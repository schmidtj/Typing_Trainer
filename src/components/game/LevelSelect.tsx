import React, { useState } from 'react';
import { CURRICULUM_STAGES } from '../../curriculum/stages';
import { Lesson } from '../../types/curriculum';
import { UserProfile } from '../../types/profile';
import { Star, Zap, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface LevelSelectProps {
  profile: UserProfile;
  onSelectLesson: (lesson: Lesson) => void;
  onCustomDrill: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  profile,
  onSelectLesson,
  onCustomDrill,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<number>(profile.currentStageId || 1);

  const activeStage = CURRICULUM_STAGES.find(s => s.id === selectedStageId) || CURRICULUM_STAGES[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-cozy-surface p-6 rounded-3xl border-2 border-cozy-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-cozy-text flex items-center gap-2">
            <span>🗺️</span> Learning Map & Stages
          </h2>
          <p className="text-sm text-cozy-subtext mt-1">
            Choose a stage to practice or review. Replay any unlocked lesson for 3 stars!
          </p>
        </div>

        <button
          onClick={onCustomDrill}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm rounded-2xl shadow-sm transition transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4" /> Weak Key Practice Drill
        </button>
      </div>

      {/* Stage Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {CURRICULUM_STAGES.map((stage) => {
          const isSelected = stage.id === selectedStageId;
          const stageLessons = stage.lessons;
          const completedCount = stageLessons.filter(l => profile.completedLevels[l.id]?.stars > 0).length;
          const isStageUnlocked = stage.id === 1 || stage.id <= (profile.currentStageId || 1) + 1;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStageId(stage.id)}
              className={`
                p-3 rounded-2xl border-2 flex flex-col items-center justify-between transition-all duration-150
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm scale-102 font-extrabold'
                  : 'border-cozy-border bg-cozy-surface hover:bg-cozy-panel text-cozy-text font-bold'}
                ${!isStageUnlocked ? 'opacity-60' : ''}
              `}
            >
              <span className="text-2xl mb-1">{stage.icon}</span>
              <span className="text-xs text-center font-bold line-clamp-1">Stage {stage.id}</span>
              <span className="text-[10px] text-cozy-subtext font-semibold mt-1">
                {completedCount}/{stageLessons.length} ★
              </span>
            </button>
          );
        })}
      </div>

      {/* Stage Banner */}
      <div className={`p-6 rounded-3xl bg-gradient-to-r ${activeStage.color} text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl p-3 bg-white/20 backdrop-blur-xs rounded-2xl shadow-xs">
            {activeStage.icon}
          </span>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white/80">
              Stage {activeStage.id}
            </span>
            <h3 className="text-xl sm:text-2xl font-black">{activeStage.title}</h3>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5">{activeStage.description}</p>
          </div>
        </div>
      </div>

      {/* Lessons Grid for Selected Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeStage.lessons.map((lesson) => {
          const progress = profile.completedLevels[lesson.id];
          const isCompleted = progress && progress.stars > 0;
          const stars = progress?.stars || 0;

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`
                p-5 rounded-3xl border-2 bg-cozy-surface hover:bg-cozy-panel flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xs hover:-translate-y-1
                ${isCompleted ? 'border-emerald-300' : 'border-cozy-border'}
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cozy-subtext uppercase tracking-wider">
                    Lesson {lesson.stageLessonNumber}
                  </span>
                  {/* Star Badges */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="text-base font-extrabold text-cozy-text mb-1">{lesson.title}</h4>
                <p className="text-xs text-cozy-subtext leading-relaxed line-clamp-2">
                  {lesson.subtitle}
                </p>

                {/* New Keys Introduced */}
                {lesson.newKeys && lesson.newKeys.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <span className="text-[11px] font-bold text-cozy-subtext">Keys:</span>
                    {lesson.newKeys.map((k) => (
                      <span
                        key={k}
                        className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-mono font-bold border border-amber-200"
                      >
                        {k === ' ' ? 'Space' : k}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Goal & Best Record */}
              <div className="pt-4 mt-4 border-t border-cozy-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-cozy-subtext font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> {lesson.targetWpm} WPM
                  </span>
                  <span className="flex items-center gap-1 text-cozy-subtext font-semibold">
                    <Award className="w-3.5 h-3.5 text-emerald-500" /> {lesson.minAccuracy}%
                  </span>
                </div>

                {isCompleted ? (
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {progress.highWpm} WPM
                  </span>
                ) : (
                  <span className="text-cozy-subtext font-bold">Play →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
