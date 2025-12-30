// Core game state types for Catch AI Mind

export type GamePhase =
  | 'LOBBY'
  | 'ROUND_START'
  | 'DRAWING'
  | 'ROUND_END'
  | 'AD_BREAK'
  | 'GAME_END';

export type PlayerRole = 'DRAWER' | 'GUESSER';

export type AICharacter = 'chatgpt' | 'gemini' | 'claude' | 'grok' | 'deepseek';

export type WordDifficulty = 'easy' | 'medium' | 'hard';

export interface WordEntry {
  id: string;
  word: string;
  synonyms: string[];
  category: string;
  difficulty: WordDifficulty;
  hints?: string[];
}

export interface GuessResult {
  guess: string;
  timestamp: number;
  by: 'streamer' | 'ai';
  isCorrect: boolean;
  matchType?: string;
  confidence?: number;
  pointsAwarded?: number;
}

export interface GameSettings {
  roundTime: number; // seconds
  totalRounds: number;
  difficulty: WordDifficulty;
  selectedAI: AICharacter;
}

export interface GameState {
  // Game metadata
  phase: GamePhase;

  // Round tracking
  currentRound: number;
  totalRounds: number;

  // Player state
  streamerRole: PlayerRole;
  aiRole: PlayerRole;

  // Current round data (currentWord is stored server-side only!)
  roundStartTime: number; // Unix timestamp
  roundDuration: number;  // milliseconds

  // Scores
  streamerScore: number;
  aiScore: number;

  // History
  guessHistory: GuessResult[];

  // Settings
  selectedAI: AICharacter;
  difficulty: WordDifficulty;
}

export interface RoundResult {
  roundNumber: number;
  word: string;
  drawer: 'streamer' | 'ai';
  guesser: 'streamer' | 'ai';
  correctGuess: boolean;
  guessTime?: number; // seconds to correct guess
  pointsAwarded: {
    streamer: number;
    ai: number;
  };
}
