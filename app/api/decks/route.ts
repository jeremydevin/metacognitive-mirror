// app/api/decks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth"; // Import your new auth config
import prisma from "@/lib/prisma"; // Adjust path as needed

// Helper to get session and throw error if not found
async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("You must be logged in.");
  }
  return userId;
}

// --- GET Method ---
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get("deckId");

    // Handle request for a single deck
    if (deckId) {
      const deck = await prisma.deck.findFirst({
          where: { id: deckId, userId },
          include: { _count: { select: { cards: true } } },
      });
      if (!deck) return NextResponse.json({ message: 'Deck not found' }, { status: 404 });
      const dueCount = await prisma.card.count({
          where: { deckId: deck.id, nextReviewDate: { lte: new Date() } },
      });
      return NextResponse.json({ ...deck, cardCount: deck._count.cards, dueCount });
    }

    // Handle request for all decks
    const decks = await prisma.deck.findMany({
      where: { userId },
      include: { _count: { select: { cards: true } } },
    });
    
    const decksWithCounts = await Promise.all(
      decks.map(async (deck) => {
        const dueCount = await prisma.card.count({
          where: { deckId: deck.id, nextReviewDate: { lte: new Date() } },
        });
        return { ...deck, cardCount: deck._count.cards, dueCount };
      })
    );
    return NextResponse.json(decksWithCounts);

  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Failed to fetch decks' }, { status: 500 });
  }
}

// --- POST Method ---
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { title, description } = await req.json();

    const newDeck = await prisma.deck.create({
      data: { title, description, userId },
    });
    return NextResponse.json({ ...newDeck, cardCount: 0, dueCount: 0 }, { status: 201 });
  } catch (error: any) {
     if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Failed to create deck' }, { status: 500 });
  }
}

// --- DELETE Method ---
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { deckId } = await req.json();
    if (!deckId) return NextResponse.json({ message: 'Deck ID is required' }, { status: 400 });

    await prisma.deck.delete({
        where: { id: deckId, userId },
    });
    return new NextResponse(null, { status: 204 }); // No content
  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Failed to delete deck' }, { status: 500 });
  }
}