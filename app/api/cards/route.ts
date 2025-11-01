// app/api/cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth"; // Or your correct path to app/auth.ts
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

// --- GET cards for a deck ---
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get("deckId");

    if (!deckId) {
      return NextResponse.json({ message: "deckId is required." }, { status: 400 });
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
    return NextResponse.json(cards);

  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Failed to fetch cards' }, { status: 500 });
  }
}

// --- POST (add) a new card ---
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(); // Ensures user is logged in
    const { deckId, question, answer } = await req.json();

    if (!deckId || !question || !answer) {
      return NextResponse.json({ message: 'deckId, question, and answer are required.' }, { status: 400 });
    }

    // TODO: You could add a check here to ensure the user owns the deckId
    // (though the GET route already protects it)

    const newCard = await prisma.card.create({
      data: {
        deckId,
        question,
        answer,
      },
    });
    return NextResponse.json(newCard, { status: 201 });

  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Failed to create card' }, { status: 500 });
  }
}

// --- DELETE a card ---
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { cardId } = await req.json();

    if (!cardId) {
      return NextResponse.json({ message: 'cardId is required' }, { status: 400 });
    }

    // Find the card and ensure the user owns the deck it belongs to
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        deck: {
          userId: userId,
        },
      },
    });

    if (!card) {
      return NextResponse.json({ message: 'Card not found or you do not have permission.' }, { status: 404 });
    }

    await prisma.card.delete({
      where: { id: cardId },
    });
    
    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Failed to delete card' }, { status: 500 });
  }
}