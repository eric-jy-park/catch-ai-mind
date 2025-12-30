'use client';

import { GAME_TEXT } from '@/lib/game/constants';
import { SketchBorder } from '@/components/ui/SketchBorder';

interface TargetWordProps {
  word: string;
  category?: string;
}

export function TargetWord({ word, category }: TargetWordProps) {
  const text = GAME_TEXT.ko.game;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-pen text-sketch-dark relative inline-block" style={{ transform: 'rotate(-0.5deg)' }}>
        ✏️ {text.targetWord}

        {/* Scribble underline */}
        <svg
          className="absolute -bottom-1 left-0 w-full h-2"
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
        >
          <path
            d="M2,4 L15,2 L25,5 L45,3 L55,4 L75,2 L85,5 L98,3"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </h3>

      <SketchBorder
        color="#5B8FF9"
        strokeWidth={1.5}
        borderRadius={16}
        className="bg-sketch-blue/10 rounded-2xl text-center"
        style={{ boxShadow: '4px 4px 0 rgba(91,143,249,0.1)' }}
      >
        <div className="p-6 relative z-10">
          <div className="text-4xl font-pen text-sketch-dark mb-2" style={{ transform: 'rotate(-1deg)' }}>
            {word}
          </div>
          {category && (
            <div className="text-sm text-sketch-gray font-hand">
              카테고리: {category}
            </div>
          )}
        </div>
      </SketchBorder>

      <SketchBorder
        color="#FFD93D"
        strokeWidth={1.5}
        borderRadius={16}
        className="bg-yellow-50 rounded-2xl"
        style={{ boxShadow: '3px 3px 0 rgba(255,217,61,0.1)' }}
      >
        <p className="p-4 relative z-10 text-sm text-yellow-800 font-hand" style={{ transform: 'rotate(0.3deg)' }}>
          💡 이 단어를 그림으로 표현하세요!
        </p>
      </SketchBorder>
    </div>
  );
}
