import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClient, verifyAdminUser } from "../auth";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function safeCount(admin: SupabaseClient, table: string, mod?: (q: any) => any): Promise<number> {
  try {
    let q: any = admin.from(table).select("*", { count: "exact", head: true });
    if (mod) q = mod(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** GET /api/admin/stats — platform metrics + recent sign-ups. Requires an admin session. */
export async function GET(request: Request) {
  const admin = getServiceClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Server not configured. Set SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in Vercel." },
      { status: 503 },
    );
  }
  if (!(await verifyAdminUser(request, admin))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalUsers, premiumUsers, totalChildren, activeCoupons, totalRedemptions, totalGamesPlayed, totalPacks] =
      await Promise.all([
        safeCount(admin, "parents"),
        safeCount(admin, "parents", (q) => q.neq("subscription_tier", "free")),
        safeCount(admin, "children"),
        safeCount(admin, "coupons", (q) => q.eq("active", true)),
        safeCount(admin, "coupon_redemptions"),
        safeCount(admin, "progress"),
        safeCount(admin, "learning_packs"),
      ]);

    let totalStars = 0;
    try {
      const { data } = await admin.from("children").select("total_stars");
      totalStars = ((data as { total_stars: number | null }[] | null) ?? []).reduce(
        (s, r) => s + (r.total_stars ?? 0),
        0,
      );
    } catch {
      /* ignore */
    }

    const { data: recent } = await admin
      .from("parents")
      .select("email, name, subscription_tier, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      totalChildren,
      totalStars,
      totalGamesPlayed,
      totalPacks,
      activeCoupons,
      totalRedemptions,
      recentUsers: recent ?? [],
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load stats" }, { status: 500 });
  }
}
