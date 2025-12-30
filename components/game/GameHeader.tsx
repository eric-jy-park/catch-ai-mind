'use client';

import { AI_CHARACTERS, GAME_TEXT } from '@/lib/game/constants';
import type { AICharacter } from '@/types/game-state';
import { useEffect, useState } from 'react';
import { SketchBorder } from '@/components/ui/SketchBorder';

interface GameHeaderProps {
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  streamerScore: number;
  aiScore: number;
  selectedAI: AICharacter;
}

export function GameHeader({
  currentRound,
  totalRounds,
  timeRemaining,
  streamerScore,
  aiScore,
  selectedAI,
}: GameHeaderProps) {
  const text = GAME_TEXT.ko.game;
  const aiCharacter = AI_CHARACTERS[selectedAI];
  const [isLowTime, setIsLowTime] = useState(false);

  // Detect low time for visual warning
  useEffect(() => {
    setIsLowTime(timeRemaining <= 10 && timeRemaining > 0);
  }, [timeRemaining]);

  // Calculate time bar width
  const timeBarWidth = `${(timeRemaining / 60) * 100}%`;

  return (
    <SketchBorder
        color="#2B2B2B"
        strokeWidth={1}
        borderRadius={24}
        className="bg-white rounded-3xl"
        style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.08)' }}
    >
      <div className="p-6 relative z-10 grid grid-cols-3 gap-6 items-center">
        {/* Streamer Score */}
        <div className="text-center">
          <div className="text-sketch-gray text-sm font-hand mb-2">
            {text.yourScore}
          </div>
          <div className="text-5xl font-pen text-sketch-dark" style={{ transform: 'rotate(-1deg)' }}>
            {streamerScore}
          </div>
        </div>

        {/* Round & Timer */}
        <div className="text-center space-y-4">
          {/* Round Indicator */}
          <div className="text-2xl font-pen text-sketch-dark" style={{ transform: 'rotate(0.5deg)' }}>
            {text.roundOf} {currentRound} / {totalRounds}
          </div>

          {/* Timer */}
          <div className="space-y-2">
            <div
              className={`text-4xl font-pen transition-colors ${
                isLowTime ? 'text-sketch-red animate-pulse' : 'text-sketch-blue'
              }`}
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              {timeRemaining}초
            </div>

            {/* Time Bar - Hand-drawn style */}
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
              {/* Sketchy border overlay */}
              <svg
                className="absolute inset-0 pointer-events-none w-full h-full"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M3,10 L20,8 L40,11 L60,9 L80,12 L100,8 L120,11 L140,9 L160,12 L180,8 L197,10"
                  fill="none"
                  stroke="#2B2B2B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                <path
                  d="M3,10 L20,12 L40,9 L60,11 L80,8 L100,12 L120,9 L140,11 L160,8 L180,12 L197,10"
                  fill="none"
                  stroke="#2B2B2B"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.2"
                />
              </svg>

              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  isLowTime ? 'bg-sketch-red' : 'bg-sketch-blue'
                }`}
                style={{ width: timeBarWidth }}
              />
            </div>
          </div>
        </div>

        {/* AI Score */}
        <div className="text-center">
          <div className="text-sketch-gray text-sm font-hand mb-2">
            {text.aiScore}
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl font-pen text-sketch-dark" style={{ transform: 'rotate(1deg)' }}>
              {aiScore}
            </div>
            <div className="flex items-center gap-2">
              {/* Hand-drawn circle for AI color */}
              <svg className="w-8 h-8" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill={aiCharacter.color}
                  opacity="0.9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#2B2B2B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
              <span className="text-lg font-hand text-sketch-gray">
                {aiCharacter.koreanName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SketchBorder>
  );
}
