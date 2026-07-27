import { NextResponse } from "next/server";
import { getServiceClient, verifyAdminUser } from "../auth";

export const dynamic = "force-dynamic";

interface ParentRow {
  id: string;
  email: string;
  name: string | null;
  subscription_tier: string;
  subscription_expires_at: string | null;
  created_at: string;
}

/** GET /api/admin/users — full user list with last login, children count, stars, tier. */
export async function GET(request: Request) {
  const admin = getServiceClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Server not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel." },
      { status: 503 },
    );
  }
  if (!(await verifyAdminUser(request, admin))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: parentsData } = await admin
    .from("parents")
    .select("id, email, name, subscription_tier, subscription_expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  const parents = (parentsData as ParentRow[] | null) ?? [];

  // Children counts + total stars per parent.
  const childAgg = new Map<string, { children: number; stars: number }>();
  try {
    const { data: kids } = await admin.from("children").select("parent_id, total_stars");
    for (const k of (kids as { parent_id: string; total_stars: number | null }[] | null) ?? []) {
      const cur = childAgg.get(k.parent_id) ?? { children: 0, stars: 0 };
      cur.children += 1;
      cur.stars += k.total_stars ?? 0;
      childAgg.set(k.parent_id, cur);
    }
  } catch {
    /* ignore */
  }

  // Last sign-in from auth.users (paginated).
  const authMap = new Map<string, { lastSignInAt: string | null; emailConfirmed: boolean }>();
  try {
    for (let page = 1; page <= 10; page += 1) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      const users = data?.users ?? [];
      for (const u of users) {
        authMap.set(u.id, {
          lastSignInAt: u.last_sign_in_at ?? null,
          emailConfirmed: Boolean(u.email_confirmed_at),
        });
      }
      if (users.length < 1000) break;
    }
  } catch {
    /* ignore */
  }

  const users = parents.map((p) => {
    const agg = childAgg.get(p.id) ?? { children: 0, stars: 0 };
    const auth = authMap.get(p.id) ?? { lastSignInAt: null, emailConfirmed: false };
    return {
      id: p.id,
      email: p.email,
      name: p.name,
      tier: p.subscription_tier,
      expiresAt: p.subscription_expires_at,
      createdAt: p.created_at,
      children: agg.children,
      stars: agg.stars,
      lastSignInAt: auth.lastSignInAt,
      emailConfirmed: auth.emailConfirmed,
    };
  });

  return NextResponse.json({ users });
}

/** PATCH /api/admin/users — grant or revoke premium for a specific user. */
export async function PATCH(request: Request) {
  const admin = getServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }
  if (!(await verifyAdminUser(request, admin))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { userId?: string; action?: "grant" | "revoke"; days?: number };
  if (!body.userId || (body.action !== "grant" && body.action !== "revoke")) {
    return NextResponse.json({ error: "Provide userId and action ('grant' | 'revoke')." }, { status: 400 });
  }

  const updates =
    body.action === "grant"
      ? {
          subscription_tier: "premium_monthly",
          subscription_expires_at: new Date(Date.now() + Math.max(1, body.days ?? 7) * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        }
      : {
          subscription_tier: "free",
          subscription_expires_at: null,
          updated_at: new Date().toISOString(),
        };

  const { error } = await admin.from("parents").update(updates).eq("id", body.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
