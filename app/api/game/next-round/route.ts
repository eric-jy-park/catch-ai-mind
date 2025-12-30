import { NextRequest, NextResponse } from 'next/server';
import { WordManager } from '@/lib/word-bank/word-manager';
import { gameStore } from '@/lib/game/game-store';

export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
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

    // Get a new word (excluding used words)
    const wordEntry = WordManager.getRandomWord(
      session.difficulty as any,
      session.usedWordIds
    );

    if (!wordEntry) {
      return NextResponse.json(
        { error: 'No more words available' },
        { status: 500 }
      );
    }

    // Update session with new word
    session.currentWord = {
      word: wordEntry.word,
      category: wordEntry.category,
      difficulty: wordEntry.difficulty,
      synonyms: wordEntry.synonyms,
    };
    session.usedWordIds.add(wordEntry.id);

    // Return new word - client will handle state updates
    return NextResponse.json({
      word: wordEntry.word,
      category: wordEntry.category,
    });
  } catch (error) {
    console.error('Error starting next round:', error);
    return NextResponse.json(
      { error: 'Failed to start next round' },
      { status: 500 }
    );
  }
}
