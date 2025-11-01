import React, { createContext, useContext, useEffect, ReactNode, useMemo, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, Deck, Card, StudyLog } from '../types';
import { api, AuthCredentials } from '../services/api';
import { demoDeck, demoCards, demoStudyLogs } from '../lib/demoData';

interface AppContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  enableDemoMode: () => void;
  login: (credentials: Pick<AuthCredentials, 'email' | 'password'>) => Promise<any>;
  signup: (credentials: AuthCredentials) => Promise<any>;
  logout: () => Promise<void>;
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
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loading = status === 'loading';
  const user = session?.user as User | null;
  
  // Reset demo mode when user logs in
  useEffect(() => {
    if (user && isDemoMode) {
      setIsDemoMode(false);
    }
  }, [user, isDemoMode]);

  const enableDemoMode = () => {
    setIsDemoMode(true);
  };

  const authApi = useMemo(() => ({
    // Login now uses the signIn function from next-auth
    login: async (credentials: Pick<AuthCredentials, 'email' | 'password'>) => {
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        // Map NextAuth error codes to user-friendly messages
        const errorMessages: { [key: string]: string } = {
          'CredentialsSignin': 'Invalid email or password',
          'Configuration': 'Invalid email or password',
          'AccessDenied': 'Access denied',
          'Verification': 'Verification failed',
        };
        
        const errorMessage = errorMessages[result.error] || result.error || 'Authentication failed';
        throw new Error(errorMessage);
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
    // Logout uses the signOut function without redirect (we'll handle navigation in the component)
    logout: async () => {
      setIsDemoMode(false);
      await signOut({ redirect: false });
    }
  }), []);

  // The database API calls - return demo data if in demo mode
  const dbApi = useMemo(() => ({
    getDecks: () => {
      if (isDemoMode) {
        return Promise.resolve([demoDeck]);
      }
      return api.getDecks();
    },
    getDeck: (deckId: string) => {
      if (isDemoMode && deckId === 'demo-deck-1') {
        return Promise.resolve(demoDeck);
      }
      if (isDemoMode) {
        return Promise.resolve(null);
      }
      return api.getDeck(deckId);
    },
    addDeck: (title: string, description: string) => {
      if (isDemoMode) {
        throw new Error('Cannot save data in demo mode. Please create an account to save your decks.');
      }
      return api.addDeck(title, description);
    },
    deleteDeck: (deckId: string) => {
      if (isDemoMode) {
        throw new Error('Cannot save data in demo mode. Please create an account to manage your decks.');
      }
      return api.deleteDeck(deckId);
    },
    getCards: (deckId: string) => {
      if (isDemoMode && deckId === 'demo-deck-1') {
        return Promise.resolve(demoCards);
      }
      if (isDemoMode) {
        return Promise.resolve([]);
      }
      return api.getCards(deckId);
    },
    addCard: (deckId: string, question: string, answer: string) => {
      if (isDemoMode) {
        throw new Error('Cannot save data in demo mode. Please create an account to save your cards.');
      }
      return api.addCard(deckId, question, answer);
    },
    deleteCard: (cardId: string) => {
      if (isDemoMode) {
        throw new Error('Cannot save data in demo mode. Please create an account to manage your cards.');
      }
      return api.deleteCard(cardId);
    },
    getDueCards: (deckId: string) => {
      if (isDemoMode && deckId === 'demo-deck-1') {
        // Return cards that are due (nextReviewDate <= now)
        const now = new Date();
        return Promise.resolve(demoCards.filter(card => new Date(card.nextReviewDate) <= now));
      }
      if (isDemoMode) {
        return Promise.resolve([]);
      }
      return api.getDueCards(deckId);
    },
    updateCardAfterStudy: (cardId: string, confidence: number, performance: number) => {
      if (isDemoMode) {
        // In demo mode, simulate updating the card (but don't persist)
        return Promise.resolve();
      }
      return api.updateCardAfterStudy(cardId, confidence, performance);
    },
    getStudyLogs: (deckId?: string) => {
      if (isDemoMode) {
        if (deckId && deckId === 'demo-deck-1') {
          return Promise.resolve(demoStudyLogs);
        }
        if (!deckId) {
          return Promise.resolve(demoStudyLogs);
        }
        return Promise.resolve([]);
      }
      return api.getStudyLogs(deckId);
    },
  }), [isDemoMode]);

  const value: AppContextType = {
    user: isDemoMode ? { id: 'demo-user', email: 'demo@example.com' } : user,
    loading: isDemoMode ? false : loading,
    isDemoMode,
    enableDemoMode,
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