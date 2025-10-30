
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useApp } from './contexts/AppContext';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DeckDetailPage from './pages/DeckDetailPage';
import StudySessionPage from './pages/StudySessionPage';
import MirrorPage from './pages/MirrorPage';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useApp();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
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
      <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
    </Routes>
  );
};


const App: React.FC = () => {
  return (
    <AppContextProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppContextProvider>
  );
};

export default App;
