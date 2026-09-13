import { IslandState } from './island';
import { UserMetrics } from './metrics';

export interface UserSettings {
  soundVolume: number; // 0.0 - 1.0
  soundMuted: boolean;
  showKeyboard: boolean;
  showHandGuide: boolean;
  fontSize: 'normal' | 'large';
  strictBackspace: boolean; // if true, must backspace error before continuing
}

export interface LevelProgress {
  stars: number; // 1-3
  highWpm: number;
  bestAccuracy: number;
  timesPlayed: number;
  lastPlayed: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
  lastPlayed: number;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  currentStageId: number;
  currentLessonId: string;
  completedLevels: Record<string, LevelProgress>;
  island: IslandState;
  metrics: UserMetrics;
  settings: UserSettings;
  arcadeHighScore: number;
  achievements: string[];
}

export interface ProfileRegistry {
  version: number;
  activeProfileId: string;
  profiles: Record<string, UserProfile>;
}
