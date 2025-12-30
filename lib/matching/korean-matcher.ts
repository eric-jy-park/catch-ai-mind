import Hangul from 'hangul-js';
import type { WordEntry } from '@/types/game-state';

export interface MatchResult {
  isMatch: boolean;
  confidence: number; // 0-1
  matchType: 'exact' | 'synonym' | 'normalized' | 'fuzzy';
}

export class KoreanMatcher {
  private static FUZZY_THRESHOLD = 0.85; // 85% similarity required

  /**
   * Main entry point: Match a guess against a word entry
   */
  public static match(guess: string, wordEntry: WordEntry): MatchResult {
    // Layer 1: Exact match
    if (this.exactMatch(guess, wordEntry.word)) {
      return { isMatch: true, confidence: 1.0, matchType: 'exact' };
    }

    // Layer 1: Synonym match
    if (this.synonymMatch(guess, wordEntry.synonyms)) {
      return { isMatch: true, confidence: 1.0, matchType: 'synonym' };
    }

    // Layer 2: Normalized match (remove spaces, lowercase)
    if (this.normalizedMatch(guess, wordEntry.word)) {
      return { isMatch: true, confidence: 0.95, matchType: 'normalized' };
    }

    // Check synonyms with normalization
    for (const synonym of wordEntry.synonyms) {
      if (this.normalizedMatch(guess, synonym)) {
        return { isMatch: true, confidence: 0.95, matchType: 'normalized' };
      }
    }

    // Layer 3: Jamo-level fuzzy matching
    const similarity = this.jamoSimilarity(guess, wordEntry.word);
    if (similarity >= this.FUZZY_THRESHOLD) {
      return { isMatch: true, confidence: similarity, matchType: 'fuzzy' };
    }

    // Check fuzzy match against synonyms
    for (const synonym of wordEntry.synonyms) {
      const synSimilarity = this.jamoSimilarity(guess, synonym);
      if (synSimilarity >= this.FUZZY_THRESHOLD) {
        return { isMatch: true, confidence: synSimilarity, matchType: 'fuzzy' };
      }
    }

    return { isMatch: false, confidence: 0, matchType: 'exact' };
  }

  /**
   * Layer 1: Exact string match
   */
  private static exactMatch(guess: string, target: string): boolean {
    return guess === target;
  }

  /**
   * Layer 1: Synonym match
   */
  private static synonymMatch(guess: string, synonyms: string[]): boolean {
    return synonyms.includes(guess);
  }

  /**
   * Layer 2: Normalized match (remove spaces, trim)
   */
  private static normalizedMatch(guess: string, target: string): boolean {
    const normalize = (str: string) => str.replace(/\s+/g, '').trim().toLowerCase();
    return normalize(guess) === normalize(target);
  }

  /**
   * Layer 3: Jamo-level fuzzy matching using Levenshtein distance
   */
  private static jamoSimilarity(guess: string, target: string): number {
    // Decompose Korean characters into jamo (consonants + vowels)
    const guessJamo = Hangul.disassemble(guess).join('');
    const targetJamo = Hangul.disassemble(target).join('');

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(guessJamo, targetJamo);
    const maxLength = Math.max(guessJamo.length, targetJamo.length);

    if (maxLength === 0) return 1.0;

    // Convert distance to similarity (0-1)
    const similarity = 1 - (distance / maxLength);
    return similarity;
  }

  /**
   * Levenshtein distance algorithm
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create a matrix
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,     // deletion
            dp[i][j - 1] + 1,     // insertion
            dp[i - 1][j - 1] + 1  // substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Utility: Get similarity percentage for debugging
   */
  public static getSimilarity(guess: string, target: string): number {
    return this.jamoSimilarity(guess, target);
  }
}

// Export convenience function
export function matchGuess(guess: string, wordEntry: WordEntry): MatchResult {
  return KoreanMatcher.match(guess, wordEntry);
}
