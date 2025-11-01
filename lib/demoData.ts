import { Deck, Card, StudyLog } from '../types';

// Demo deck - Cognitive Science
export const demoDeck: Deck = {
  id: 'demo-deck-1',
  title: 'Cognitive Science',
  description: 'Introduction to cognitive science concepts including memory, attention, and metacognition',
  userId: 'demo-user',
  cardCount: 8,
  dueCount: 3,
};

// Demo cards
export const demoCards: Card[] = [
  {
    id: 'demo-card-1',
    deckId: 'demo-deck-1',
    question: 'What is the difference between working memory and long-term memory?',
    answer: 'Working memory is a temporary storage system that holds a limited amount of information (about 7±2 items) for a short duration, while long-term memory is a relatively permanent storage system with unlimited capacity.',
    nextReviewDate: new Date().toISOString(), // Due today
    interval: 1,
    easeFactor: 2.5,
    lastConfidence: 4,
    lastPerformance: 5,
  },
  {
    id: 'demo-card-2',
    deckId: 'demo-deck-1',
    question: 'What is metacognition?',
    answer: 'Metacognition is the awareness and understanding of one\'s own thought processes. It involves thinking about thinking, including knowledge about cognitive tasks and strategies to regulate cognitive activities.',
    nextReviewDate: new Date().toISOString(), // Due today
    interval: 2,
    easeFactor: 2.7,
    lastConfidence: 3,
    lastPerformance: 3,
  },
  {
    id: 'demo-card-3',
    deckId: 'demo-deck-1',
    question: 'What is the spacing effect?',
    answer: 'The spacing effect refers to the finding that information is better remembered when study sessions are spaced out over time rather than massed together (cramming). This is the principle behind spaced repetition systems.',
    nextReviewDate: new Date(Date.now() - 86400000).toISOString(), // Due yesterday
    interval: 3,
    easeFactor: 2.3,
    lastConfidence: 5,
    lastPerformance: 5,
  },
  {
    id: 'demo-card-4',
    deckId: 'demo-deck-1',
    question: 'What is the Ebbinghaus forgetting curve?',
    answer: 'The Ebbinghaus forgetting curve describes the exponential decline of memory retention over time. Most forgetting happens shortly after learning, and retention levels off over time, which is why spaced repetition is effective.',
    nextReviewDate: new Date(Date.now() + 86400000 * 2).toISOString(), // Due in 2 days
    interval: 5,
    easeFactor: 2.8,
    lastConfidence: 4,
    lastPerformance: 5,
  },
  {
    id: 'demo-card-5',
    deckId: 'demo-deck-1',
    question: 'What is the difference between recognition and recall?',
    answer: 'Recognition is identifying previously learned information when it is presented again (e.g., multiple choice). Recall is retrieving information from memory without cues (e.g., fill-in-the-blank). Recall is generally harder but leads to better retention.',
    nextReviewDate: new Date(Date.now() + 86400000 * 4).toISOString(), // Due in 4 days
    interval: 7,
    easeFactor: 2.6,
    lastConfidence: 3,
    lastPerformance: 3,
  },
  {
    id: 'demo-card-6',
    deckId: 'demo-deck-1',
    question: 'What is cognitive load theory?',
    answer: 'Cognitive load theory suggests that working memory has limited capacity, and learning is more effective when instruction is designed to reduce unnecessary cognitive load, allowing more mental resources for learning.',
    nextReviewDate: new Date(Date.now() + 86400000 * 6).toISOString(), // Due in 6 days
    interval: 10,
    easeFactor: 2.5,
    lastConfidence: 4,
    lastPerformance: 5,
  },
  {
    id: 'demo-card-7',
    deckId: 'demo-deck-1',
    question: 'What is the testing effect?',
    answer: 'The testing effect (also called retrieval practice) refers to the finding that actively retrieving information from memory enhances long-term retention more than simply re-reading or re-studying the material.',
    nextReviewDate: new Date(Date.now() + 86400000 * 8).toISOString(), // Due in 8 days
    interval: 12,
    easeFactor: 2.7,
    lastConfidence: 5,
    lastPerformance: 5,
  },
  {
    id: 'demo-card-8',
    deckId: 'demo-deck-1',
    question: 'What is metacognitive monitoring?',
    answer: 'Metacognitive monitoring is the process of assessing and tracking one\'s own understanding and performance during learning. This includes judgments of learning (JOL) and confidence ratings, which can help optimize study strategies.',
    nextReviewDate: new Date(Date.now() + 86400000 * 10).toISOString(), // Due in 10 days
    interval: 15,
    easeFactor: 2.9,
    lastConfidence: 4,
    lastPerformance: 5,
  },
];

// Generate demo study logs for the past week
function generateDemoLogs(): StudyLog[] {
  const logs: StudyLog[] = [];
  const now = new Date();
  
  // Generate logs for the past 7 days
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(10 + Math.floor(Math.random() * 8)); // Random hour between 10 AM and 6 PM
    
    // Study 2-4 cards per day
    const cardsPerDay = 2 + Math.floor(Math.random() * 3);
    const shuffledCards = [...demoCards].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < cardsPerDay && i < shuffledCards.length; i++) {
      const card = shuffledCards[i];
      // Simulate realistic confidence and performance patterns
      const confidence = 2 + Math.floor(Math.random() * 4); // 2-5
      const performance = confidence === 5 ? 5 : (confidence >= 4 ? 3 : 0); // Higher confidence = better performance generally
      
      logs.push({
        id: `demo-log-${dayOffset}-${i}`,
        userId: 'demo-user',
        deckId: 'demo-deck-1',
        cardId: card.id,
        timestamp: date.toISOString(),
        confidence,
        performance,
      });
    }
  }
  
  return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export const demoStudyLogs: StudyLog[] = generateDemoLogs();
