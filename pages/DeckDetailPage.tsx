import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Deck, Card } from '../types';

const DeckDetailPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { getDeck, getCards, addCard, deleteDeck, deleteCard } = useApp();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const [showConfirmDelete, setShowConfirmDelete] = useState<{ type: 'deck' | 'card'; id: string } | null>(null);

  const fetchDeckData = useCallback(async () => {
    if (!deckId) return;
    try {
      setLoading(true);
      const [deckData, cardsData] = await Promise.all([
        getDeck(deckId),
        getCards(deckId)
      ]);
      setDeck(deckData);
      setCards(cardsData);
    } catch (error) {
      console.error("Failed to fetch deck data:", error);
    } finally {
      setLoading(false);
    }
  }, [deckId, getDeck, getCards]);

  useEffect(() => {
    fetchDeckData();
  }, [fetchDeckData]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId || !newQuestion.trim() || !newAnswer.trim()) return;

    try {
      await addCard(deckId, newQuestion, newAnswer);
      setNewQuestion('');
      setNewAnswer('');
      fetchDeckData(); // Refresh card list
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const handleDelete = async () => {
    if (!showConfirmDelete || !deckId) return;

    try {
      if (showConfirmDelete.type === 'deck') {
        await deleteDeck(deckId);
        navigate('/');
      } else if (showConfirmDelete.type === 'card') {
        await deleteCard(showConfirmDelete.id);
        fetchDeckData(); // Refresh card list
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setShowConfirmDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading deck details...</div>;
  }

  if (!deck) {
    return <div className="text-center p-8 text-red-400">Deck not found.</div>;
  }

  return (
    <div className="px-4">
      <div className="mb-4">
        <Link to="/" className="text-violet-400 hover:text-violet-300 inline-block">&larr; Back to Decks</Link>
      </div>

      <h1 className="text-3xl font-bold text-white">{deck.title}</h1>
      <p className="text-slate-400 mt-1 mb-6">{deck.description}</p>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Add New Card</h2>
        <form onSubmit={handleAddCard} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-slate-300 mb-1">Question</label>
            <textarea
              id="question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-violet-500 focus:border-violet-500"
              rows={2}
              required
            />
          </div>
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-slate-300 mb-1">Answer</label>
            <textarea
              id="answer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-violet-500 focus:border-violet-500"
              rows={3}
              required
            />
          </div>
          <div className="text-right">
            <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-violet-700">
              Add Card
            </button>
          </div>
        </form>
      </div>
      
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Cards in this Deck ({cards.length})</h2>
        <div className="space-y-4">
          {cards.length > 0 ? (
            cards.map(card => (
              <div key={card.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-start">
                <div>
                    <p className="font-semibold text-white pr-4">{card.question}</p>
                    <p className="text-slate-400 mt-2 pr-4">{card.answer}</p>
                </div>
                <button 
                  onClick={() => setShowConfirmDelete({ type: 'card', id: card.id })}
                  className="text-slate-400 hover:text-red-500 ml-2 p-1 rounded-full flex-shrink-0"
                  aria-label="Delete card"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No cards in this deck yet. Add one above!</p>
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
        <p className="text-slate-400 text-sm mt-1 mb-4">Deleting a deck is permanent and cannot be undone.</p>
        <button
            onClick={() => setShowConfirmDelete({ type: 'deck', id: deckId! })}
            className="bg-transparent border border-red-500/60 text-red-400 px-4 py-2 rounded-md font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
        >
            Delete This Deck
        </button>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Are you sure?</h2>
            <p className="text-slate-300 mb-6">
              {showConfirmDelete.type === 'deck'
                ? 'This will permanently delete the deck and all its cards. This action cannot be undone.'
                : 'This will permanently delete this card. This action cannot be undone.'}
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowConfirmDelete(null)} className="bg-slate-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-slate-500">
                Cancel
              </button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckDetailPage;