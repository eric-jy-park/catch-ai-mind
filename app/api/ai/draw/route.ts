import { NextRequest, NextResponse } from 'next/server';
import { generateDrawing } from '@/lib/ai/openrouter';
import { DrawingOrchestrator } from '@/lib/ai/orchestrator';
import { AI_CHARACTERS } from '@/lib/game/constants';
import type { AICharacter } from '@/types/game-state';

export async function POST(request: NextRequest) {
  try {
    const { roomId, word, category, character, existingElements = [] } = await request.json();

    if (!roomId || !word || !character) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const aiPersonality = AI_CHARACTERS[character as AICharacter];
    if (!aiPersonality) {
      return NextResponse.json(
        { error: 'Invalid AI character' },
        { status: 400 }
      );
    }

    console.log(`[API/DRAW] Incremental draw: ${existingElements.length} existing elements`);
    
    const elements = await generateDrawing({
      word,
      category: category || '',
      character: character as AICharacter,
      personality: aiPersonality.personality,
      drawingStyle: aiPersonality.drawingStyle,
    });
    
    console.log(`[API/DRAW] Generated ${elements.length} new elements`);

    if (elements.length === 0) {
      return NextResponse.json({ elements: [], done: true });
    }

    const orchestrator = new DrawingOrchestrator(
      character as AICharacter,
      elements
    );

    const steps = orchestrator.getSteps();
    
    return NextResponse.json({
      elements: steps[0]?.elements || elements,
      done: false,
    });
  } catch (error) {
    console.error('Error generating AI drawing:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI drawing' },
      { status: 500 }
    );
  }
}
