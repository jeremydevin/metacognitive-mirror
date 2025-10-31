
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '../lib/prisma';

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

    try {
      // Handle request for a single deck
      if (deckId && typeof deckId === 'string') {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId },
            include: {
                _count: {
                    select: { cards: true },
                },
            },
        });

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        
        const dueCount = await prisma.card.count({
            where: { deckId: deck.id, nextReviewDate: { lte: new Date() } },
        });

        const deckWithCounts = {
            id: deck.id,
            title: deck.title,
            description: deck.description,
            userId: deck.userId,
            cardCount: deck._count.cards,
            dueCount: dueCount,
        };
        return res.status(200).json(deckWithCounts);
      }

      // Handle request for all decks
      const decks = await prisma.deck.findMany({
        where: { userId },
        include: {
          _count: {
            select: { cards: true },
          },
        },
      });

      const now = new Date();
      const decksWithCounts = await Promise.all(
        decks.map(async (deck) => {
          const dueCount = await prisma.card.count({
            where: {
              deckId: deck.id,
              nextReviewDate: {
                lte: now,
              },
            },
          });
          return {
            id: deck.id,
            title: deck.title,
            description: deck.description,
            userId: deck.userId,
            cardCount: deck._count.cards,
            dueCount: dueCount,
          };
        })
      );

      res.status(200).json(decksWithCounts);
    } catch (error) {
      console.error('Error fetching decks:', error);
      res.status(500).json({ message: 'Failed to fetch decks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description } = req.body;
      const newDeck = await prisma.deck.create({
        data: {
          title,
          description,
          userId,
        },
      });
      res.status(201).json({ ...newDeck, cardCount: 0, dueCount: 0 });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create deck' });
    }
  } else if (req.method === 'DELETE') {
    try {
        const { deckId } = req.body;
        if (!deckId) return res.status(400).json({ message: 'Deck ID is required' });

        await prisma.deck.delete({
            where: { id: deckId, userId }, // ensures user can only delete their own deck
        });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete deck' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}