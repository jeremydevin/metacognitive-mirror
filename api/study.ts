
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '../lib/prisma';
import { Card as CardType } from '../types'; // Renamed to avoid conflict with Prisma's Card

// --- Metacognitive Spaced Repetition Logic ---
const MIN_EASE_FACTOR = 1.3;

function calculateSpacedRepetition(card: CardType, confidence: number, performance: number): Partial<CardType> {
  let { easeFactor, interval } = card;

  // Base SM-2 Calculation
  if (performance < 3) {
    interval = 1; 
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    easeFactor = easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));
    if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;
    
    if (interval <= 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Metacognitive Adjustments
  // Overconfident and wrong: Reset interval, penalize ease factor
  if (confidence >= 4 && performance === 0) {
    interval = 1;
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  }
  // Underconfident but correct: Reward with a slightly shorter interval increase
  if (confidence <= 2 && performance === 5) {
    interval = Math.round(interval * 1.2);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + Math.max(1, interval));

  return {
    easeFactor,
    interval,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}

const secret = process.env.NEXTAUTH_SECRET || 'your-super-secret-key-for-development';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req, secret });
  if (!token || !token.id) {
    return res.status(401).json({ message: 'You must be logged in.' });
  }
  const userId = token.id as string;

  if (req.method === 'GET') {
    const { deckId } = req.query;
    if (!deckId || typeof deckId !== 'string') {
        return res.status(400).json({ message: 'deckId is required.' });
    }
    const dueCards = await prisma.card.findMany({
        where: {
            deckId: deckId,
            deck: { userId: userId },
            nextReviewDate: { lte: new Date() }
        }
    });
    res.status(200).json(dueCards);
  } else if (req.method === 'POST') {
    const { cardId, confidence, performance } = req.body;
    
    const card = await prisma.card.findFirst({ 
      where: { 
        id: cardId,
        deck: {
            userId: userId
        }
      } 
    });
    if (!card) return res.status(404).json({ message: 'Card not found or you do not own it.' });
    
    // For type compatibility with calculateSpacedRepetition
    const cardInput: CardType = {
        ...card,
        id: card.id,
        deckId: card.deckId,
        question: card.question,
        answer: card.answer,
        interval: card.interval,
        easeFactor: card.easeFactor,
        nextReviewDate: card.nextReviewDate.toISOString(),
        lastConfidence: card.lastConfidence,
        lastPerformance: card.lastPerformance,
    };

    const updatedSrData = calculateSpacedRepetition(cardInput, confidence, performance);

    // Use a transaction to update the card and create a log entry
    await prisma.$transaction([
        prisma.card.update({
            where: { id: cardId },
            data: {
                ...updatedSrData,
                lastConfidence: confidence,
                lastPerformance: performance,
            }
        }),
        prisma.studyLog.create({
            data: {
                confidence,
                performance,
                userId,
                deckId: card.deckId,
                cardId: card.id
            }
        })
    ]);

    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}