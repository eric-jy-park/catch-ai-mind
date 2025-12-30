import { NextRequest, NextResponse } from 'next/server';
import { WordManager } from '@/lib/word-bank/word-manager';
import { gameStore } from '@/lib/game/game-store';
import type { WordDifficulty } from '@/types/game-state';

export async function POST(request: NextRequest) {
  try {
    const { roomId, difficulty = 'medium' } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get a random word
    const wordEntry = WordManager.getRandomWord(difficulty as WordDifficulty);

    if (!wordEntry) {
      return NextResponse.json(
        { error: 'No words available for this difficulty' },
        { status: 500 }
      );
    }

    // Store session data
    gameStore.createSession(roomId, {
      currentWord: {
        word: wordEntry.word,
        category: wordEntry.category,
        difficulty: wordEntry.difficulty,
        synonyms: wordEntry.synonyms,
      },
      usedWordIds: new Set([wordEntry.id]),
      difficulty: difficulty as WordDifficulty,
    });

    // Return word and category to the client
    return NextResponse.json({
      word: wordEntry.word,
      category: wordEntry.category,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
