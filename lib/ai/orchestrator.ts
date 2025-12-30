import type { ExcalidrawElement } from '@/types/excalidraw';
import type { AICharacter } from '@/types/game-state';
import { AI_CHARACTERS } from '@/lib/game/constants';

export interface DrawingStep {
  elements: ExcalidrawElement[];
  delay: number; // milliseconds until next step
}

/**
 * Progressive drawing orchestrator
 * Breaks down AI drawing into realistic steps over time
 */
export class DrawingOrchestrator {
  private character: AICharacter;
  private thinkingSpeed: number;
  private elements: any[];
  private steps: DrawingStep[];

  constructor(character: AICharacter, elements: any[]) {
    this.character = character;
    this.thinkingSpeed = AI_CHARACTERS[character].thinkingSpeed;
    this.elements = elements;
    this.steps = this.createDrawingSteps();
  }

  private createDrawingSteps(): DrawingStep[] {
    const steps: DrawingStep[] = [];
    const totalElements = this.elements.length;

    if (totalElements === 0) {
      return steps;
    }

    const maxElements = Math.min(totalElements, 20);
    const effectiveElements = this.elements.slice(0, maxElements);

    const groupSize = this.getGroupSize();
    const elementsPerStep = Math.ceil(effectiveElements.length / groupSize);

    for (let i = 0; i < effectiveElements.length; i += elementsPerStep) {
      const stepElements = effectiveElements.slice(0, i + elementsPerStep);

      const baseDelay = Math.min(this.thinkingSpeed, 400);
      const variation = Math.random() * 150 - 75;
      const delay = Math.max(100, baseDelay + variation);

      steps.push({
        elements: this.convertToExcalidrawElements(stepElements),
        delay,
      });
    }

    return steps;
  }

  /**
   * Determine how many drawing steps based on character
   */
  private getGroupSize(): number {
    const style = AI_CHARACTERS[this.character].drawingStyle;

    switch (style) {
      case 'precise':
        return 6; // Many small steps, methodical
      case 'rough':
        return 4; // Medium steps, quick sketches
      case 'artistic':
        return 5; // Varied pacing
      case 'minimalist':
        return 3; // Few large steps
      case 'chaotic':
        return 8; // Many rapid steps
      default:
        return 4;
    }
  }

  /**
   * Convert AI-generated elements to proper Excalidraw format
   */
  private convertToExcalidrawElements(elements: any[]): ExcalidrawElement[] {
    const safeElements = elements.filter(el => el.type !== 'text');
    const limitedElements = safeElements.slice(0, 15);

    return limitedElements.map((el, index) => {
      const id = `ai-${this.character}-${Date.now()}-${index}`;

      const baseElement = {
        id,
        type: el.type || 'line',
        x: el.x || 0,
        y: el.y || 0,
        width: el.width || 100,
        height: el.height || 100,
        angle: 0,
        strokeColor: el.strokeColor || '#000000',
        backgroundColor: el.backgroundColor || 'transparent',
        fillStyle: 'solid' as const,
        strokeWidth: el.strokeWidth || 2,
        strokeStyle: 'solid' as const,
        roughness: el.roughness || 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: Math.floor(Math.random() * 1000000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
      };

      if (el.type === 'line' || el.type === 'draw') {
        return {
          ...baseElement,
          type: 'line' as const,
          points: el.points || [[0, 0], [el.width || 100, el.height || 100]],
          lastCommittedPoint: null,
          startBinding: null,
          endBinding: null,
          startArrowhead: null,
          endArrowhead: null,
        };
      }

      if (el.type === 'arrow') {
        return {
          ...baseElement,
          type: 'arrow' as const,
          points: el.points || [[0, 0], [el.width || 100, el.height || 100]],
          lastCommittedPoint: null,
          startBinding: null,
          endBinding: null,
          startArrowhead: null,
          endArrowhead: 'arrow' as const,
        };
      }

      if (el.type === 'text') {
        console.warn('[Orchestrator] Skipping text element:', el.text);
        return null;
      }

      return {
        ...baseElement,
        type: (el.type || 'rectangle') as 'rectangle' | 'ellipse',
      };
    }) as ExcalidrawElement[];
  }

  /**
   * Get all drawing steps
   */
  public getSteps(): DrawingStep[] {
    return this.steps;
  }

  /**
   * Get total estimated drawing time
   */
  public getTotalTime(): number {
    return this.steps.reduce((sum, step) => sum + step.delay, 0);
  }
}
