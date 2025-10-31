
export interface User {
  id: string;
  email: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  userId: string;
  cardCount: number;
  dueCount: number;
}

export interface Card {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  // Spaced Repetition Fields
  nextReviewDate: string; // ISO string
  interval: number; // in days
  easeFactor: number;
  // Metacognitive Fields
  lastConfidence: number | null; // 1-5
  lastPerformance: number | null; // 0, 3, 5
}

export interface StudyLog {
  id: string;
  userId: string;
  deckId: string;
  cardId: string;
  timestamp: string; // ISO string
  confidence: number; // 1-5
  performance: number; // 0, 3, 5
}