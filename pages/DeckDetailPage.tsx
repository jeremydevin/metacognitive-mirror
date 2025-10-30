
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Deck, Card } from '../types';

const DeckDetailPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { getDeck, getCards, addCard } = useApp();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

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

  if (loading) {
    return <div className="text-center p-8">Loading deck details...</div>;
  }

  if (!deck) {
    return <div className="text-center p-8 text-red-400">Deck not found.</div>;
  }

  return (
    <div className="px-4">
      <Link to="/" className="text-violet-400 hover:text-violet-300 mb-4 inline-block">&larr; Back to Decks</Link>
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
      
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Cards in this Deck ({cards.length})</h2>
        <div className="space-y-4">
          {cards.length > 0 ? (
            cards.map(card => (
              <div key={card.id} className="bg-slate-800 p-4 rounded-lg">
                <p className="font-semibold text-white">{card.question}</p>
                <p className="text-slate-400 mt-2">{card.answer}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No cards in this deck yet. Add one above!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckDetailPage;
