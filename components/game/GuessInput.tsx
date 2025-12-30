'use client';

import { useState, useRef, useEffect } from 'react';
import { GAME_TEXT } from '@/lib/game/constants';
import type { GuessResult } from '@/types/game-state';
import { useSound } from '@/lib/audio/use-sound';
import { SketchBorder } from '@/components/ui/SketchBorder';

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  guessHistory: GuessResult[];
  disabled?: boolean;
  isDrawing?: boolean;
}

export function GuessInput({ onSubmit, guessHistory, disabled = false, isDrawing = false }: GuessInputProps) {
  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { play } = useSound();
  const text = GAME_TEXT.ko.game;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || disabled) return;

    play('click');
    onSubmit(guess.trim());
    setGuess('');

    // Refocus input for quick guessing
    inputRef.current?.focus();
  };

  // Auto-focus input when component mounts
  useEffect(() => {
    if (!disabled && !isDrawing) {
      inputRef.current?.focus();
    }
  }, [disabled, isDrawing]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-pen text-sketch-dark relative inline-block" style={{ transform: 'rotate(-0.5deg)' }}>
        {isDrawing ? '🎨 ' + text.youDraw : '🤔 ' + text.youGuess}

        {/* Scribble underline */}
        <svg
          className="absolute -bottom-1 left-0 w-full h-2"
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
        >
          <path
            d="M2,4 Q25,2 50,3 T98,5"
            fill="none"
            stroke="#5B8FF9"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </h3>

      {/* Guess Input Form */}
      {!isDrawing && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder={text.enterGuess}
              disabled={disabled}
              className="w-full px-4 py-3 text-lg font-hand border-2 border-sketch-gray rounded-2xl focus:border-sketch-blue focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              style={{
                boxShadow: guess.trim() ? '4px 4px 0 rgba(91,143,249,0.2)' : '3px 3px 0 rgba(0,0,0,0.05)',
                transform: 'rotate(-0.3deg)',
                borderColor: guess.trim() && !disabled ? '#5B8FF9' : undefined,
              }}
              maxLength={20}
              lang="ko"
              autoComplete="off"
            />
            {guess.trim() && !disabled && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(5deg)' }}>
                <svg className="w-6 h-6" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="#51CF66" opacity="0.2" />
                  <path
                    d="M35 50 L45 60 L65 40"
                    stroke="#51CF66"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!guess.trim() || disabled}
            className="relative w-full px-6 py-3 text-lg font-pen rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-sketch-blue text-white overflow-hidden"
            style={{
              border: '3px solid #2B2B2B',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
              transform: 'rotate(0.5deg)',
            }}
          >
            {/* Crayon texture overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(255,255,255,0.3) 2px,
                  rgba(255,255,255,0.3) 4px
                )`,
              }}
            />
            <span className="relative z-10">{text.submit}</span>
          </button>
        </form>
      )}

      {/* Drawing Indicator */}
      {isDrawing && (
        <SketchBorder
          color="#51CF66"
          strokeWidth={1.5}
          borderRadius={16}
          roughness={1}
          className="bg-sketch-green/10 rounded-2xl text-center"
          style={{ boxShadow: '3px 3px 0 rgba(81,207,102,0.1)' }}
        >
          <p className="p-4 relative z-10 text-sketch-dark font-hand">
            ✏️ 단어를 그려주세요!
          </p>
        </SketchBorder>
      )}

      {/* Guess History */}
      <div className="space-y-2">
        <h4 className="text-sm font-hand text-sketch-gray">추측 기록</h4>
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#828282 #FFF9E6',
        }}>
          {guessHistory.length === 0 ? (
            <p className="text-sm text-sketch-gray text-center py-4 font-hand">
              아직 추측이 없습니다
            </p>
          ) : (
            guessHistory.slice().reverse().map((result, index) => (
              <SketchBorder
                key={`${result.timestamp}-${index}`}
                color={result.isCorrect ? '#51CF66' : '#E0E0E0'}
                strokeWidth={result.isCorrect ? 1.5 : 1}
                borderRadius={16}
                roughness={0.8}
                className={`rounded-2xl transition-all ${
                  result.isCorrect
                    ? 'bg-sketch-green/10'
                    : 'bg-white'
                }`}
                style={{
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.05)',
                  transform: `rotate(${index % 2 === 0 ? -0.3 : 0.3}deg)`,
                }}
              >
                <div className="p-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {result.by === 'streamer' ? '🎮' : '🤖'}
                      </span>
                      <span className="font-hand text-sketch-dark">
                        {result.guess}
                      </span>
                    </div>
                    <span className="text-xl">
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                  {result.isCorrect && (
                    <div className="mt-1 text-sm text-sketch-green font-hand">
                      {text.correct} (+{result.pointsAwarded}점)
                    </div>
                  )}
                </div>
              </SketchBorder>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
