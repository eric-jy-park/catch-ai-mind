'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { GameRoom } from '@/components/game/GameRoom';
import type { AICharacter, WordDifficulty } from '@/types/game-state';

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const searchParams = useSearchParams();

  // Get game settings from URL
  const selectedAI = (searchParams.get('ai') || 'chatgpt') as AICharacter;
  const totalRounds = parseInt(searchParams.get('rounds') || '10', 10);
  const roundTime = parseInt(searchParams.get('time') || '60', 10);
  const difficulty = (searchParams.get('difficulty') || 'medium') as WordDifficulty;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        playerStatus: 'active',
        lastActivity: Date.now(),
      }}
      initialStorage={{
        gameState: {
          phase: 'LOBBY',
          currentRound: 1,
          totalRounds,
          streamerRole: 'DRAWER',
          aiRole: 'GUESSER',
          roundStartTime: Date.now(),
          roundDuration: roundTime,
          streamerScore: 0,
          aiScore: 0,
          guessHistory: [],
          selectedAI,
          difficulty,
        },
        canvasElements: [],
      }}
    >
      <ClientSideSuspense fallback={<LoadingScreen />}>
        <GameRoom
          roomId={roomId}
          selectedAI={selectedAI}
          totalRounds={totalRounds}
          roundTime={roundTime}
          difficulty={difficulty}
        />
      </ClientSideSuspense>
    </RoomProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center relative">
      {/* Paper texture background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center space-y-6">
        <div className="text-6xl font-pen text-sketch-dark animate-pulse" style={{ transform: 'rotate(-1deg)' }}>
          Catch AI Mind
        </div>
        <div className="text-2xl font-hand text-sketch-gray" style={{ transform: 'rotate(0.5deg)' }}>
          게임을 준비하는 중...
        </div>
        <div className="flex justify-center gap-3">
          <div className="w-4 h-4 bg-sketch-blue rounded-full animate-bounce" style={{ animationDelay: '0ms', boxShadow: '2px 2px 0 rgba(0,0,0,0.1)' }} />
          <div className="w-4 h-4 bg-sketch-blue rounded-full animate-bounce" style={{ animationDelay: '150ms', boxShadow: '2px 2px 0 rgba(0,0,0,0.1)' }} />
          <div className="w-4 h-4 bg-sketch-blue rounded-full animate-bounce" style={{ animationDelay: '300ms', boxShadow: '2px 2px 0 rgba(0,0,0,0.1)' }} />
        </div>
      </div>
    </div>
  );
}
