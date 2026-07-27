import { NextResponse } from "next/server";
import { getServiceClient, verifyAdminUser } from "../auth";

export const dynamic = "force-dynamic";

async function guard(request: Request) {
  const admin = getServiceClient();
  if (!admin) {
    return {
      error: NextResponse.json(
        { error: "Server not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel." },
        { status: 503 },
      ),
      admin: null,
    };
  }
  if (!(await verifyAdminUser(request, admin))) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), admin: null };
  }
  return { error: null, admin };
}

/** GET /api/admin/coupons — list all coupons (newest first). */
export async function GET(request: Request) {
  const { error, admin } = await guard(request);
  if (error) return error;
  const { data, error: dbErr } = await admin.from("coupons").select("*").order("created_at", { ascending: false });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

/** POST /api/admin/coupons — create a coupon. */
export async function POST(request: Request) {
  const { error, admin } = await guard(request);
  if (error) return error;

  const body = (await request.json()) as {
    code?: string;
    free_days?: number;
    discount_percent?: number;
    expires_at?: string | null;
    max_redemptions?: number | null;
    note?: string | null;
    active?: boolean;
  };

  const code = (body.code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return NextResponse.json({ error: "Code must be 3–32 letters, numbers, - or _." }, { status: 400 });
  }
  const free_days = Math.max(0, Math.floor(Number(body.free_days ?? 7)));
  const discount_percent = Math.min(100, Math.max(0, Math.floor(Number(body.discount_percent ?? 100))));

  const { data, error: dbErr } = await admin
    .from("coupons")
    .insert({
      code,
      free_days,
      discount_percent,
      active: body.active ?? true,
      expires_at: body.expires_at || null,
      max_redemptions:
        body.max_redemptions == null || Number.isNaN(Number(body.max_redemptions))
          ? null
          : Math.max(1, Math.floor(Number(body.max_redemptions))),
      note: body.note || null,
    })
    .select()
    .single();

  if (dbErr) {
    const msg = /duplicate|unique/i.test(dbErr.message) ? "That code already exists." : dbErr.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ coupon: data });
}

/** PATCH /api/admin/coupons — update fields (e.g. toggle active). */
export async function PATCH(request: Request) {
  const { error, admin } = await guard(request);
  if (error) return error;

  const body = (await request.json()) as {
    id?: string;
    active?: boolean;
    free_days?: number;
    discount_percent?: number;
    expires_at?: string | null;
    max_redemptions?: number | null;
    note?: string | null;
  };
  if (!body.id) return NextResponse.json({ error: "Missing coupon id." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof body.active === "boolean") updates.active = body.active;
  if (body.free_days != null) updates.free_days = Math.max(0, Math.floor(Number(body.free_days)));
  if (body.discount_percent != null)
    updates.discount_percent = Math.min(100, Math.max(0, Math.floor(Number(body.discount_percent))));
  if (body.expires_at !== undefined) updates.expires_at = body.expires_at || null;
  if (body.max_redemptions !== undefined)
    updates.max_redemptions =
      body.max_redemptions == null ? null : Math.max(1, Math.floor(Number(body.max_redemptions)));
  if (body.note !== undefined) updates.note = body.note || null;

  const { data, error: dbErr } = await admin.from("coupons").update(updates).eq("id", body.id).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 400 });
  return NextResponse.json({ coupon: data });
}

/** DELETE /api/admin/coupons — remove a coupon. Body: { id }. */
export async function DELETE(request: Request) {
  const { error, admin } = await guard(request);
  if (error) return error;
  const body = (await request.json()) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "Missing coupon id." }, { status: 400 });
  const { error: dbErr } = await admin.from("coupons").delete().eq("id", body.id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
