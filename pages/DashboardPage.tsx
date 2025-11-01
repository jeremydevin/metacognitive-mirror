
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Deck } from '../types';

const DeckCard: React.FC<{ deck: Deck }> = ({ deck }) => {
    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 flex flex-col justify-between hover:bg-slate-700 transition-colors">
            <div>
                <h3 className="text-xl font-bold text-white">{deck.title}</h3>
                <p className="text-slate-400 mt-2">{deck.description}</p>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center text-sm text-slate-300 mb-4">
                    <span>{deck.cardCount} cards</span>
                    <span className={`font-semibold ${deck.dueCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {deck.dueCount} due
                    </span>
                </div>
                <div className="flex space-x-2">
                    <Link to={`/study/${deck.id}`} className="flex-1 text-center bg-violet-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-violet-700 disabled:bg-violet-900 disabled:cursor-not-allowed transition-colors">
                        Study
                    </Link>
                    <Link to={`/deck/${deck.id}`} className="flex-1 text-center bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500 transition-colors">
                        Manage
                    </Link>
                </div>
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const { getDecks, addDeck, isDemoMode } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showDemoWarning, setShowDemoWarning] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  useEffect(() => {
    if (isDemoMode) {
      // Check if modal has been shown in this session
      const hasSeenWarning = sessionStorage.getItem('demo-warning-shown');
      if (!hasSeenWarning) {
        setShowDemoWarning(true);
      }
    }
  }, [isDemoMode]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const userDecks = await getDecks();
        setDecks(userDecks);
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle) return;
    try {
      const newDeck = await addDeck(newDeckTitle, newDeckDescription);
      setDecks(prev => [...prev, newDeck]);
      setShowModal(false);
      setNewDeckTitle('');
      setNewDeckDescription('');
    } catch (error: any) {
      alert(error.message || 'Failed to create deck');
    }
  };

  return (
    <div className="px-4">
      {showDemoWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md border-2 border-yellow-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Demo Mode Active</h3>
                <p className="text-slate-300 mb-4">
                  You're currently exploring the app with sample data. Any changes you make won't be saved. 
                  Create an account to save your decks and track your progress!
                </p>
                <button
                  onClick={() => {
                    sessionStorage.setItem('demo-warning-shown', 'true');
                    setShowDemoWarning(false);
                  }}
                  className="w-full bg-violet-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-violet-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">My Decks</h1>
          {isDemoMode && (
            <p className="text-yellow-400 text-sm mt-1">⚠️ Demo Mode - Data won't be saved</p>
          )}
        </div>
        <button 
          onClick={() => {
            if (isDemoMode) {
              alert('Cannot create decks in demo mode. Please create an account to save your decks.');
            } else {
              setShowModal(true);
            }
          }} 
          className="bg-violet-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-violet-700 transition-colors"
        >
          Create New Deck
        </button>
      </div>

      {loading ? (
        <p>Loading decks...</p>
      ) : decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-800 rounded-lg">
            <h3 className="text-xl text-white">No decks yet!</h3>
            <p className="text-slate-400 mt-2">Click "Create New Deck" to get started.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Create a New Deck</h2>
            <form onSubmit={handleCreateDeck}>
              <div className="mb-4">
                <label htmlFor="deck-title" className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  id="deck-title"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-violet-500 focus:border-violet-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="deck-desc" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  id="deck-desc"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-violet-500 focus:border-violet-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowModal(false)} className="bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500">
                  Cancel
                </button>
                <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-violet-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
