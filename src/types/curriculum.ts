import { AnimalId } from './island';

export type FingerType =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

export type LessonType =
  | 'new-keys'
  | 'reinforce'
  | 'words'
  | 'sentences'
  | 'story'
  | 'speed-sprint';

export interface Lesson {
  id: string;
  stageId: number;
  stageLessonNumber: number;
  title: string;
  subtitle: string;
  type: LessonType;
  newKeys: string[];
  practiceText: string;
  targetWpm: number;
  minAccuracy: number;
  rewardCoins: number;
  rewardXp: number;
  unlockAnimalId?: AnimalId;
}

export interface Stage {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}
