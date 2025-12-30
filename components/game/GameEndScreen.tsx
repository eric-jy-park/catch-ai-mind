'use client';

import { useRouter } from 'next/navigation';
import { AI_CHARACTERS, GAME_TEXT } from '@/lib/game/constants';
import type { AICharacter } from '@/types/game-state';
import { useSound } from '@/lib/audio/use-sound';
import { AdBanner } from '../ui/AdBanner';
import { SketchBorder } from '../ui/SketchBorder';
import { PaperTexture } from '../ui/PaperTexture';

interface GameEndScreenProps {
  streamerScore: number;
  aiScore: number;
  selectedAI: AICharacter;
}

export function GameEndScreen({ streamerScore, aiScore, selectedAI }: GameEndScreenProps) {
  const router = useRouter();
  const { play } = useSound();
  const text = GAME_TEXT.ko.game;
  const aiCharacter = AI_CHARACTERS[selectedAI];

  const streamerWins = streamerScore > aiScore;
  const tie = streamerScore === aiScore;

  const handlePlayAgain = () => {
    play('click');
    router.push('/select');
  };

  const handleNewCharacter = () => {
    play('click');
    router.push('/select');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <PaperTexture />
      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-pen text-sketch-dark mb-4" style={{ transform: 'rotate(-1deg)' }}>
            {text.gameOver}
          </h1>

          {tie ? (
            <div className="text-4xl font-pen text-sketch-blue" style={{ transform: 'rotate(0.5deg)' }}>
              무승부!
            </div>
          ) : (
            <div className="text-4xl font-pen text-sketch-dark" style={{ transform: 'rotate(0.5deg)' }}>
              {text.winner}: {streamerWins ? '🎮 당신' : `🤖 ${aiCharacter.koreanName}`}
            </div>
          )}
        </div>

        <SketchBorder
          color="#2B2B2B"
          strokeWidth={2}
          borderRadius={20}
          roughness={1.2}
          className="bg-white rounded-3xl mb-8"
          style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="p-8">
            <h2 className="text-2xl font-pen text-sketch-dark mb-6 text-center" style={{ transform: 'rotate(-0.5deg)' }}>
              최종 점수
            </h2>

            <div className="grid grid-cols-2 gap-8">
              <SketchBorder
                color={streamerWins ? '#51CF66' : '#828282'}
                strokeWidth={streamerWins ? 2 : 1}
                borderRadius={16}
                roughness={1}
                className={`rounded-2xl ${streamerWins ? 'bg-sketch-green/10' : 'bg-gray-50'}`}
              >
                <div className="text-center p-6">
                  <div className="text-lg font-hand text-sketch-gray mb-2">당신</div>
                  <div className="text-6xl font-pen text-sketch-dark" style={{ transform: 'rotate(-1deg)' }}>
                    {streamerScore}
                  </div>
                  {streamerWins && <div className="text-2xl mt-2">🏆</div>}
                </div>
              </SketchBorder>

              <SketchBorder
                color={!streamerWins && !tie ? '#51CF66' : '#828282'}
                strokeWidth={!streamerWins && !tie ? 2 : 1}
                borderRadius={16}
                roughness={1}
                className={`rounded-2xl ${!streamerWins && !tie ? 'bg-sketch-green/10' : 'bg-gray-50'}`}
              >
                <div className="text-center p-6">
                  <div className="text-lg font-hand text-sketch-gray mb-2">{aiCharacter.koreanName}</div>
                  <div className="text-6xl font-pen text-sketch-dark" style={{ transform: 'rotate(1deg)' }}>
                    {aiScore}
                  </div>
                  {!streamerWins && !tie && <div className="text-2xl mt-2">🏆</div>}
                </div>
              </SketchBorder>
            </div>

            <div className="text-center mt-6 text-lg text-sketch-gray font-hand">
              점수 차: <span className="font-pen text-sketch-dark">{Math.abs(streamerScore - aiScore)}</span>점
            </div>
          </div>
        </SketchBorder>

        <div className="flex gap-4 mb-12">
          <SketchBorder
            color="#2B2B2B"
            strokeWidth={2}
            borderRadius={16}
            roughness={1}
            className="flex-1 bg-sketch-blue rounded-2xl cursor-pointer transition-transform hover:scale-105"
            style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}
          >
            <button
              onClick={handlePlayAgain}
              className="w-full px-8 py-4 text-xl font-pen text-white"
            >
              {text.playAgain}
            </button>
          </SketchBorder>

          <SketchBorder
            color="#2B2B2B"
            strokeWidth={2}
            borderRadius={16}
            roughness={1}
            className="flex-1 bg-white rounded-2xl cursor-pointer transition-transform hover:scale-105"
            style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}
          >
            <button
              onClick={handleNewCharacter}
              className="w-full px-8 py-4 text-xl font-pen text-sketch-dark"
            >
              {text.newCharacter}
            </button>
          </SketchBorder>
        </div>

        <div className="flex justify-center mb-8">
          <AdBanner variant="rectangle" />
        </div>

        <SketchBorder
          color="#2B2B2B"
          strokeWidth={1.5}
          borderRadius={20}
          roughness={1}
          className="bg-white rounded-3xl"
          style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="p-6 text-center">
            <p className="text-lg text-sketch-gray font-hand">
              {streamerWins ? (
                <>🎉 축하합니다! <span className="font-pen text-sketch-dark">{aiCharacter.koreanName}</span>를 이겼어요!</>
              ) : tie ? (
                <>🤝 <span className="font-pen text-sketch-dark">{aiCharacter.koreanName}</span>와 무승부입니다!</>
              ) : (
                <>😅 <span className="font-pen text-sketch-dark">{aiCharacter.koreanName}</span>가 이번엔 이겼네요. 다시 도전해보세요!</>
              )}
            </p>
          </div>
        </SketchBorder>
      </div>
    </div>
  );
}
