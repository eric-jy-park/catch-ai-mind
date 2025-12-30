import type { WordDifficulty } from '@/types/game-state';

  // Define the session structure
  export interface GameSession {
    currentWord: { 
      word: string; 
      category: string; 
      difficulty: string;
      synonyms: string[];
    };
    usedWordIds: Set<string>;
    difficulty: WordDifficulty;
  }

// Use global to persist data across hot reloads in development
// and ensuring singleton in serverless functions (where possible)
const globalForGame = global as unknown as { gameSessions: Map<string, GameSession> };

if (!globalForGame.gameSessions) {
  globalForGame.gameSessions = new Map<string, GameSession>();
}

export const gameStore = {
  sessions: globalForGame.gameSessions,
  
  getSession(roomId: string) {
    return this.sessions.get(roomId);
  },
  
  createSession(roomId: string, data: GameSession) {
    this.sessions.set(roomId, data);
    return data;
  },
  
  deleteSession(roomId: string) {
    return this.sessions.delete(roomId);
  }
};
