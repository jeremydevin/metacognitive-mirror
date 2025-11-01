import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useApp } from './contexts/AppContext';

// This import will be needed for Auth.js.
// In a real project, you would install next-auth.
// For now, we are adding the necessary provider wrapper.
import { SessionProvider } from 'next-auth/react';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DeckDetailPage from './pages/DeckDetailPage';
import StudySessionPage from './pages/StudySessionPage';
import MirrorPage from './pages/MirrorPage';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isDemoMode } = useApp();

  if (loading && !isDemoMode) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading, isDemoMode } = useApp();
  
  if (loading && !isDemoMode) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={(user || isDemoMode) ? <Navigate to="/" /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/deck/:deckId"
        element={
          <ProtectedRoute>
            <Layout><DeckDetailPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:deckId"
        element={
          <ProtectedRoute>
            <Layout><StudySessionPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mirror"
        element={
          <ProtectedRoute>
            <Layout><MirrorPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={(user || isDemoMode) ? "/" : "/auth"} />} />
    </Routes>
  );
};


const App: React.FC = () => {
  return (
    // SessionProvider is the new top-level provider for authentication
    <SessionProvider>
      <AppContextProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppContextProvider>
    </SessionProvider>
  );
};

export default App;