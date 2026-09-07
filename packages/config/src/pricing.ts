export const pricing = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: null,
    features: [
      "3 Learning Zones",
      "2 Games per Zone",
      "Basic Progress Tracking",
      "1 Child Profile",
    ],
    maxChildren: 1,
    maxFreeGamesPerZone: 2,
  },
  /** INR auto-renew via Razorpay (FunBerryKids web). */
  premiumWeeklyInr: {
    id: "premium_weekly",
    name: "Premium Weekly",
    priceInr: 99,
    period: "week" as const,
    razorpayEnvPlanKey: "RAZORPAY_PLAN_WEEKLY_ID" as const,
    features: [
      "All learning zones",
      "All games unlocked",
      "Detailed reports",
      "Auto-renews weekly",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
  premiumMonthlyInr: {
    id: "premium_monthly",
    name: "Premium Monthly",
    priceInr: 349,
    period: "month" as const,
    razorpayEnvPlanKey: "RAZORPAY_PLAN_MONTHLY_ID" as const,
    features: [
      "All learning zones",
      "All games unlocked",
      "Detailed reports",
      "Auto-renews monthly",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
  premiumMonthly: {
    id: "premium_monthly",
    name: "Premium Monthly",
    price: 4.99,
    period: "month" as const,
    stripeProductId: "prod_funberrykids_monthly",
    stripePriceId: "price_funberrykids_monthly",
    revenueCatProductId: "funberrykids_premium_monthly",
    features: [
      "All Learning Worlds",
      "All Games Unlocked",
      "Detailed Progress Reports",
      "Up to 4 Child Profiles",
      "No Ads",
      "Offline Mode",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
  premiumYearly: {
    id: "premium_yearly",
    name: "Premium Yearly",
    price: 39.99,
    period: "year" as const,
    stripeProductId: "prod_funberrykids_yearly",
    stripePriceId: "price_funberrykids_yearly",
    revenueCatProductId: "funberrykids_premium_yearly",
    features: [
      "All Learning Worlds",
      "All Games Unlocked",
      "Detailed Progress Reports",
      "Up to 4 Child Profiles",
      "No Ads",
      "Offline Mode",
      "Save 33%!",
    ],
    maxChildren: 4,
    maxFreeGamesPerZone: Infinity,
  },
} as const;

export type PricingTier = keyof typeof pricing;
export type SubscriptionTier =
  | "free"
  | "premium_weekly"
  | "premium_monthly"
  | "premium_yearly"
  | "lifetime";

export function isPremium(tier: SubscriptionTier): boolean {
  return (
    tier === "premium_weekly" ||
    tier === "premium_monthly" ||
    tier === "premium_yearly" ||
    tier === "lifetime"
  );
}
