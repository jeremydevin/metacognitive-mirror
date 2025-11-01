// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("You must be logged in.");
  }
  return userId;
}

// --- GET study logs ---
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get("deckId");

    const logs = await prisma.studyLog.findMany({
      where: {
        userId,
        ...(deckId && { deckId: deckId as string }),
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
    return NextResponse.json(logs);

  } catch (error: any) {
    if (error.message === "You must be logged in.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error('Failed to fetch study logs', error);
    return NextResponse.json({ message: 'Failed to fetch study logs' }, { status: 500 });
  }
}