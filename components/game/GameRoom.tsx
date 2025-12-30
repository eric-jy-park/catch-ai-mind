'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage, useMutation, useBroadcastEvent } from '@/liveblocks.config';
import { GameLayout } from './GameLayout';
import { GameHeader } from './GameHeader';
import { ExcalidrawCanvas } from './ExcalidrawCanvas';
import { GuessInput } from './GuessInput';
import { TargetWord } from './TargetWord';
import { GameEndScreen } from './GameEndScreen';
import type { AICharacter, WordDifficulty, GameState } from '@/types/game-state';
import { GAME_CONSTANTS } from '@/lib/game/constants';
import { useSound } from '@/lib/audio/use-sound';

interface GameRoomProps {
  roomId: string;
  selectedAI: AICharacter;
  totalRounds: number;
  roundTime: number;
  difficulty: WordDifficulty;
}

export function GameRoom({ roomId, selectedAI, totalRounds, roundTime, difficulty }: GameRoomProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(roundTime);
  const [currentWord, setCurrentWord] = useState<{ word: string; category: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { play, playBackgroundMusic, forcePlayBackgroundMusic } = useSound();

  // Get game state from Liveblocks
  const gameState = useStorage((root) => root.gameState);

  const broadcast = useBroadcastEvent();

  const canvasElements = useStorage((root) => root.canvasElements);

  const phaseRef = useRef<GameState['phase']>('LOBBY');
  useEffect(() => {
    if (gameState?.phase) {
      phaseRef.current = gameState.phase;
    }
  }, [gameState?.phase]);

  const gameStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    gameStateRef.current = gameState || null;
  }, [gameState]);

  const currentWordRef = useRef<typeof currentWord>(null);
  useEffect(() => {
    currentWordRef.current = currentWord;
  }, [currentWord]);

  const canvasElementsRef = useRef<any[]>([]);
  useEffect(() => {
    canvasElementsRef.current = canvasElements || [];
  }, [canvasElements]);

  // Initialize game state
  const initializeGame = useMutation(({ storage }) => {
    const initialState: GameState = {
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
    };

    storage.set('gameState', initialState);
    storage.set('canvasElements', []);
  }, [totalRounds, roundTime, selectedAI, difficulty]);

  // Initialize game on mount
  useEffect(() => {
    if (!gameState && !isInitialized) {
      initializeGame();
      setIsInitialized(true);
    }
  }, [gameState, isInitialized, initializeGame]);

  // Start the game
  const startGame = useCallback(async () => {
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          difficulty,
        }),
      });

      if (!response.ok) throw new Error('Failed to create game');

      const { word, category } = await response.json();
      setCurrentWord({ word, category });
      play('round_start');

      // Update game state to ROUND_START
      updateGamePhase('ROUND_START');

      // Start timer after a brief delay
      setTimeout(() => {
        updateGamePhase('DRAWING');
        setTimeRemaining(roundTime);
      }, GAME_CONSTANTS.WORD_REVEAL_DURATION * 1000);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, [roomId, difficulty, roundTime, play]);

  // Update game phase
  const updateGamePhase = useMutation(({ storage }, newPhase: GameState['phase']) => {
    const state = storage.get('gameState');
    if (state) {
      storage.set('gameState', { ...state, phase: newPhase });
    }
  }, []);

  // Update game state with guess result
  const addGuessResult = useMutation(
    ({ storage }, result: any) => {
      const state = storage.get('gameState');
      if (!state) return;

      const guessResult = {
        guess: result.guess,
        isCorrect: result.isCorrect,
        matchType: result.matchType,
        confidence: result.confidence,
        pointsAwarded: result.pointsAwarded,
        timestamp: Date.now(),
        by: result.by,
      };

      const updatedState = {
        ...state,
        guessHistory: [...state.guessHistory, guessResult],
        streamerScore:
          result.by === 'streamer' && result.isCorrect
            ? state.streamerScore + result.pointsAwarded
            : state.streamerScore,
        aiScore:
          result.by === 'ai' && result.isCorrect
            ? state.aiScore + result.pointsAwarded
            : state.aiScore,
      };

      storage.set('gameState', updatedState);
    },
    []
  );

  // Handle guess submission
  const handleGuessSubmit = useCallback(async (guess: string) => {
    if (!gameState || gameState.phase !== 'DRAWING') return;

    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          guess,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit guess');

      const result = await response.json();

      // Update game state with guess result
      addGuessResult({
        ...result,
        guess,
        by: 'streamer',
      });

      // Play sound based on guess result
      if (result.isCorrect) {
        play('correct');
      } else {
        play('wrong');
      }

      // Broadcast guess event
      broadcast({
        type: 'guess_submitted',
        guess,
        by: 'streamer',
        timestamp: Date.now(),
      });

      // If correct, end the round
      if (result.isCorrect) {
        aiDrawingState.current.shouldStop = true;
        setTimeout(() => {
          handleRoundEnd();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
    }
  }, [gameState, roomId, broadcast, addGuessResult]);

  // Update game for next round
  const startNextRound = useMutation(
    ({ storage }) => {
      const state = storage.get('gameState');
      if (!state) return;

      const updatedState = {
        ...state,
        currentRound: state.currentRound + 1,
        streamerRole: state.streamerRole === 'DRAWER' ? 'GUESSER' : 'DRAWER',
        aiRole: state.aiRole === 'DRAWER' ? 'GUESSER' : 'DRAWER',
        roundStartTime: Date.now(),
        guessHistory: [],
        phase: 'DRAWING' as const,
      };

      storage.set('gameState', updatedState);
    },
    []
  );

  // Handle round end
  const handleRoundEnd = useCallback(async () => {
    play('round_end');
    updateGamePhase('ROUND_END');

    setTimeout(async () => {
      if (!gameState) return;

      // Check if game is over
      if (gameState.currentRound >= gameState.totalRounds) {
        play('game_end');
        updateGamePhase('GAME_END');
        return;
      }

      // Start next round
      try {
        const response = await fetch('/api/game/next-round', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId }),
        });

        if (!response.ok) throw new Error('Failed to start next round');

        const { word, category } = await response.json();
        setCurrentWord({ word, category });

        // Clear canvas
        if (typeof window !== 'undefined' && (window as any).clearExcalidrawCanvas) {
          (window as any).clearExcalidrawCanvas();
        }

        // Update game state for next round
        startNextRound();
        setTimeRemaining(roundTime);
      } catch (error) {
        console.error('Failed to start next round:', error);
      }
    }, GAME_CONSTANTS.ROUND_END_DISPLAY_DURATION * 1000);
  }, [gameState, roomId, roundTime, updateGamePhase, startNextRound]);

  // Timer countdown - Only responsible for ticking down
  useEffect(() => {
    if (!gameState || gameState.phase !== 'DRAWING') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        // Broadcast timer tick
        broadcast({
          type: 'timer_tick',
          remaining: newTime,
        });

        // Play warning sound when low on time
        if (newTime === 10) {
          play('timer_warning');
        }

        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.phase, broadcast, play]);

  // Handle round end when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && gameState?.phase === 'DRAWING') {
      handleRoundEnd();
    }
  }, [timeRemaining, gameState?.phase, handleRoundEnd]);

  // Mutation to update canvas (must be defined before triggerAIDrawing)
  const updateCanvas = useMutation(({ storage }, elements: any[]) => {
    storage.set('canvasElements', elements);
  }, []);

  const aiDrawingState = useRef({
    isActive: false,
    shouldStop: false,
  });

  const triggerAIDrawing = useCallback(async () => {
    if (!gameState || !currentWord) return;
    if (gameState.aiRole !== 'DRAWER') return;
    if (aiDrawingState.current.isActive) return;

    aiDrawingState.current.isActive = true;
    aiDrawingState.current.shouldStop = false;

    try {
      let currentElements: any[] = [];
      let iterationCount = 0;
      const maxIterations = 8;

      while (!aiDrawingState.current.shouldStop && iterationCount < maxIterations) {
        const response = await fetch('/api/ai/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            word: currentWord.word,
            category: currentWord.category,
            character: gameState.selectedAI,
            existingElements: currentElements,
          }),
        });

        if (!response.ok) break;

        const { elements, done } = await response.json();
        
        if (!elements || elements.length === 0 || done) break;

        currentElements = [...currentElements, ...elements];
        updateCanvas(currentElements);

        const elementScore = Math.min(currentElements.length * 25, 85);
        const types = new Set(currentElements.map((e: any) => e.type));
        const varietyBonus = Math.min(types.size * 30, 20);
        const confidence = Math.min(elementScore + varietyBonus + 10, 99);
        
        console.log(`[AI Drawing] Iteration ${iterationCount + 1}: ${currentElements.length} total elements, ${confidence}% confidence`);

        if (confidence >= 85 || phaseRef.current !== 'DRAWING') {
          console.log('[AI Drawing] Stopping: high confidence or round ended');
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        iterationCount++;
      }
    } catch (error) {
      console.error('Failed to trigger AI drawing:', error);
    } finally {
      aiDrawingState.current.isActive = false;
    }
  }, [gameState, currentWord, roomId, updateCanvas]);

  // AI Guessing State - tracks timing and confidence
  const aiGuessingState = useRef({
    lastGuessTime: 0,
    lastGuess: '',
    guessCount: 0,
    confidence: 0,
    roundStartTime: 0, // Track when round started
    isPending: false, // Track if a guess request is in progress
  });

  // Confidence algorithm: 0-100 based on visual input
  const calculateConfidence = useCallback((elements: any[]) => {
    if (!elements || elements.length === 0) return 45;
    
    // More aggressive confidence scaling
    // 1 element → ~65%, 2 → ~80%, 3 → ~90%, 4+ → 95-99%
    const elementScore = Math.min(elements.length * 25, 85);
    const types = new Set(elements.map(e => e.type));
    const varietyBonus = Math.min(types.size * 30, 20);
    
    // Add bonus for having any content at all
    const contentBonus = elements.length > 0 ? 10 : 0;
    
    const totalConfidence = Math.min(elementScore + varietyBonus + contentBonus, 99);
    
    console.log(`[GameRoom] Confidence calc: ${elements.length} elems, ${types.size} types → ${totalConfidence}%`);
    return totalConfidence;
  }, []);

  const shouldAIGuess = useCallback((confidence: number) => {
    const state = aiGuessingState.current;
    const now = Date.now();
    
    // CRITICAL: Don't guess if a request is already pending
    if (state.isPending) {
      console.log('[GameRoom] AI guess already pending, skipping');
      return false;
    }
    
    // MINIMUM 3 SECOND COOLDOWN between guesses
    const minCooldown = 3000;
    if (now - state.lastGuessTime < minCooldown) {
      console.log(`[GameRoom] AI cooldown active (${Math.round((minCooldown - (now - state.lastGuessTime)) / 1000)}s remaining)`);
      return false;
    }
    
    // FORCED GUESS: If no guess has been made for 8 seconds, force a guess
    const timeSinceRoundStart = now - state.roundStartTime;
    const timeSinceLastGuess = now - state.lastGuessTime;
    if (state.guessCount === 0 && timeSinceRoundStart > 8000) {
      console.log(`[GameRoom] AI conf:${confidence}% - FORCED GUESS (8s timeout, no guesses yet)`);
      return true;
    }
    if (state.guessCount > 0 && timeSinceLastGuess > 10000) {
      console.log(`[GameRoom] AI conf:${confidence}% - FORCED GUESS (10s since last guess)`);
      return true;
    }
    
    // GUARANTEED GUESS: If confidence >= 85%, ALWAYS guess (deterministic)
    if (confidence >= 85) {
      console.log(`[GameRoom] AI conf:${confidence}% - GUARANTEED GUESS (high confidence)`);
      return true;
    }
    
    // For lower confidence, use exponential scaling
    // This makes guessing more likely as confidence increases
    // 50% conf → 12.5% chance
    // 60% conf → 21.6% chance
    // 70% conf → 34.3% chance
    // 80% conf → 51.2% chance
    const adjustedProbability = Math.pow(confidence / 100, 1.5);
    
    const willGuess = Math.random() < adjustedProbability;
    console.log(`[GameRoom] AI conf:${confidence}% prob:${(adjustedProbability*100).toFixed(1)}% guess:${willGuess}`);
    return willGuess;
  }, []);

  // Thinking delay: higher confidence = faster realization
  const simulateThinking = useCallback(async (confidence: number) => {
    const delay = (100 - confidence) * 25 + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }, []);

  // AI Guessing - periodic guesses when AI is guesser
  const triggerAIGuessing = useCallback(async () => {
    const state = gameStateRef.current;
    const wordInfo = currentWordRef.current;
    const elements = canvasElementsRef.current;

    console.log('[GameRoom] triggerAIGuessing called - state:', !!state, 'wordInfo:', !!wordInfo, 'aiRole:', state?.aiRole, 'phase:', state?.phase);

    if (!state || !wordInfo || state.aiRole !== 'GUESSER' || state.phase !== 'DRAWING') {
      console.log('[GameRoom] AI guessing condition not met');
      return;
    }

    // Calculate confidence and check if AI should guess
    const confidence = calculateConfidence(elements);
    aiGuessingState.current.confidence = confidence;

    if (!shouldAIGuess(confidence)) return;

    // Simulate human "thinking" before answering
    await simulateThinking(confidence);

    console.log('[GameRoom] All conditions met! Calling AI guess API. Elements:', elements.length, 'Confidence:', confidence);

    // Mark as pending to prevent duplicate requests
    aiGuessingState.current.isPending = true;

    try {
      const aiGuesses = state.guessHistory
        .filter((g: any) => g.by === 'ai')
        .map((g: any) => g.guess);

      const response = await fetch('/api/ai/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: state.selectedAI,
          category: wordInfo.category,
          previousGuesses: aiGuesses,
          elements: elements || [],
        }),
      });

      console.log('[GameRoom] AI guess API response status:', response.status, 'ok:', response.ok);

      if (!response.ok) throw new Error('Failed to generate AI guess');

      const { guess } = await response.json();
      console.log('[GameRoom] AI generated guess:', guess);

      if (phaseRef.current !== 'DRAWING') {
        console.log('[GameRoom] AI guess arrived after round end, ignoring:', guess);
        return;
      }

      // Don't repeat the same guess
      if (guess === aiGuessingState.current.lastGuess) {
        console.log('[GameRoom] AI repeating guess, skipping:', guess);
        return;
      }

      const guessResponse = await fetch('/api/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, guess }),
      });

      if (!guessResponse.ok) throw new Error('Failed to submit AI guess');

      const result = await guessResponse.json();
      console.log('[GameRoom] AI guess submission result:', result);

      if (phaseRef.current !== 'DRAWING') return;

      // Update AI guessing state
      aiGuessingState.current.lastGuessTime = Date.now();
      aiGuessingState.current.lastGuess = guess;
      aiGuessingState.current.guessCount++;

      addGuessResult({
        ...result,
        guess,
        by: 'ai',
      });

      if (result.isCorrect) {
        play('correct');
      } else {
        play('wrong');
      }

      broadcast({
        type: 'guess_submitted',
        guess,
        by: 'ai',
        timestamp: Date.now(),
      });

      if (result.isCorrect) {
        setTimeout(() => {
          handleRoundEnd();
        }, 1000);
      }
    } catch (error) {
      console.error('[GameRoom] Failed to trigger AI guessing:', error);
    } finally {
      // Always clear pending state
      aiGuessingState.current.isPending = false;
    }
  }, [roomId, broadcast, addGuessResult, handleRoundEnd, play, calculateConfidence, shouldAIGuess, simulateThinking]);

  // AI guessing loop: initial reaction time + periodic checks
  useEffect(() => {
    console.log('[GameRoom] AI guessing useEffect - phase:', gameState?.phase, 'aiRole:', gameState?.aiRole);
    if (gameState?.phase !== 'DRAWING' || gameState.aiRole !== 'GUESSER') {
      console.log('[GameRoom] AI guessing condition not met, returning');
      return;
    }

    console.log('[GameRoom] Starting AI guessing loop');
    
    // Reset AI guessing state for new round
    aiGuessingState.current = {
      lastGuessTime: 0,
      lastGuess: '',
      guessCount: 0,
      confidence: 0,
      roundStartTime: Date.now(),
      isPending: false,
    };

    // Initial guess after 2-4s reaction time
    const initial = setTimeout(() => {
      console.log('[GameRoom] Initial AI guess timeout fired');
      triggerAIGuessing();
    }, 2000 + Math.random() * 2000);

    // Periodic checks every 3s (will decide whether to guess based on confidence)
    const interval = setInterval(() => {
      console.log('[GameRoom] Periodic AI guess check');
      triggerAIGuessing();
    }, 3000);

    return () => {
      console.log('[GameRoom] Stopping AI guessing loop');
      clearTimeout(initial);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.phase, gameState?.aiRole]);

  // AI Drawing - trigger when it's AI's turn to draw
  useEffect(() => {
    console.log('[GameRoom] AI drawing useEffect - phase:', gameState?.phase, 'aiRole:', gameState?.aiRole);
    if (gameState?.phase !== 'DRAWING' || gameState?.aiRole !== 'DRAWER') {
      console.log('[GameRoom] AI drawing condition not met, returning');
      return;
    }

    console.log('[GameRoom] AI is drawer, triggering AI drawing');
    triggerAIDrawing();
  }, [gameState?.phase, gameState?.aiRole]);


  // Start game when in lobby
  useEffect(() => {
    console.log('[GameRoom] Lobby useEffect - phase:', gameState?.phase, 'hasInteracted:', hasInteracted);
    if (gameState?.phase === 'LOBBY') {
      console.log('[GameRoom] Phase is LOBBY, calling startGame');
      const handleFirstInteraction = async () => {
        if (!hasInteracted) {
          setHasInteracted(true);
          await playBackgroundMusic();
        }
      };

      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);

      startGame();

      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [gameState?.phase, startGame, playBackgroundMusic, hasInteracted]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-2xl font-hand text-sketch-gray" style={{ transform: 'rotate(0.5deg)' }}>게임을 초기화하는 중...</div>
      </div>
    );
  }

  // Show game end screen if game is over
  if (gameState.phase === 'GAME_END') {
    return (
      <GameEndScreen
        streamerScore={gameState.streamerScore}
        aiScore={gameState.aiScore}
        selectedAI={gameState.selectedAI}
      />
    );
  }

  // Determine if streamer is drawing
  const isStreamerDrawing = gameState.streamerRole === 'DRAWER';
  
  // Show target word during ROUND_START and DRAWING phases when streamer is drawer
  const shouldShowTargetWord = isStreamerDrawing && currentWord && 
    (gameState.phase === 'ROUND_START' || gameState.phase === 'DRAWING');

  return (
    <div className="min-h-screen bg-paper relative">
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => forcePlayBackgroundMusic()}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg"
        >
          🎵 Test Music
        </button>
      )}

      <GameLayout
        header={
          <GameHeader
            currentRound={gameState.currentRound}
            totalRounds={gameState.totalRounds}
            timeRemaining={timeRemaining}
            streamerScore={gameState.streamerScore}
            aiScore={gameState.aiScore}
            selectedAI={gameState.selectedAI}
          />
        }
        canvas={
          <ExcalidrawCanvas
            role={gameState.streamerRole}
            isAITurn={gameState.aiRole === 'DRAWER'}
            roomId={roomId}
          />
        }
        guessInput={
          <GuessInput
            onSubmit={handleGuessSubmit}
            guessHistory={gameState.guessHistory}
            disabled={gameState.phase !== 'DRAWING'}
            isDrawing={isStreamerDrawing}
          />
        }
        targetWord={
          shouldShowTargetWord ? (
            <TargetWord word={currentWord.word} category={currentWord.category} />
          ) : undefined
        }
      />
    </div>
  );
}
