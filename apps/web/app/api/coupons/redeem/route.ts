import { NextResponse } from "next/server";
import { getServiceClient } from "../../admin/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/redeem
 * Header: Authorization: Bearer <Supabase access_token>
 * Body: { code }
 *
 * Validates the coupon and grants the parent `free_days` of premium access.
 */
export async function POST(request: Request) {
  const admin = getServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured (service role)." }, { status: 503 });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const {
    data: { user },
    error: authErr,
  } = await admin.auth.getUser(token);
  if (authErr || !user?.id) {
    return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  }

  const body = (await request.json()) as { code?: string };
  const code = (body.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });

  const { data: couponRow } = await admin.from("coupons").select("*").eq("code", code).maybeSingle();
  const coupon = couponRow as
    | {
        id: string;
        active: boolean;
        free_days: number;
        expires_at: string | null;
        max_redemptions: number | null;
        redeemed_count: number;
      }
    | null;

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "That coupon code is not valid." }, { status: 404 });
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This coupon has expired." }, { status: 410 });
  }
  if (coupon.max_redemptions != null && coupon.redeemed_count >= coupon.max_redemptions) {
    return NextResponse.json({ error: "This coupon has reached its limit." }, { status: 410 });
  }
  if (coupon.free_days <= 0) {
    return NextResponse.json({ error: "This code has no free access to grant." }, { status: 400 });
  }

  // One redemption per parent.
  const { data: already } = await admin
    .from("coupon_redemptions")
    .select("id")
    .eq("coupon_id", coupon.id)
    .eq("parent_id", user.id)
    .maybeSingle();
  if (already) {
    return NextResponse.json({ error: "You have already used this coupon." }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + coupon.free_days * 86400000).toISOString();

  // Record redemption first (unique constraint guards against double-grant races).
  const { error: redErr } = await admin
    .from("coupon_redemptions")
    .insert({ coupon_id: coupon.id, parent_id: user.id });
  if (redErr) {
    return NextResponse.json({ error: "You have already used this coupon." }, { status: 409 });
  }

  await admin
    .from("parents")
    .update({
      subscription_tier: "premium_monthly",
      subscription_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await admin
    .from("coupons")
    .update({ redeemed_count: coupon.redeemed_count + 1 })
    .eq("id", coupon.id);

  return NextResponse.json({ ok: true, freeDays: coupon.free_days, expiresAt });
}
