
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Card } from '../types';

// Helper components defined outside the main component to prevent re-creation on re-renders
const ConfidenceSlider: React.FC<{ confidence: number; onConfidenceChange: (value: number) => void; }> = ({ confidence, onConfidenceChange }) => {
    const confidenceLevels = [1, 2, 3, 4, 5];
    return (
        <div className="my-6">
            <label className="block text-center text-sm font-medium text-slate-300 mb-3">How confident are you?</label>
            <div className="flex justify-center space-x-2 sm:space-x-4">
                {confidenceLevels.map(level => (
                    <button
                        key={level}
                        onClick={() => onConfidenceChange(level)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 ease-in-out transform hover:scale-110 ${
                            confidence === level
                                ? 'bg-violet-600 text-white ring-2 ring-offset-2 ring-offset-slate-800 ring-violet-500'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>
    );
};

const SelfGradeButtons: React.FC<{ onGrade: (performance: number) => void; }> = ({ onGrade }) => {
    const buttons = [
        { label: "I Didn't Know", value: 0, color: 'bg-red-600 hover:bg-red-700' },
        { label: 'I Was Close', value: 3, color: 'bg-yellow-500 hover:bg-yellow-600' },
        { label: 'I Knew It', value: 5, color: 'bg-green-600 hover:bg-green-700' },
    ];
    return (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {buttons.map(btn => (
                <button
                    key={btn.value}
                    onClick={() => onGrade(btn.value)}
                    className={`text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${btn.color}`}
                >
                    {btn.label}
                </button>
            ))}
        </div>
    );
};


const StudySessionPage: React.FC = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const { getDueCards, updateCardAfterStudy } = useApp();

    const [cards, setCards] = useState<Card[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [confidence, setConfidence] = useState(3);
    const [loading, setLoading] = useState(true);
    const [sessionFinished, setSessionFinished] = useState(false);

    useEffect(() => {
        const fetchCards = async () => {
            if (!deckId) return;
            try {
                setLoading(true);
                const dueCards = await getDueCards(deckId);
                // Shuffle cards for better learning
                setCards(dueCards.sort(() => Math.random() - 0.5));
                if (dueCards.length === 0) {
                    setSessionFinished(true);
                }
            } catch (error) {
                console.error("Failed to fetch due cards:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deckId]);

    const handleReveal = () => {
        setIsRevealed(true);
    };

    const handleGrade = async (performance: number) => {
        const currentCard = cards[currentIndex];
        if (!currentCard) return;

        await updateCardAfterStudy(currentCard.id, confidence, performance);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsRevealed(false);
            setConfidence(3);
        } else {
            setSessionFinished(true);
        }
    };

    if (loading) {
        return <div className="text-center p-8">Preparing study session...</div>;
    }
    
    if (sessionFinished) {
        return (
            <div className="text-center p-8 bg-slate-800 rounded-lg max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-green-400 mb-4">Session Complete!</h2>
                <p className="text-slate-300 mb-6">You've reviewed all due cards for this deck. Great job!</p>
                <button onClick={() => navigate('/')} className="bg-violet-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-violet-700">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    const currentCard = cards[currentIndex];
    const progress = ((currentIndex) / cards.length) * 100;

    return (
        <div className="px-4 max-w-2xl mx-auto">
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
                <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-center text-slate-400 mb-6">{currentIndex + 1} of {cards.length}</p>

            <div className="bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 min-h-[450px] flex flex-col justify-between">
                <div>
                    <p className="text-sm font-semibold text-violet-400 mb-2">QUESTION</p>
                    <p className="text-2xl md:text-3xl text-white font-medium">{currentCard?.question}</p>
                </div>

                {isRevealed ? (
                    <div className="mt-6 animate-fade-in">
                        <div className="border-t border-slate-700 my-4"></div>
                        <p className="text-sm font-semibold text-green-400 mb-2">ANSWER</p>
                        <p className="text-xl text-slate-200 whitespace-pre-wrap">{currentCard?.answer}</p>
                        <SelfGradeButtons onGrade={handleGrade} />
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <ConfidenceSlider confidence={confidence} onConfidenceChange={setConfidence} />
                        <button
                            onClick={handleReveal}
                            className="w-full bg-violet-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-violet-700 transition-colors"
                        >
                            Reveal Answer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudySessionPage;
