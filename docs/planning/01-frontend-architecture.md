# Frontend & UI Architecture

**Design Principle**: 편안한 스케치북 느낌 (Comfortable sketchbook feel)

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Canvas**: Excalidraw (collaborative drawing)
- **Styling**: Tailwind CSS + Custom sketch-style components
- **Fonts**: Noto Sans KR (Korean support)
- **Real-time**: Liveblocks integration

## Next.js Project Structure

```
catch-ai-mind/
├── app/
│   ├── layout.tsx                    # Root layout with Korean font
│   ├── page.tsx                      # Landing → redirect to /select
│   ├── select/
│   │   └── page.tsx                  # Character selection screen
│   ├── game/
│   │   └── [roomId]/
│   │       └── page.tsx              # Main game screen
│   ├── api/
│   │   ├── liveblocks/
│   │   │   └── auth/route.ts         # Liveblocks auth
│   │   ├── game/
│   │   │   ├── create/route.ts       # Create game room
│   │   │   ├── guess/route.ts        # Process guess
│   │   │   └── next-round/route.ts   # Round transition
│   │   └── ai/
│   │       ├── draw/
│   │       │   └── stream/route.ts   # AI drawing stream
│   │       └── guess/route.ts        # AI guessing
│   ├── providers.tsx                 # Client providers wrapper
│   └── globals.css                   # Global styles
│
├── components/
│   ├── character-select/
│   │   ├── CharacterGrid.tsx         # Grid of AI characters
│   │   ├── CharacterCard.tsx         # Individual character card
│   │   ├── SettingsPanel.tsx         # Game settings form
│   │   └── StartButton.tsx           # Start game button
│   │
│   ├── game/
│   │   ├── GameLayout.tsx            # Main game layout
│   │   ├── ExcalidrawCanvas.tsx      # Canvas with Liveblocks
│   │   ├── GameHeader.tsx            # Timer, scores, round
│   │   ├── GuessInput.tsx            # Input for guessing
│   │   ├── GuessesList.tsx           # Previous guesses
│   │   ├── RoleIndicator.tsx         # Current role display
│   │   ├── RoundTransition.tsx       # Between-round screen
│   │   └── GameOverModal.tsx         # Final results
│   │
│   ├── ui/
│   │   ├── Button.tsx                # Sketch-styled button
│   │   ├── Input.tsx                 # Korean IME input
│   │   ├── Timer.tsx                 # Countdown timer
│   │   ├── ScoreBoard.tsx            # Score display
│   │   └── AdBanner.tsx              # Ad placements
│   │
│   └── shared/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── liveblocks/
│   │   ├── client.ts                 # Liveblocks setup
│   │   ├── room.ts                   # Room config
│   │   └── storage.ts                # Type definitions
│   │
│   ├── excalidraw/
│   │   ├── config.ts                 # Excalidraw config
│   │   └── utils.ts                  # Helper functions
│   │
│   └── utils/
│       ├── korean.ts                 # Korean text utilities
│       └── stream-friendly.ts        # OBS-friendly colors
│
├── hooks/
│   ├── useGameState.ts               # Game state hook
│   ├── useTimer.ts                   # Timer logic
│   ├── useExcalidraw.ts              # Excalidraw integration
│   ├── useGuessSubmit.ts             # Guess submission
│   └── useRoomSync.ts                # Liveblocks sync
│
├── styles/
│   ├── sketchbook.css                # 스케치북 styles
│   └── character-select.css          # Character screen
│
├── public/
│   ├── characters/                   # AI character portraits
│   ├── sounds/                       # Sound effects
│   └── fonts/                        # Korean fonts
│
├── types/
│   ├── game.ts                       # Game types
│   ├── ai.ts                         # AI character types
│   ├── liveblocks.ts                 # Liveblocks types
│   └── excalidraw.ts                 # Excalidraw types
│
├── data/
│   └── words/                        # Korean word bank
│       ├── easy.json
│       ├── medium.json
│       └── hard.json
```

## 스케치북 Design System

### Visual Identity

**Color Palette:**
```javascript
colors: {
  paper: '#FFF9F0',        // Warm paper background
  sketch: {
    dark: '#2B2B2B',       // Charcoal text
    gray: '#828282',       // Light sketch gray
    blue: '#5B8FF9',       // Sketch blue accent
    red: '#FF6B6B',        // Sketch red
    green: '#51CF66',      // Sketch green
  }
}
```

**Typography:**
```javascript
fontFamily: {
  sketch: ['Noto Sans KR', 'Comic Sans MS', 'cursive']
}
```

**Border Styles:**
```css
.sketch-border {
  border: 2px solid #2B2B2B;
  border-radius: 8px;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
  /* Rough, hand-drawn feel */
  filter: url(#rough-paper);
}

.sketch-border-wobble {
  animation: wobble 0.3s ease-in-out;
}

@keyframes wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}
```

### Component Examples

**Sketch Button:**
```tsx
<button className="
  px-6 py-3
  bg-paper
  border-2 border-sketch-dark
  rounded-lg
  shadow-[3px_3px_0px_rgba(0,0,0,0.1)]
  hover:shadow-[5px_5px_0px_rgba(0,0,0,0.15)]
  hover:translate-x-[-2px] hover:translate-y-[-2px]
  transition-all
  font-sketch
  text-sketch-dark
">
  시작하기
</button>
```

**Sketch Input:**
```tsx
<input className="
  w-full px-4 py-2
  bg-white
  border-2 border-sketch-gray
  rounded-md
  focus:border-sketch-blue
  focus:outline-none
  font-sketch
  placeholder:text-sketch-gray
" />
```

## Character Selection Screen

### Layout
```
┌─────────────────────────────────────────┐
│                                         │
│         CATCH AI MIND                   │
│      캐치 AI 마인드                       │
│                                         │
│   ┌──────┐ ┌──────┐ ┌──────┐           │
│   │ GPT  │ │Gemini│ │Claude│           │
│   │ 모범생 │ │ 듀얼  │ │차분함│           │
│   └──────┘ └──────┘ └──────┘           │
│   ┌──────┐ ┌──────┐                    │
│   │ Grok │ │DeepS.│                    │
│   │ 엣지  │ │다크호스│                    │
│   └──────┘ └──────┘                    │
│                                         │
│   ⚙️ 게임 설정                           │
│   라운드 시간: [30s] [60s] [90s]        │
│   난이도: [쉬움] [보통] [어려움]         │
│                                         │
│         [ 게임 시작 ]                    │
│                                         │
└─────────────────────────────────────────┘
```

### Character Card Component
```tsx
interface CharacterCardProps {
  character: AICharacter;
  selected: boolean;
  onClick: () => void;
}

function CharacterCard({ character, selected, onClick }: CharacterCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-6 cursor-pointer
        bg-paper border-2 rounded-xl
        transition-all duration-200
        ${selected
          ? 'border-sketch-blue shadow-[4px_4px_0px_rgba(91,143,249,0.3)] scale-105'
          : 'border-sketch-gray hover:border-sketch-dark hover:shadow-[3px_3px_0px_rgba(0,0,0,0.1)]'
        }
      `}
    >
      {/* Character Portrait (DALL-E generated sketch) */}
      <div className="w-32 h-32 mx-auto mb-4">
        <img
          src={`/characters/${character}.svg`}
          alt={character}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Character Info */}
      <h3 className="text-xl font-bold text-sketch-dark text-center mb-1">
        {CHARACTER_NAMES[character]}
      </h3>
      <p className="text-sm text-sketch-gray text-center">
        {CHARACTER_PERSONALITIES[character]}
      </p>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-sketch-blue rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}
```

## Game Screen Layout

### Desktop Layout (1920x1080)
```
┌─────────┬───────────────────────────────┬─────────┐
│         │  [ 타이머: 45s ]  [ 3/10 ]    │         │
│         │  [ 나: 3 ]  [ AI: 2 ]         │         │
│   AD    ├───────────────────────────────┤   AD    │
│ BANNER  │                               │ BANNER  │
│ (120px) │      EXCALIDRAW CANVAS        │ (120px) │
│         │         (800 x 600)           │         │
│         │                               │         │
│         ├───────────────────────────────┤         │
│         │ 당신이 맞춥니다!                │         │
│         │ [ 정답 입력: __________ ] [전송]│         │
│         │                               │         │
│         │ 이전 추측:                     │         │
│         │ • 고양이 ✗                     │         │
│         │ • 강아지 ✓                     │         │
└─────────┴───────────────────────────────┴─────────┘
```

### GameLayout Component
```tsx
export function GameLayout({ children, roomId }: Props) {
  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left Ad Banner */}
      <aside className="w-[120px] bg-white border-r-2 border-sketch-gray">
        <AdBanner position="left" />
      </aside>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col">
        {/* Header: Timer, Scores, Round */}
        <GameHeader />

        {/* Canvas Area */}
        <div className="flex-1 p-8">
          <div className="max-w-[800px] h-[600px] mx-auto border-2 border-sketch-dark rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
            <ExcalidrawCanvas roomId={roomId} />
          </div>
        </div>

        {/* Guess Input / Word Display Area */}
        <div className="p-6 border-t-2 border-sketch-gray bg-white">
          <RoleIndicator />
          <GuessInput />
          <GuessesList />
        </div>
      </main>

      {/* Right Ad Banner */}
      <aside className="w-[120px] bg-white border-l-2 border-sketch-gray">
        <AdBanner position="right" />
      </aside>
    </div>
  );
}
```

## Excalidraw Integration

### Canvas Component with Liveblocks
```tsx
'use client';

import { Excalidraw } from '@excalidraw/excalidraw';
import { useStorage, useMutation } from '@/liveblocks.config';
import { useCallback } from 'react';

export function ExcalidrawCanvas({ roomId }: { roomId: string }) {
  // Get canvas elements from Liveblocks Storage
  const canvasElements = useStorage((root) => root.canvasElements);
  const gameState = useStorage((root) => root.gameState);

  // Determine if user can draw (based on role)
  const canDraw = gameState.streamerRole === 'DRAWER';

  // Mutation to update canvas elements
  const updateElements = useMutation(({ storage }, elements) => {
    const liveElements = storage.get('canvasElements');

    // Sync Excalidraw elements to Liveblocks
    for (const element of elements) {
      const existingIndex = liveElements.findIndex(e => e.id === element.id);

      if (existingIndex >= 0) {
        liveElements.set(existingIndex, element);
      } else {
        liveElements.push(element);
      }
    }
  }, []);

  const handleChange = useCallback((elements, appState) => {
    if (!canDraw) return; // Read-only mode

    updateElements(elements);
  }, [canDraw, updateElements]);

  return (
    <div className="w-full h-full">
      <Excalidraw
        initialData={{
          elements: canvasElements || [],
          appState: {
            viewBackgroundColor: '#FFFFFF',
            currentItemFontFamily: 1, // Hand-drawn font
            currentItemRoughness: 1, // Sketchy appearance
            currentItemStrokeWidth: 2,
          },
        }}
        onChange={handleChange}
        viewModeEnabled={!canDraw}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
          },
        }}
      />
    </div>
  );
}
```

### Excalidraw Config (Sketchbook Aesthetic)
```typescript
// lib/excalidraw/config.ts

export const EXCALIDRAW_CONFIG = {
  // Default drawing settings
  defaultAppState: {
    viewBackgroundColor: '#FFF9F0', // Paper color
    currentItemFontFamily: 1, // Virgil (hand-drawn)
    currentItemRoughness: 1, // Slightly rough
    currentItemStrokeWidth: 2,
    currentItemStrokeColor: '#2B2B2B', // Charcoal
    currentItemBackgroundColor: 'transparent',
    currentItemFillStyle: 'hachure',
    currentItemOpacity: 100,
  },

  // UI options for cleaner interface
  UIOptions: {
    canvasActions: {
      changeViewBackgroundColor: false,
      clearCanvas: false,
      export: false,
      loadScene: false,
      saveToActiveFile: false,
      theme: false,
      saveAsImage: false,
    },
    tools: {
      image: false, // Disable image uploads
    },
  },

  // Enable specific tools only
  enabledTools: [
    'selection',
    'rectangle',
    'diamond',
    'ellipse',
    'arrow',
    'line',
    'freedraw',
    'text',
    'eraser',
  ],
};
```

## Korean Text Handling

### Font Loading
```tsx
// app/layout.tsx
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKR = Noto_Sans_KR({
  subsets: ['korean'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### Korean IME Input Component
```tsx
'use client';

import { useState, useRef } from 'react';

export function GuessInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Korean IME composition
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="정답을 입력하세요..."
        className="
          flex-1 px-4 py-3
          bg-white border-2 border-sketch-gray
          rounded-lg
          focus:border-sketch-blue focus:outline-none
          font-sketch text-lg
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="
          px-6 py-3
          bg-sketch-blue text-white
          border-2 border-sketch-dark
          rounded-lg
          shadow-[3px_3px_0px_rgba(0,0,0,0.1)]
          hover:shadow-[5px_5px_0px_rgba(0,0,0,0.15)]
          hover:translate-x-[-2px] hover:translate-y-[-2px]
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          font-sketch font-bold
        "
      >
        전송
      </button>
    </div>
  );
}
```

## State Management

### Game State Hook
```tsx
// hooks/useGameState.ts
import { useStorage } from '@/liveblocks.config';

export function useGameState() {
  const gameState = useStorage((root) => root.gameState);

  return {
    phase: gameState.phase,
    currentRound: gameState.currentRound,
    totalRounds: gameState.totalRounds,
    streamerRole: gameState.streamerRole,
    aiRole: gameState.aiRole,
    streamerScore: gameState.streamerScore,
    aiScore: gameState.aiScore,
    guessHistory: gameState.guessHistory,

    // Computed values
    isStreamerDrawer: gameState.streamerRole === 'DRAWER',
    isStreamerGuesser: gameState.streamerRole === 'GUESSER',
    isGameOver: gameState.phase === 'GAME_END',
  };
}
```

### Timer Hook
```tsx
// hooks/useGameTimer.ts
import { useStorage, useEventListener } from '@/liveblocks.config';
import { useState, useEffect } from 'react';

export function useGameTimer() {
  const gameState = useStorage((root) => root.gameState);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Client-side prediction
  useEffect(() => {
    const startTime = gameState.roundStartTime;
    const duration = gameState.roundDuration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
      setTimeRemaining(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.roundStartTime, gameState.roundDuration]);

  // Sync with server timer ticks
  useEventListener(({ event }) => {
    if (event.type === 'timer_tick') {
      const drift = Math.abs(timeRemaining - event.remaining);
      if (drift > 2) {
        // Resync if drift > 2 seconds
        setTimeRemaining(event.remaining);
      }
    }
  });

  return { timeRemaining };
}
```

## Performance Optimization

### Lazy Load Excalidraw
```tsx
// components/game/ExcalidrawCanvas.tsx
import dynamic from 'next/dynamic';

const ExcalidrawDynamic = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-paper">
        <p className="text-sketch-gray font-sketch">캔버스 로딩 중...</p>
      </div>
    ),
  }
);

export function ExcalidrawCanvas(props) {
  return <ExcalidrawDynamic {...props} />;
}
```

### Debounce Canvas Updates
```tsx
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedUpdate = useMemo(
  () => debounce(updateElements, 100), // 100ms debounce
  [updateElements]
);
```

## Critical Files Summary

1. **`/app/game/[roomId]/page.tsx`** - Main game orchestrator
2. **`/components/game/ExcalidrawCanvas.tsx`** - Canvas + Liveblocks integration
3. **`/components/game/GameLayout.tsx`** - Overall game layout
4. **`/components/game/GuessInput.tsx`** - Korean IME input handling
5. **`/app/select/page.tsx`** - Character selection screen
6. **`/components/character-select/CharacterCard.tsx`** - Character card UI
7. **`/hooks/useGameState.ts`** - Game state management
8. **`/hooks/useGameTimer.ts`** - Timer synchronization
9. **`/styles/sketchbook.css`** - 스케치북 aesthetic styles
10. **`/app/globals.css`** - Global styles and Tailwind config

## Next Steps

1. Initialize Next.js project
2. Install dependencies (Excalidraw, Liveblocks, Tailwind)
3. Set up Korean font (Noto Sans KR)
4. Create 스케치북 design system (colors, borders, shadows)
5. Build character selection screen
6. Implement Excalidraw canvas with Liveblocks
7. Create game layout with all UI components
8. Test Korean IME input thoroughly
9. Optimize for streaming (OBS layout testing)
