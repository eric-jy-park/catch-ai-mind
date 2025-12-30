import type { WordEntry, WordDifficulty } from '@/types/game-state';
import easyWords from '@/data/words/easy.json';
import mediumWords from '@/data/words/medium.json';
import hardWords from '@/data/words/hard.json';

export class WordManager {
  private static wordCache: Map<WordDifficulty, WordEntry[]> = new Map();
  private static initialized = false;

  /**
   * Initialize word cache from JSON files
   */
  public static initialize(): void {
    if (this.initialized) return;

    this.wordCache.set('easy', easyWords.words as WordEntry[]);
    this.wordCache.set('medium', mediumWords.words as WordEntry[]);
    this.wordCache.set('hard', hardWords.words as WordEntry[]);

    this.initialized = true;
  }

  /**
   * Get random word by difficulty, excluding used IDs
   */
  public static getRandomWord(
    difficulty: WordDifficulty,
    excludeIds: Set<string> = new Set()
  ): WordEntry | null {
    if (!this.initialized) {
      this.initialize();
    }

    const words = this.wordCache.get(difficulty) || [];
    const available = words.filter(w => !excludeIds.has(w.id));

    if (available.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  /**
   * Get word by ID
   */
  public static getWordById(id: string): WordEntry | null {
    if (!this.initialized) {
      this.initialize();
    }

    for (const words of this.wordCache.values()) {
      const word = words.find(w => w.id === id);
      if (word) return word;
    }

    return null;
  }

  /**
   * Get all words by difficulty
   */
  public static getWordsByDifficulty(difficulty: WordDifficulty): WordEntry[] {
    if (!this.initialized) {
      this.initialize();
    }

    return this.wordCache.get(difficulty) || [];
  }

  /**
   * Get total word count
   */
  public static getTotalCount(): number {
    if (!this.initialized) {
      this.initialize();
    }

    let total = 0;
    for (const words of this.wordCache.values()) {
      total += words.length;
    }
    return total;
  }

  /**
   * Get word count by difficulty
   */
  public static getCountByDifficulty(difficulty: WordDifficulty): number {
    if (!this.initialized) {
      this.initialize();
    }

    const words = this.wordCache.get(difficulty) || [];
    return words.length;
  }

  /**
   * Validate word bank integrity
   */
  public static validateWordBank(): {
    valid: boolean;
    errors: string[];
  } {
    if (!this.initialized) {
      this.initialize();
    }

    const errors: string[] = [];
    const allIds = new Set<string>();

    for (const [difficulty, words] of this.wordCache) {
      if (words.length < 10) {
        errors.push(`${difficulty} has only ${words.length} words (recommended minimum: 100)`);
      }

      for (const word of words) {
        // Check for duplicate IDs across all difficulties
        if (allIds.has(word.id)) {
          errors.push(`Duplicate ID found: ${word.id}`);
        }
        allIds.add(word.id);

        // Validate word structure
        if (!word.word || word.word.trim().length === 0) {
          errors.push(`Empty word in ${difficulty}: ${word.id}`);
        }

        if (!word.synonyms || word.synonyms.length === 0) {
          errors.push(`No synonyms for ${word.id}`);
        }

        if (!word.category) {
          errors.push(`No category for ${word.id}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get word statistics
   */
  public static getStatistics() {
    if (!this.initialized) {
      this.initialize();
    }

    const stats = {
      total: this.getTotalCount(),
      easy: this.getCountByDifficulty('easy'),
      medium: this.getCountByDifficulty('medium'),
      hard: this.getCountByDifficulty('hard'),
      categories: new Map<string, number>(),
    };

    // Count words per category
    for (const words of this.wordCache.values()) {
      for (const word of words) {
        const count = stats.categories.get(word.category) || 0;
        stats.categories.set(word.category, count + 1);
      }
    }

    return stats;
  }
}

// Initialize on import (for server-side usage)
if (typeof window === 'undefined') {
  WordManager.initialize();
}
