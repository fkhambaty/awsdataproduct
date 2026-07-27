import { NextResponse } from "next/server";
import { getServiceClient, verifyAdminPin } from "../auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/stats — high-level counts + recent sign-ups. Requires x-admin-pin. */
export async function GET(request: Request) {
  if (!verifyAdminPin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = getServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured (service role)." }, { status: 503 });
  }

  const [usersRes, childrenRes, premiumRes, activeCouponRes, redemptionRes, recentRes] = await Promise.all([
    admin.from("parents").select("*", { count: "exact", head: true }),
    admin.from("children").select("*", { count: "exact", head: true }),
    admin.from("parents").select("*", { count: "exact", head: true }).neq("subscription_tier", "free"),
    admin.from("coupons").select("*", { count: "exact", head: true }).eq("active", true),
    admin.from("coupon_redemptions").select("*", { count: "exact", head: true }),
    admin
      .from("parents")
      .select("email, name, subscription_tier, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    totalUsers: usersRes.count ?? 0,
    totalChildren: childrenRes.count ?? 0,
    premiumUsers: premiumRes.count ?? 0,
    activeCoupons: activeCouponRes.count ?? 0,
    totalRedemptions: redemptionRes.count ?? 0,
    recentUsers: recentRes.data ?? [],
  });
}
