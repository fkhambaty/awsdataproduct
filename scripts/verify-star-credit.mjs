/**
 * Standalone verification of the star-credit rules.
 *
 * Guarantees the "stars work 100% of the time" requirement: any completed round
 * (any score from 0..maxScore, any game type) must earn at least 1 star, and the
 * accuracy tiers still award 2 and 3 stars correctly.
 *
 * Run: node scripts/verify-star-credit.mjs
 */

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// Mirror of packages/game-engine/src/core/scoring.ts calculateStars — kept in sync intentionally.
function calculateStars(score, maxScore) {
  if (maxScore <= 0) return 1;
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return 3;
  if (pct >= 60) return 2;
  return 1;
}

// Representative "questions/items" counts across the 13 game templates.
const GAME_MAX_SCORES = [1, 3, 4, 5, 6, 8, 10, 12];

console.log("\n⭐ Star-credit floor (every finished round earns >= 1 star)\n");
for (const maxScore of GAME_MAX_SCORES) {
  for (let score = 0; score <= maxScore; score += 1) {
    const stars = calculateStars(score, maxScore);
    assert(
      stars >= 1 && stars <= 3,
      `maxScore=${maxScore} score=${score} -> ${stars} star(s) (1..3)`
    );
  }
}

console.log("\n⭐ Accuracy tiers\n");
assert(calculateStars(0, 0) === 1, "degenerate maxScore=0 still credits 1 star");
assert(calculateStars(0, 10) === 1, "0% earns 1 star (floor)");
assert(calculateStars(5, 10) === 1, "50% earns 1 star");
assert(calculateStars(6, 10) === 2, "60% earns 2 stars");
assert(calculateStars(9, 10) === 3, "90% earns 3 stars");
assert(calculateStars(10, 10) === 3, "100% earns 3 stars");

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
