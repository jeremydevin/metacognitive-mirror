import { Deck, Card, StudyLog } from '../types';

export interface AuthCredentials {
  email: string;
  password: string; 
}

// --- API Service Layer ---

// A helper function to handle fetch responses and errors
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorInfo = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorInfo.message || 'An API error occurred');
  }
  if (response.status === 204) { // No Content
    return undefined as T;
  }
  return response.json();
}

export const api = {
  getDecks: (): Promise<Deck[]> => {
    return fetcher('/api/decks');
  },

  getDeck: (deckId: string): Promise<Deck | null> => {
    return fetcher(`/api/decks?deckId=${deckId}`);
  },

  addDeck: (title: string, description: string): Promise<Deck> => {
    return fetcher('/api/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
  },

  deleteDeck: (deckId: string): Promise<void> => {
    return fetcher(`/api/decks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId }),
    });
  },

  getCards: (deckId: string): Promise<Card[]> => {
    return fetcher(`/api/cards?deckId=${deckId}`);
  },

  addCard: (deckId: string, question: string, answer: string): Promise<Card> => {
    return fetcher('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId, question, answer }),
    });
  },

  deleteCard: (cardId: string): Promise<void> => {
     return fetcher(`/api/cards`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    });
  },

  getDueCards: (deckId: string): Promise<Card[]> => {
    return fetcher(`/api/study?deckId=${deckId}`);
  },

  updateCardAfterStudy: (cardId: string, confidence: number, performance: number): Promise<void> => {
    return fetcher('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, confidence, performance }),
    });
  },
  
  getStudyLogs: (deckId?: string): Promise<StudyLog[]> => {
    const url = deckId ? `/api/logs?deckId=${deckId}` : '/api/logs';
    return fetcher(url);
  }
};