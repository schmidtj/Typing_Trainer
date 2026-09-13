import React, { useState } from 'react';
import { UserProfile } from '../../types/profile';
import {
  loadRegistry,
  createAndSwitchProfile,
  switchActiveProfile,
  deleteProfile,
  exportBackupJson,
  importBackupJson,
} from '../../storage/profileStorage';
import { soundManager } from '../../audio/soundManager';
import { Users, Plus, Download, Upload, Trash2, Volume2, VolumeX, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileManagerProps {
  currentProfile: UserProfile;
  onProfileChanged: (newProfile: UserProfile) => void;
  onClose: () => void;
}

const AVATARS = ['🐰', '🐱', '🦊', '🐼', '🐧', '🦉', '🦫', '🦦', '🐲', '🦄', '🐶', '🐨'];

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  currentProfile,
  onProfileChanged,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'new-game' | 'settings' | 'backup'>('profiles');
  const [registry, setRegistry] = useState(loadRegistry());

  // New Profile Form State
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🐰');
  const [newStartStage, setNewStartStage] = useState(1);

  // Backup state
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const handleSwitchProfile = (id: string) => {
    soundManager.playKeypress(2);
    const switched = switchActiveProfile(id);
    if (switched) {
      onProfileChanged(switched);
      onClose();
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    soundManager.playLevelComplete();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    const created = createAndSwitchProfile(newName.trim(), newAvatar, newStartStage);
    setRegistry(loadRegistry());
    onProfileChanged(created);
    onClose();
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      const ok = deleteProfile(id);
      if (ok) {
        soundManager.playError();
        const updatedReg = loadRegistry();
        setRegistry(updatedReg);
        onProfileChanged(updatedReg.profiles[updatedReg.activeProfileId]);
      } else {
        alert('Cannot delete the only profile!');
      }
    }
  };

  const handleToggleSound = () => {
    const nextMuted = !currentProfile.settings.soundMuted;
    soundManager.setMuted(nextMuted);
    const updated = {
      ...currentProfile,
      settings: {
        ...currentProfile.settings,
        soundMuted: nextMuted,
      },
    };
    onProfileChanged(updated);
  };

  const handleVolumeChange = (vol: number) => {
    soundManager.setVolume(vol);
    const updated = {
      ...currentProfile,
      settings: {
        ...currentProfile.settings,
        soundVolume: vol,
      },
    };
    onProfileChanged(updated);
  };

  const handleToggleSetting = (key: 'showKeyboard' | 'showHandGuide' | 'strictBackspace') => {
    soundManager.playKeypress(1);
    const updated = {
      ...currentProfile,
      settings: {
        ...currentProfile.settings,
        [key]: !currentProfile.settings[key],
      },
    };
    onProfileChanged(updated);
  };

  const handleExport = () => {
    soundManager.playCoin();
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cozy_animal_typing_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Backup downloaded successfully!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      if (res.success) {
        soundManager.playLevelComplete();
        const updatedReg = loadRegistry();
        setRegistry(updatedReg);
        onProfileChanged(updatedReg.profiles[updatedReg.activeProfileId]);
        setBackupStatus('Backup imported successfully!');
      } else {
        soundManager.playError();
        setBackupStatus(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-cozy-surface w-full max-w-2xl rounded-3xl border-2 border-cozy-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-cozy-border flex items-center justify-between bg-cozy-panel">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="text-xl font-extrabold text-cozy-text">Profile & Settings</h3>
              <p className="text-xs text-cozy-subtext">Manage players, new games, and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cozy-surface hover:bg-cozy-border text-cozy-subtext font-bold flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex border-b border-cozy-border bg-cozy-bg px-6 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'profiles'
                ? 'border-emerald-500 text-emerald-800'
                : 'border-transparent text-cozy-subtext hover:text-cozy-text'
            }`}
          >
            <Users className="w-4 h-4" /> Players ({Object.keys(registry.profiles).length})
          </button>
          <button
            onClick={() => setActiveTab('new-game')}
            className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'new-game'
                ? 'border-emerald-500 text-emerald-800'
                : 'border-transparent text-cozy-subtext hover:text-cozy-text'
            }`}
          >
            <Plus className="w-4 h-4" /> Start New Game
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-800'
                : 'border-transparent text-cozy-subtext hover:text-cozy-text'
            }`}
          >
            <span>🎛️</span> Controls & Sound
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-800'
                : 'border-transparent text-cozy-subtext hover:text-cozy-text'
            }`}
          >
            <Download className="w-4 h-4" /> Backup / Sync
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: PROFILES LIST */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="text-xs text-cozy-subtext font-semibold">
                Click any profile to load its progress, animals, and records.
              </div>

              <div className="space-y-3">
                {Object.values(registry.profiles).map((prof) => {
                  const isActive = prof.id === currentProfile.id;

                  return (
                    <div
                      key={prof.id}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between transition ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-50/60 shadow-xs'
                          : 'border-cozy-border bg-cozy-surface hover:bg-cozy-panel'
                      }`}
                    >
                      <div
                        onClick={() => handleSwitchProfile(prof.id)}
                        className="flex items-center gap-3.5 cursor-pointer flex-1"
                      >
                        <span className="text-4xl p-2 bg-white rounded-xl shadow-xs border border-cozy-border">
                          {prof.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-cozy-text text-base">{prof.name}</h4>
                            {isActive && (
                              <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-cozy-subtext flex items-center gap-3 mt-1 font-semibold">
                            <span>Stage {prof.currentStageId || 1}</span>
                            <span>•</span>
                            <span>{prof.coins} 🪙</span>
                            <span>•</span>
                            <span>Top {prof.metrics.highestWpm} WPM</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            onClick={() => handleSwitchProfile(prof.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition"
                          >
                            Switch
                          </button>
                        )}
                        {Object.keys(registry.profiles).length > 1 && (
                          <button
                            onClick={() => handleDeleteProfile(prof.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: START NEW GAME */}
          {activeTab === 'new-game' && (
            <form onSubmit={handleCreateProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-cozy-text uppercase tracking-wider mb-2">
                  Player Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Emma, Lily, Dad..."
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-2xl bg-cozy-panel border-2 border-cozy-border font-bold text-cozy-text focus:outline-hidden focus:border-emerald-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cozy-text uppercase tracking-wider mb-2">
                  Choose Favorite Companion Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setNewAvatar(av)}
                      className={`p-3 rounded-2xl text-2xl border-2 transition ${
                        newAvatar === av
                          ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-xs'
                          : 'border-cozy-border bg-cozy-panel hover:bg-white'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cozy-text uppercase tracking-wider mb-2">
                  Starting Skill Level
                </label>
                <select
                  value={newStartStage}
                  onChange={(e) => setNewStartStage(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-cozy-panel border-2 border-cozy-border font-bold text-cozy-text focus:outline-hidden focus:border-emerald-400 transition text-sm"
                >
                  <option value={1}>Stage 1: Home Row Haven (Beginner - Never typed before)</option>
                  <option value={2}>Stage 2: Top Row Treks (Learned home row)</option>
                  <option value={3}>Stage 3: Bottom Row Beach (Familiar with most letters)</option>
                  <option value={4}>Stage 4: Capital Cliffs (Practicing Shift keys)</option>
                  <option value={6}>Stage 6: Sight Word Woods (Fast words 40+ WPM)</option>
                  <option value={8}>Stage 8: Mastery Rush (Speed champion 70-100+ WPM)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-md transition transform hover:-translate-y-0.5 text-sm"
              >
                Create & Begin Adventure ✨
              </button>
            </form>
          )}

          {/* TAB 3: CONTROLS & SOUND */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Sound & Volume */}
              <div className="p-4 rounded-2xl border border-cozy-border bg-cozy-panel space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-cozy-text flex items-center gap-2">
                    {currentProfile.settings.soundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    Web Audio Sound FX
                  </span>
                  <button
                    onClick={handleToggleSound}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      currentProfile.settings.soundMuted
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentProfile.settings.soundMuted ? 'Muted' : 'Enabled'}
                  </button>
                </div>

                {!currentProfile.settings.soundMuted && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-cozy-subtext font-semibold">Volume:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={currentProfile.settings.soundVolume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="text-xs font-bold text-cozy-text w-8 text-right">
                      {Math.round(currentProfile.settings.soundVolume * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Strict Backspace Toggle */}
              <div className="p-4 rounded-2xl border border-cozy-border bg-cozy-panel flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-cozy-text flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Strict Correction Mode
                  </h4>
                  <p className="text-xs text-cozy-subtext mt-0.5">
                    Requires pressing Backspace on errors before advancing (Recommended for learning)
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSetting('strictBackspace')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentProfile.settings.strictBackspace
                      ? 'bg-emerald-500 text-white'
                      : 'bg-cozy-surface text-cozy-subtext border border-cozy-border'
                  }`}
                >
                  {currentProfile.settings.strictBackspace ? 'Strict (ON)' : 'Relaxed (OFF)'}
                </button>
              </div>

              {/* Show Keyboard Toggle */}
              <div className="p-4 rounded-2xl border border-cozy-border bg-cozy-panel flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-cozy-text flex items-center gap-1.5">
                    {currentProfile.settings.showKeyboard ? <Eye className="w-4 h-4 text-purple-600" /> : <EyeOff className="w-4 h-4 text-cozy-subtext" />}
                    On-Screen Virtual Keyboard
                  </h4>
                  <p className="text-xs text-cozy-subtext mt-0.5">
                    Color-coded keys showing which finger to use
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSetting('showKeyboard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentProfile.settings.showKeyboard
                      ? 'bg-purple-600 text-white'
                      : 'bg-cozy-surface text-cozy-subtext border border-cozy-border'
                  }`}
                >
                  {currentProfile.settings.showKeyboard ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {/* Show Hand Guide Toggle */}
              <div className="p-4 rounded-2xl border border-cozy-border bg-cozy-panel flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-cozy-text flex items-center gap-1.5">
                    <span>🖐️</span> Animated Finger Placement Hands
                  </h4>
                  <p className="text-xs text-cozy-subtext mt-0.5">
                    Shows left and right hands highlighting exactly which finger to press
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSetting('showHandGuide')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentProfile.settings.showHandGuide
                      ? 'bg-purple-600 text-white'
                      : 'bg-cozy-surface text-cozy-subtext border border-cozy-border'
                  }`}
                >
                  {currentProfile.settings.showHandGuide ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & SYNC */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-cozy-subtext leading-relaxed">
                Save your progress or transfer it to another computer anytime. Export downloads a small JSON file containing all profiles, unlocked animals, high scores, and statistics.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border-2 border-cozy-border bg-cozy-panel text-center space-y-3">
                  <Download className="w-8 h-8 mx-auto text-emerald-600" />
                  <h4 className="font-bold text-sm text-cozy-text">Download Backup</h4>
                  <button
                    onClick={handleExport}
                    className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-xs"
                  >
                    Export Profiles (.json)
                  </button>
                </div>

                <div className="p-5 rounded-2xl border-2 border-cozy-border bg-cozy-panel text-center space-y-3">
                  <Upload className="w-8 h-8 mx-auto text-sky-600" />
                  <h4 className="font-bold text-sm text-cozy-text">Restore From Backup</h4>
                  <label className="block w-full py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer">
                    Import Backup File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {backupStatus && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
                  {backupStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
