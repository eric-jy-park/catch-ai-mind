'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';
import { useStorage, useMutation } from '@/liveblocks.config';
import type { PlayerRole } from '@/types/game-state';
import { useSound } from '@/lib/audio/use-sound';

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => ({
    default: mod.Excalidraw,
  })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sketch-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-hand text-sketch-dark">캔버스 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

interface ExcalidrawCanvasProps {
  role: PlayerRole;
  isAITurn: boolean;
  roomId: string;
}

export function ExcalidrawCanvas({ role, isAITurn, roomId }: ExcalidrawCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const isInitialMount = useRef(true);
  const isSyncing = useRef(false); // Prevent infinite loop
  const { play } = useSound();

  // Get canvas elements from Liveblocks storage
  const canvasElements = useStorage((root) => root.canvasElements);

  // Mutation to update canvas in Liveblocks
  const updateCanvas = useMutation(({ storage }, elements: any[]) => {
    storage.set('canvasElements', elements);
  }, []);

  // Determine if current user can draw
  const canDraw = role === 'DRAWER' && !isAITurn;
  const lastDrawSoundTime = useRef(0);

  // Sync Liveblocks storage to Excalidraw when storage changes
  useEffect(() => {
    if (!excalidrawAPI || !canvasElements || isSyncing.current) return;

    // Skip initial mount to avoid overwriting canvas
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Set syncing flag to prevent onChange from triggering
    isSyncing.current = true;

    try {
      excalidrawAPI.updateScene({
        elements: canvasElements as any[],
      });
    } catch (error) {
      console.error('Failed to update Excalidraw scene:', error);
    } finally {
      // Reset syncing flag after a brief delay
      setTimeout(() => {
        isSyncing.current = false;
      }, 50);
    }
  }, [canvasElements, excalidrawAPI]);

  // Handle Excalidraw changes
  const onChange = useCallback((elements: readonly any[]) => {
    if (!canDraw || isSyncing.current) return;

    const now = Date.now();
    if (now - lastDrawSoundTime.current > 100) {
      lastDrawSoundTime.current = now;
      play('draw');
    }

    updateCanvas([...elements]);
  }, [canDraw, updateCanvas, play]);

  // Clear canvas mutation
  const clearCanvas = useMutation(({ storage }) => {
    storage.set('canvasElements', []);
  }, []);

  // Expose clear function
  useEffect(() => {
    if (!excalidrawAPI) return;

    // Add global clear function for round transitions
    (window as any).clearExcalidrawCanvas = () => {
      isSyncing.current = true;
      try {
        excalidrawAPI.updateScene({ elements: [] });
        clearCanvas();
      } catch (error) {
        console.error('Failed to clear canvas:', error);
      } finally {
        setTimeout(() => {
          isSyncing.current = false;
        }, 50);
      }
    };

    return () => {
      delete (window as any).clearExcalidrawCanvas;
    };
  }, [excalidrawAPI, clearCanvas]);

  return (
    <div className="relative w-full h-full">
      <svg
        className="absolute pointer-events-none z-20"
        style={{ 
          width: 'calc(100% + 8px)', 
          height: 'calc(100% + 8px)',
          left: '-4px',
          top: '-4px',
          overflow: 'visible' 
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M2,8 C5,3 15,2 25,3 L75,2 C85,2.5 95,4 98,9 L98,91 C95,96 85,98 75,97 L25,98 C15,97.5 5,95 2,90 Z"
          fill="none"
          stroke="#2B2B2B"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M2.5,8.5 C5.2,3.5 15.3,2.3 25.2,3.2 L74.8,2.2 C84.7,2.7 94.8,4.2 97.5,9.2 L97.5,90.8 C94.8,95.8 84.7,97.8 74.8,96.8 L25.2,97.8 C15.3,97.3 5.2,94.8 2.5,89.8 Z"
          fill="none"
          stroke="#2B2B2B"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.2"
        />
      </svg>
      
      <div 
        className="absolute inset-0 bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.06)' }}
      >
        <Excalidraw
          excalidrawAPI={setExcalidrawAPI}
          onChange={onChange}
          viewModeEnabled={!canDraw}
          zenModeEnabled={false}
          gridModeEnabled={false}
          theme="light"
          name="catch-ai-mind"
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
            },
          }}
        />

        {!canDraw && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-sketch-blue/90 text-white rounded-full shadow-lg font-pen text-lg z-50">
            {isAITurn ? '🤖 AI가 그리는 중...' : '👀 관전 모드'}
          </div>
        )}
      </div>
    </div>
  );
}
