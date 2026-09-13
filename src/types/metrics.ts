export interface KeyMetric {
  char: string;
  totalAttempts: number;
  errors: number;
  totalLatencyMs: number;
}

export interface SessionResult {
  id: string;
  timestamp: number;
  lessonId: string;
  lessonTitle: string;
  durationSeconds: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  stars: number;
  errorKeys: Record<string, number>;
}

export interface UserMetrics {
  totalWordsTyped: number;
  totalTimeSeconds: number;
  highestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  keyStats: Record<string, KeyMetric>;
  sessionHistory: SessionResult[];
}
