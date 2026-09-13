import { useState, useEffect } from 'react';
import { UserProfile } from './types/profile';
import { Lesson } from './types/curriculum';
import { getActiveProfile, saveActiveProfile, calculateLevel } from './storage/profileStorage';
import { CURRICULUM_STAGES, findLessonById, getNextLessonId } from './curriculum/stages';
import { identifyWeakKeys, generateWeakKeyDrill } from './curriculum/textGenerator';
import { soundManager } from './audio/soundManager';

import { TypingArena } from './components/game/TypingArena';
import { LevelSelect } from './components/game/LevelSelect';
import { IslandView } from './components/island/IslandView';
import { BerryCatchArcade } from './components/arcade/BerryCatchArcade';
import { AnalyticsDashboard } from './components/metrics/AnalyticsDashboard';
import { ProfileManager } from './components/profile/ProfileManager';

import {
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

type AppView = 'sanctuary' | 'levels' | 'typing' | 'arcade' | 'metrics';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(() => getActiveProfile());
  const [currentView, setCurrentView] = useState<AppView>('levels');
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    const found = findLessonById(profile.currentLessonId);
    return found ? found.lesson : CURRICULUM_STAGES[0].lessons[0];
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Sync sound manager settings on profile load
  useEffect(() => {
    soundManager.setVolume(profile.settings.soundVolume);
    soundManager.setMuted(profile.settings.soundMuted);
  }, [profile.settings.soundVolume, profile.settings.soundMuted]);

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveActiveProfile(updated);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    soundManager.playKeypress(2);
    setActiveLesson(lesson);
    setCurrentView('typing');
  };

  const handleNextLesson = () => {
    const nextId = getNextLessonId(activeLesson.id);
    if (nextId) {
      const found = findLessonById(nextId);
      if (found) {
        soundManager.playKeypress(3);
        setActiveLesson(found.lesson);
        // Also update currentLessonId in profile if advancing
        handleUpdateProfile({
          ...profile,
          currentLessonId: nextId,
          currentStageId: found.stage.id,
        });
        setCurrentView('typing');
      }
    } else {
      setCurrentView('levels');
    }
  };

  const handleCustomWeakKeyDrill = () => {
    const weak = identifyWeakKeys(profile.metrics.keyStats || {}, 3);
    const drillText = generateWeakKeyDrill(weak);

    const customLesson: Lesson = {
      id: 'custom-weak-keys-' + Date.now(),
      stageId: profile.currentStageId || 1,
      stageLessonNumber: 99,
      title: 'Targeted Weak Key Drill',
      subtitle: `Focus practice on: ${weak.length > 0 ? weak.join(', ').toUpperCase() : 'General Touch Rhythm'}`,
      type: 'reinforce',
      newKeys: weak,
      practiceText: drillText,
      targetWpm: Math.max(15, profile.metrics.averageWpm || 20),
      minAccuracy: 90,
      rewardCoins: 40,
      rewardXp: 50,
    };

    soundManager.playKeypress(1);
    setActiveLesson(customLesson);
    setCurrentView('typing');
  };

  const handleToggleSound = () => {
    const nextMuted = !profile.settings.soundMuted;
    soundManager.setMuted(nextMuted);
    handleUpdateProfile({
      ...profile,
      settings: {
        ...profile.settings,
        soundMuted: nextMuted,
      },
    });
  };

  const { level, currentLevelXp, nextLevelXp, progressPercent } = calculateLevel(profile.xp);

  return (
    <div className="min-h-screen bg-cozy-bg text-cozy-text flex flex-col font-cozy">
      {/* Top Main Navigation Bar */}
      <header className="bg-cozy-surface/90 backdrop-blur-md border-b-2 border-cozy-border sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView('levels')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <span className="text-3xl transform group-hover:scale-110 transition-transform">
              🐾
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-cozy-text tracking-tight flex items-center gap-1.5">
                Cozy Animal Island
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Trainer
                </span>
              </h1>
              <p className="text-[11px] text-cozy-subtext font-semibold hidden sm:block">
                Touch typing adventure for young champions
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <nav className="flex items-center gap-1.5 bg-cozy-panel p-1 rounded-2xl border border-cozy-border">
            <button
              onClick={() => {
                soundManager.playKeypress(1);
                setCurrentView('levels');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                currentView === 'levels' || currentView === 'typing'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-cozy-subtext hover:text-cozy-text hover:bg-cozy-surface'
              }`}
            >
              <span>🗺️</span> Levels
            </button>

            <button
              onClick={() => {
                soundManager.playKeypress(1);
                setCurrentView('sanctuary');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                currentView === 'sanctuary'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-cozy-subtext hover:text-cozy-text hover:bg-cozy-surface'
              }`}
            >
              <span>🏝️</span> Sanctuary
            </button>

            <button
              onClick={() => {
                soundManager.playKeypress(1);
                setCurrentView('arcade');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                currentView === 'arcade'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-cozy-subtext hover:text-cozy-text hover:bg-cozy-surface'
              }`}
            >
              <span>🍓</span> Arcade
            </button>

            <button
              onClick={() => {
                soundManager.playKeypress(1);
                setCurrentView('metrics');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                currentView === 'metrics'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-cozy-subtext hover:text-cozy-text hover:bg-cozy-surface'
              }`}
            >
              <span>📊</span> Metrics
            </button>
          </nav>

          {/* User Status / Profile Pill & Sound Button */}
          <div className="flex items-center gap-2">
            {/* Currency */}
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-extrabold text-amber-800 text-xs">
              <span>🪙</span>
              <span>{profile.coins}</span>
            </div>

            {/* Profile Avatar & Level Pill */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-cozy-panel hover:bg-cozy-border p-1.5 pr-3 rounded-2xl border border-cozy-border transition shadow-xs"
              title="Click to Switch Player or Settings"
            >
              <span className="text-xl p-1 bg-white rounded-xl shadow-2xs border border-cozy-border">
                {profile.avatar}
              </span>
              <div className="text-left hidden md:block">
                <div className="text-xs font-black text-cozy-text leading-tight">{profile.name}</div>
                <div className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                  <span>Lvl {level}</span>
                  <div className="w-12 bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition ${
                profile.settings.soundMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-cozy-panel border-cozy-border text-cozy-text hover:bg-cozy-surface'
              }`}
              title={profile.settings.soundMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {profile.settings.soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {currentView === 'levels' && (
          <LevelSelect
            profile={profile}
            onSelectLesson={handleSelectLesson}
            onCustomDrill={handleCustomWeakKeyDrill}
          />
        )}

        {currentView === 'typing' && (
          <TypingArena
            lesson={activeLesson}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setCurrentView('levels')}
            onNextLesson={handleNextLesson}
            onGoToSanctuary={() => setCurrentView('sanctuary')}
          />
        )}

        {currentView === 'sanctuary' && (
          <IslandView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentView === 'arcade' && (
          <BerryCatchArcade
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setCurrentView('levels')}
          />
        )}

        {currentView === 'metrics' && (
          <AnalyticsDashboard
            profile={profile}
            onPracticeWeakKeys={(weakKeys) => {
              const drillText = generateWeakKeyDrill(weakKeys);
              const customLesson: Lesson = {
                id: 'custom-weak-keys-' + Date.now(),
                stageId: profile.currentStageId || 1,
                stageLessonNumber: 99,
                title: 'Weak Key Focus Drill',
                subtitle: `Focus practice on: ${weakKeys.join(', ').toUpperCase()}`,
                type: 'reinforce',
                newKeys: weakKeys,
                practiceText: drillText,
                targetWpm: Math.max(15, profile.metrics.averageWpm || 20),
                minAccuracy: 90,
                rewardCoins: 40,
                rewardXp: 50,
              };
              setActiveLesson(customLesson);
              setCurrentView('typing');
            }}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 border-t border-cozy-border bg-cozy-surface text-center text-xs text-cozy-subtext">
        <div className="flex items-center justify-center gap-2">
          <span>🐾 Cozy Animal Island Typing Trainer</span>
          <span>•</span>
          <span>Level {level} ({currentLevelXp}/{nextLevelXp} XP)</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <Sparkles className="w-3 h-3" /> Keep up the wonderful typing!
          </span>
        </div>
      </footer>

      {/* Profile & Settings Modal */}
      {showProfileModal && (
        <ProfileManager
          currentProfile={profile}
          onProfileChanged={handleUpdateProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
