import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { brand, colors } from "@funberry/config";

/**
 * In-app subscription screen for mobile.
 * Uses RevenueCat for iOS/Android subscription management.
 * 
 * Setup requires:
 * 1. npm install react-native-purchases
 * 2. Configure RevenueCat dashboard with App Store / Play Store
 * 3. Create entitlements and offerings
 */
export default function SubscriptionScreen() {
  const router = useRouter();

  async function handleSubscribe(plan: "monthly" | "yearly") {
    // Placeholder: RevenueCat integration
    // import Purchases from 'react-native-purchases';
    // const offerings = await Purchases.getOfferings();
    // const pkg = plan === 'monthly'
    //   ? offerings.current?.monthly
    //   : offerings.current?.annual;
    // if (pkg) {
    //   const { customerInfo } = await Purchases.purchasePackage(pkg);
    //   if (customerInfo.entitlements.active['premium']) {
    //     // Update Supabase subscription tier
    //     router.replace('/(tabs)');
    //   }
    // }

    console.log(`Subscribe to ${plan} plan`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock every learning world and game!
        </Text>

        {/* Features */}
        <View style={styles.featuresBox}>
          {[
            "All Learning Worlds",
            "All Games Unlocked",
            "Detailed Progress Reports",
            "Up to 4 Child Profiles",
            "No Ads",
            "Offline Mode",
          ].map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Pressable
          style={[styles.planCard, styles.planPopular]}
          onPress={() => handleSubscribe("monthly")}
        >
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
          <Text style={styles.planName}>Monthly</Text>
          <Text style={styles.planPrice}>$4.99/mo</Text>
          <Text style={styles.planNote}>Cancel anytime</Text>
        </Pressable>

        <Pressable
          style={[styles.planCard, styles.planBest]}
          onPress={() => handleSubscribe("yearly")}
        >
          <View style={styles.bestBadge}>
            <Text style={styles.bestText}>BEST VALUE</Text>
          </View>
          <Text style={styles.planName}>Yearly</Text>
          <Text style={styles.planPrice}>$39.99/yr</Text>
          <Text style={styles.planNote}>$3.33/mo — save 33%</Text>
        </Pressable>

        <Text style={styles.terms}>
          Payment will be charged to your App Store or Google Play account.
          Subscriptions auto-renew unless cancelled 24 hours before the end of
          the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eff8ff" },
  content: { padding: 24, paddingBottom: 60, alignItems: "center" },
  closeBtn: {
    alignSelf: "flex-start",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  closeText: { fontSize: 18, fontWeight: "700", color: "#6b7280" },
  emoji: { fontSize: 60, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#1c498c" },
  subtitle: { fontSize: 15, color: "#6b7280", marginTop: 4, marginBottom: 24 },
  featuresBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkmark: { fontSize: 16, fontWeight: "700", color: "#18b05a" },
  featureText: { fontSize: 15, color: "#374151" },
  planCard: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
    borderWidth: 2,
  },
  planPopular: {
    backgroundColor: "#fff0f3",
    borderColor: "#ffc6d6",
  },
  planBest: {
    backgroundColor: "#edfcf2",
    borderColor: "#aceec2",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#ff2d6a",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularText: { color: "white", fontSize: 10, fontWeight: "800" },
  bestBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#18b05a",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bestText: { color: "white", fontSize: 10, fontWeight: "800" },
  planName: { fontSize: 18, fontWeight: "700", color: "#374151" },
  planPrice: { fontSize: 28, fontWeight: "800", color: "#1c498c", marginTop: 4 },
  planNote: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  terms: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
