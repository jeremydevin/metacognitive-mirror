// app/api/study/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";
import type { Card as CardType } from "@/types"; 

// --- Metacognitive Spaced Repetition Logic ---
const MIN_EASE_FACTOR = 1.3;
function calculateSpacedRepetition(card: CardType, confidence: number, performance: number): Partial<CardType> {
  let { easeFactor, interval } = card;
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
  if (confidence >= 4 && performance === 0) {
    interval = 1;
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  }
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
// --- End of Spaced Repetition Logic ---

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("You must be logged in.");
  }
  return userId;
}

// --- GET due cards ---
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get("deckId");

    if (!deckId) {
      return NextResponse.json({ message: 'deckId is required.' }, { status: 400 });
    }

    const dueCards = await prisma.card.findMany({
      where: {
        deckId: deckId,
        deck: { userId: userId },
        nextReviewDate: { lte: new Date() }
      }
    });
    return NextResponse.json(dueCards);

  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Failed to fetch due cards' }, { status: 500 });
  }
}

// --- POST (submit) a study result ---
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { cardId, confidence, performance } = await req.json();

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        deck: {
          userId: userId
        }
      }
    });

    if (!card) {
      return NextResponse.json({ message: 'Card not found or you do not own it.' }, { status: 404 });
    }
    
    // Type assertion to match your original logic
    const cardInput: CardType = {
        ...card,
        nextReviewDate: card.nextReviewDate.toISOString(),
        // Add any other fields from CardType that might be missing from Prisma's model
        // (though your Prisma schema should match CardType)
    };

    const updatedSrData = calculateSpacedRepetition(cardInput, confidence, performance);

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

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error("Study POST Error:", error);
    return NextResponse.json({ message: 'Failed to update card' }, { status: 500 });
  }
}