
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { StudyLog, Deck } from '../types';
import MetacognitiveChart from '../components/MetacognitiveChart';

const MirrorPage: React.FC = () => {
    const { getStudyLogs, getDecks } = useApp();
    const [logs, setLogs] = useState<StudyLog[]>([]);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [userDecks, studyLogs] = await Promise.all([
                    getDecks(),
                    getStudyLogs(selectedDeck === 'all' ? undefined : selectedDeck)
                ]);
                setDecks(userDecks);
                setLogs(studyLogs);
            } catch (error) {
                console.error("Failed to fetch mirror data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDeck]);

    const processChartData = (logs: StudyLog[]) => {
        if (logs.length === 0) return [];
        
        // Group by day
        const groupedByDay: { [key: string]: { confidence: number[], performance: number[] } } = {};
        logs.forEach(log => {
            const day = new Date(log.timestamp).toLocaleDateString();
            if (!groupedByDay[day]) {
                groupedByDay[day] = { confidence: [], performance: [] };
            }
            groupedByDay[day].confidence.push(log.confidence);
            groupedByDay[day].performance.push(log.performance);
        });

        return Object.keys(groupedByDay).map(day => {
            const confidences = groupedByDay[day].confidence;
            const performances = groupedByDay[day].performance;
            const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
            const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length;
            return {
                name: day,
                confidence: parseFloat(avgConfidence.toFixed(2)),
                performance: parseFloat(avgPerformance.toFixed(2))
            };
        });
    };
    
    const chartData = processChartData(logs);

    return (
        <div className="px-4">
            <h1 className="text-3xl font-bold text-white">Metacognitive Mirror</h1>
            <p className="text-slate-400 mt-1 mb-6">Analyze your self-awareness. Are you as competent as you think?</p>

            <div className="mb-6 max-w-xs">
                <label htmlFor="deck-filter" className="block text-sm font-medium text-slate-300 mb-1">Filter by Deck</label>
                <select 
                    id="deck-filter"
                    value={selectedDeck}
                    onChange={(e) => setSelectedDeck(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-violet-500 focus:border-violet-500"
                >
                    <option value="all">All Decks</option>
                    {decks.map(deck => (
                        <option key={deck.id} value={deck.id}>{deck.title}</option>
                    ))}
                </select>
            </div>
            
            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                {loading ? (
                    <div className="text-center py-20">Loading chart data...</div>
                ) : chartData.length > 0 ? (
                    <MetacognitiveChart data={chartData} />
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl text-white">Not enough data yet.</h3>
                        <p className="text-slate-400 mt-2">Complete a study session to see your metacognitive mirror.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MirrorPage;
