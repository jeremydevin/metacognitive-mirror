
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
  const { deckId } = req.query;

  try {
    const logs = await prisma.studyLog.findMany({
      where: {
        userId,
        ...(deckId && { deckId: deckId as string }),
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Failed to fetch study logs', error);
    res.status(500).json({ message: 'Failed to fetch study logs' });
  }
}