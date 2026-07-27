import type { GameResult } from "../types";

/**
 * Calculate star rating based on accuracy percentage.
 *
 * Finishing a round ALWAYS earns at least 1 star — this guarantees the star-credit
 * system never looks "broken" to parents and keeps the reward loop encouraging.
 * Better accuracy earns more:
 * 3 stars: >= 90%
 * 2 stars: >= 60%
 * 1 star:  < 60% (floor for completing the round)
 */
export function calculateStars(score: number, maxScore: number): number {
  if (maxScore <= 0) return 1;
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return 3;
  if (pct >= 60) return 2;
  return 1;
}

export function buildGameResult(
  score: number,
  maxScore: number,
  timeSpent: number
): GameResult {
  const starsEarned = calculateStars(score, maxScore);
  const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, starsEarned, timeSpent, accuracy };
}

export function getEncouragementMessage(stars: number): string {
  switch (stars) {
    case 3:
      return "AMAZING! You're a superstar! 🌟";
    case 2:
      return "Great work! Almost perfect! 🎉";
    case 1:
      return "Good job! Keep trying! 👏";
    default:
      return "Nice try! Let's do it again! 💪";
  }
}
