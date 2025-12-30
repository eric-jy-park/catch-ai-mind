import { NextRequest, NextResponse } from 'next/server';
import { generateGuess } from '@/lib/ai/openrouter';
import { AI_CHARACTERS } from '@/lib/game/constants';
import type { AICharacter } from '@/types/game-state';

export async function POST(request: NextRequest) {
  console.log('[API/GUESS] Request received');

  try {
    const { character, category, previousGuesses = [], elements = [] } = await request.json();

    if (!character) {
      return NextResponse.json(
        { error: 'Character is required' },
        { status: 400 }
      );
    }

    // Get AI character personality
    const aiPersonality = AI_CHARACTERS[character as AICharacter];
    if (!aiPersonality) {
      return NextResponse.json(
        { error: 'Invalid AI character' },
        { status: 400 }
      );
    }

    // Add some delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, aiPersonality.thinkingSpeed));

    // Apply error rate - AI might make mistakes
    const shouldMakeMistake = Math.random() < aiPersonality.errorRate;

    let guess: string;

    if (shouldMakeMistake) {
      guess = await generateGuess({
        character: character as AICharacter,
        personality: aiPersonality.personality,
        guessingBehavior: 'random',
        category,
        previousGuesses,
        elements,
      });
    } else {
      guess = await generateGuess({
        character: character as AICharacter,
        personality: aiPersonality.personality,
        guessingBehavior: aiPersonality.guessingBehavior,
        category,
        previousGuesses,
        elements,
      });
    }

    console.log('[API/GUESS] Returning guess:', guess);

    return NextResponse.json({
      guess,
      thinkingTime: aiPersonality.thinkingSpeed,
    });
  } catch (error) {
    console.error('[API/GUESS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI guess' },
      { status: 500 }
    );
  }
}
