
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { User, Deck, Card, StudyLog } from '../types';
import { api, AuthCredentials } from '../services/api';

interface AppContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<User>;
  signup: (credentials: AuthCredentials) => Promise<User>;
  logout: () => void;
  getDecks: () => Promise<Deck[]>;
  getDeck: (deckId: string) => Promise<Deck | null>;
  addDeck: (title: string, description: string) => Promise<Deck>;
  getCards: (deckId: string) => Promise<Card[]>;
  addCard: (deckId: string, question: string, answer: string) => Promise<Card>;
  getDueCards: (deckId: string) => Promise<Card[]>;
  updateCardAfterStudy: (cardId: string, confidence: number, performance: number) => Promise<void>;
  getStudyLogs: (deckId?: string) => Promise<StudyLog[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await api.init();
      const currentUser = api.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initialize();
  }, []);

  const authApi = useMemo(() => ({
    login: async (credentials: AuthCredentials) => {
      const loggedInUser = await api.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    },
    signup: async (credentials: AuthCredentials) => {
      const newUser = await api.signup(credentials);
      setUser(newUser);
      return newUser;
    },
    logout: () => {
      api.logout();
      setUser(null);
    }
  }), []);

  const dbApi = useMemo(() => ({
    getDecks: () => api.getDecks(),
    getDeck: (deckId: string) => api.getDeck(deckId),
    addDeck: (title: string, description: string) => api.addDeck(title, description),
    getCards: (deckId: string) => api.getCards(deckId),
    addCard: (deckId: string, question: string, answer: string) => api.addCard(deckId, question, answer),
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
