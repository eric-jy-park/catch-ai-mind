import { NextRequest, NextResponse } from 'next/server';
import { KoreanMatcher } from '@/lib/matching/korean-matcher';
import { gameStore } from '@/lib/game/game-store';

export async function POST(request: NextRequest) {
  try {
    const { roomId, guess } = await request.json();

    if (!roomId || !guess) {
      return NextResponse.json(
        { error: 'Room ID and guess are required' },
        { status: 400 }
      );
    }

    // Get session data
    const session = gameStore.getSession(roomId);
    if (!session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    // Check guess using Korean matcher
    const matchResult = KoreanMatcher.match(guess, {
      id: 'current',
      word: session.currentWord.word,
      synonyms: session.currentWord.synonyms,
      category: session.currentWord.category,
      difficulty: session.currentWord.difficulty as any,
    });

    // Calculate points (more points for faster guesses, exact matches, etc.)
    const pointsAwarded = matchResult.isMatch ? Math.ceil(100 * matchResult.confidence) : 0;

    // Return validation result - client will handle state updates
    return NextResponse.json({
      isCorrect: matchResult.isMatch,
      confidence: matchResult.confidence,
      pointsAwarded,
      matchType: matchResult.matchType,
    });
  } catch (error) {
    console.error('Error processing guess:', error);
    return NextResponse.json(
      { error: 'Failed to process guess' },
      { status: 500 }
    );
  }
}
