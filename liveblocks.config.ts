'use client'

import { createClient, type LsonObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

export type Presence = {
  cursor: { x: number; y: number } | null;
  playerStatus: "active" | "thinking" | "idle" | "drawing";
  lastActivity: number;
};

export type Storage = LsonObject & {
  gameState?: any;
  canvasElements?: any[];
};

export type UserMeta = {
  id: string;
  info: {
    name: string;
    role: "streamer" | "ai";
    avatar?: string;
  };
};

export type RoomEvent =
  | { type: "guess_submitted"; guess: string; by: "streamer" | "ai"; timestamp: number }
  | { type: "timer_tick"; remaining: number }
  | { type: "round_transition"; fromRound: number; toRound: number }
  | { type: "ai_thinking"; status: string; message?: string }
  | { type: "game_start"; startTime: number }
  | { type: "round_end"; winner: "streamer" | "ai" | "draw"; word: string }
  | { type: "game_end"; finalScores: { streamer: number; ai: number } };

const client = createClient({
  authEndpoint: "/api/liveblocks/auth",
  throttle: 16,
});

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useOthers,
    useSelf,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
