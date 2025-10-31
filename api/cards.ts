
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
    if (!deckId || typeof deckId !== 'string') {
      return res.status(400).json({ message: 'deckId is required.' });
    }
    const cards = await prisma.card.findMany({
      where: {
        deckId: deckId,
        deck: {
          userId: userId, // Ensure user owns the deck
        },
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
    res.status(200).json(cards);
  } else if (req.method === 'POST') {
    const { deckId, question, answer } = req.body;
     if (!deckId || !question || !answer) {
      return res.status(400).json({ message: 'deckId, question, and answer are required.' });
    }
    // TODO: Verify user owns the deck before creating a card
    const newCard = await prisma.card.create({
      data: {
        deckId,
        question,
        answer,
      },
    });
    res.status(201).json(newCard);
  } else if (req.method === 'DELETE') {
    const { cardId } = req.body;
    if (!cardId) {
        return res.status(400).json({ message: 'cardId is required' });
    }
    // Ensure the user owns the card they are trying to delete
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        deck: {
          userId: userId,
        },
      },
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found or you do not have permission to delete it.' });
    }

    await prisma.card.delete({
        where: { id: cardId },
    });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}