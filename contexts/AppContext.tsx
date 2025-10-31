import React, { createContext, useContext, useEffect, ReactNode, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, Deck, Card, StudyLog } from '../types';
import { api, AuthCredentials } from '../services/api';

interface AppContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: Pick<AuthCredentials, 'email' | 'password'>) => Promise<any>;
  signup: (credentials: AuthCredentials) => Promise<any>;
  logout: () => void;
  getDecks: () => Promise<Deck[]>;
  getDeck: (deckId: string) => Promise<Deck | null>;
  addDeck: (title: string, description: string) => Promise<Deck>;
  deleteDeck: (deckId: string) => Promise<void>;
  getCards: (deckId: string) => Promise<Card[]>;
  addCard: (deckId: string, question: string, answer: string) => Promise<Card>;
  deleteCard: (cardId: string) => Promise<void>;
  getDueCards: (deckId: string) => Promise<Card[]>;
  updateCardAfterStudy: (cardId: string, confidence: number, performance: number) => Promise<void>;
  getStudyLogs: (deckId?: string) => Promise<StudyLog[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // The source of truth for auth state now comes from Auth.js
  const { data: session, status } = useSession();

  const loading = status === 'loading';
  const user = session?.user as User | null;

  const authApi = useMemo(() => ({
    // Login now uses the signIn function from next-auth
    login: async (credentials: Pick<AuthCredentials, 'email' | 'password'>) => {
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    // Signup hits our custom API endpoint
    signup: async (credentials: AuthCredentials) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
      // After successful signup, log the user in
      return authApi.login(credentials);
    },
    // Logout uses the signOut function
    logout: () => {
      signOut({ callbackUrl: '/auth' });
    }
  }), []);

  // The database API calls remain the same, but now they will hit our real API endpoints
  const dbApi = useMemo(() => ({
    getDecks: () => api.getDecks(),
    getDeck: (deckId: string) => api.getDeck(deckId),
    addDeck: (title: string, description: string) => api.addDeck(title, description),
    deleteDeck: (deckId: string) => api.deleteDeck(deckId),
    getCards: (deckId: string) => api.getCards(deckId),
    addCard: (deckId: string, question: string, answer: string) => api.addCard(deckId, question, answer),
    deleteCard: (cardId: string) => api.deleteCard(cardId),
    getDueCards: (deckId: string) => api.getDueCards(deckId),
    updateCardAfterStudy: (cardId: string, confidence: number, performance: number) => api.updateCardAfterStudy(cardId, confidence, performance),
    getStudyLogs: (deckId?: string) => api.getStudyLogs(deckId),
  }), []);

  const value: AppContextType = {
    user,
    loading,
    ...authApi,
    ...dbApi,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};