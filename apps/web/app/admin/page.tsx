"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, signIn, signOut } from "@funberry/supabase";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  free_days: number;
  active: boolean;
  expires_at: string | null;
  max_redemptions: number | null;
  redeemed_count: number;
  note: string | null;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalChildren: number;
  premiumUsers: number;
  totalStars: number;
  totalGamesPlayed: number;
  totalPacks: number;
  activeCoupons: number;
  totalRedemptions: number;
  recentUsers: { email: string; name: string; subscription_tier: string; created_at: string }[];
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  expiresAt: string | null;
  createdAt: string;
  children: number;
  stars: number;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
}

type Phase = "loading" | "login" | "denied" | "config" | "ready";

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : "—";
}
function fmtDateTime(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : "Never";
}

export default function AdminPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [configError, setConfigError] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busyUser, setBusyUser] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [freeDays, setFreeDays] = useState(7);
  const [discount, setDiscount] = useState(100);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  const authedFetch = useCallback(async (path: string, init?: RequestInit) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    return fetch(path, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, []);

  const loadAll = useCallback(async (): Promise<Phase> => {
    const [s, u, c] = await Promise.all([
      authedFetch("/api/admin/stats"),
      authedFetch("/api/admin/users"),
      authedFetch("/api/admin/coupons"),
    ]);
    if ([s, u, c].some((r) => r.status === 503)) {
      const j = (await s.json().catch(() => ({}))) as { error?: string };
      setConfigError(j.error ?? "Server not configured.");
      return "config";
    }
    if ([s, u, c].some((r) => r.status === 401)) return "denied";

    const errs: string[] = [];
    const sj = await s.json();
    const uj = await u.json();
    const cj = await c.json();
    if (s.ok) setStats(sj as Stats);
    else errs.push(sj.error ?? "stats error");
    if (u.ok) setUsers((uj.users as AdminUser[]) ?? []);
    else errs.push(uj.error ?? "users error");
    if (c.ok) setCoupons((cj.coupons as Coupon[]) ?? []);
    else errs.push(cj.error ?? "coupons error");
    setLoadError(errs.length ? errs.join(" · ") : null);
    return "ready";
  }, [authedFetch]);

  const tryLoad = useCallback(async () => {
    try {
      setPhase(await loadAll());
    } catch {
      setPhase("login");
    }
  }, [loadAll]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) await tryLoad();
      else setPhase("login");
    })();
  }, [tryLoad]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      await signIn(email, password);
      await tryLoad();
    } catch {
      setLoginError("Wrong email or password.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function logout() {
    await signOut();
    setPhase("login");
    setStats(null);
    setUsers([]);
    setCoupons([]);
  }

  const refresh = useCallback(async () => {
    try {
      await loadAll();
    } catch {
      /* ignore */
    }
  }, [loadAll]);

  async function createCoupon() {
    setCreating(true);
    setMsg(null);
    try {
      const res = await authedFetch("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code,
          free_days: freeDays,
          discount_percent: discount,
          expires_at: expiresAt || null,
          max_redemptions: maxRedemptions ? Number(maxRedemptions) : null,
          note: note || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) setMsg({ text: json.error ?? "Could not create coupon.", ok: false });
      else {
        setMsg({ text: `Coupon ${json.coupon.code} created.`, ok: true });
        setCode("");
        setNote("");
        setExpiresAt("");
        setMaxRedemptions("");
        await refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  async function toggleCoupon(c: Coupon) {
    await authedFetch("/api/admin/coupons", { method: "PATCH", body: JSON.stringify({ id: c.id, active: !c.active }) });
    await refresh();
  }
  async function deleteCoupon(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await authedFetch("/api/admin/coupons", { method: "DELETE", body: JSON.stringify({ id: c.id }) });
    await refresh();
  }

  async function userAction(u: AdminUser, action: "grant" | "revoke", days?: number) {
    if (action === "revoke" && !confirm(`Revoke premium for ${u.email}?`)) return;
    setBusyUser(u.id);
    try {
      await authedFetch("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId: u.id, action, days }),
      });
      await refresh();
    } finally {
      setBusyUser(null);
    }
  }

  const recentLogins = useMemo(
    () =>
      [...users]
        .filter((u) => u.lastSignInAt)
        .sort((a, b) => new Date(b.lastSignInAt!).getTime() - new Date(a.lastSignInAt!).getTime())
        .slice(0, 10),
    [users],
  );

  const isActivePremium = (u: AdminUser) =>
    u.tier !== "free" && (!u.expiresAt || new Date(u.expiresAt).getTime() > Date.now());

  // ── Loading ──
  if (phase === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400">
        <p>Checking access…</p>
      </main>
    );
  }

  // ── Config error ──
  if (phase === "config") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
        <div className="max-w-md rounded-2xl border border-amber-700 bg-slate-800 p-8 text-center">
          <div className="mb-3 text-4xl">⚙️</div>
          <h1 className="mb-2 text-lg font-bold text-amber-300">Admin not configured</h1>
          <p className="text-sm text-slate-300">{configError}</p>
          <p className="mt-3 text-xs text-slate-500">
            Set the environment variables in Vercel and run migration 018, then reload.
          </p>
          <button
            onClick={() => location.reload()}
            className="mt-5 rounded-lg bg-slate-700 px-5 py-2 text-sm font-bold text-slate-100 hover:bg-slate-600"
          >
            Reload
          </button>
        </div>
      </main>
    );
  }

  // ── Login / denied ──
  if (phase === "login" || phase === "denied") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center shadow-2xl"
        >
          <div className="mb-4 text-4xl">🔐</div>
          <h1 className="mb-1 text-lg font-bold text-slate-100">Admin access</h1>
          <p className="mb-5 text-xs text-slate-400">Sign in with an authorized admin account.</p>
          {phase === "denied" && (
            <p className="mb-4 rounded-lg bg-rose-900/50 px-3 py-2 text-sm text-rose-300">
              This account is not on the admin allowlist.
            </p>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin email"
            autoComplete="username"
            className="mb-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
            required
          />
          {loginError && <p className="mt-3 text-sm text-rose-400">{loginError}</p>}
          <button
            type="submit"
            disabled={loginBusy}
            className="mt-5 w-full rounded-lg bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loginBusy ? "Signing in…" : "Sign in"}
          </button>
          {phase === "denied" && (
            <button type="button" onClick={logout} className="mt-3 text-xs font-bold text-slate-400 hover:text-slate-200">
              Sign out
            </button>
          )}
        </form>
      </main>
    );
  }

  // ── Control hub ──
  const statCards = [
    { label: "Registered users", value: stats?.totalUsers },
    { label: "Premium users", value: stats?.premiumUsers },
    { label: "Children", value: stats?.totalChildren },
    { label: "Total stars", value: stats?.totalStars },
    { label: "Games played", value: stats?.totalGamesPlayed },
    { label: "Learning packs", value: stats?.totalPacks },
    { label: "Active coupons", value: stats?.activeCoupons },
    { label: "Coupon redemptions", value: stats?.totalRedemptions },
  ];

  return (
    <main className="min-h-screen bg-slate-900 p-4 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">FunBerry Control Hub</h1>
            <p className="text-sm text-slate-400">Private admin — do not share.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-bold hover:bg-slate-600">
              Refresh
            </button>
            <button onClick={logout} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-slate-700">
              Sign out
            </button>
          </div>
        </header>

        {loadError && (
          <div className="mb-4 rounded-lg bg-amber-900/40 px-4 py-2 text-sm font-semibold text-amber-300">
            Some data could not load: {loadError}
          </div>
        )}

        {/* Metrics */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-3xl font-black text-violet-300">{s.value ?? "—"}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{s.label}</p>
            </div>
          ))}
        </section>

        {msg && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm font-semibold ${msg.ok ? "bg-emerald-900/50 text-emerald-300" : "bg-rose-900/50 text-rose-300"}`}>
            {msg.text}
          </div>
        )}

        {/* Users */}
        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-lg font-bold">Users ({users.length})</h2>
          {users.length === 0 ? (
            <p className="text-sm text-slate-400">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2 pr-3">Kids</th>
                    <th className="py-2 pr-3">Stars</th>
                    <th className="py-2 pr-3">Joined</th>
                    <th className="py-2 pr-3">Last login</th>
                    <th className="py-2 pr-3">Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-700 align-top">
                      <td className="py-2 pr-3">
                        <div className="font-semibold text-slate-200">{u.name || "—"}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                        {!u.emailConfirmed && <span className="text-[10px] font-bold text-amber-400">unverified</span>}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActivePremium(u) ? "bg-emerald-900/60 text-emerald-300" : "bg-slate-700 text-slate-400"}`}
                        >
                          {isActivePremium(u) ? u.tier.replace("premium_", "") : "free"}
                        </span>
                        {u.expiresAt && (
                          <div className="mt-0.5 text-[10px] text-slate-500">until {fmtDate(u.expiresAt)}</div>
                        )}
                      </td>
                      <td className="py-2 pr-3">{u.children}</td>
                      <td className="py-2 pr-3">{u.stars}</td>
                      <td className="py-2 pr-3 text-xs text-slate-400">{fmtDate(u.createdAt)}</td>
                      <td className="py-2 pr-3 text-xs text-slate-400">{fmtDateTime(u.lastSignInAt)}</td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            disabled={busyUser === u.id}
                            onClick={() => userAction(u, "grant", 7)}
                            className="rounded-md bg-violet-700 px-2 py-1 text-[11px] font-bold hover:bg-violet-600 disabled:opacity-50"
                          >
                            +7d
                          </button>
                          <button
                            disabled={busyUser === u.id}
                            onClick={() => userAction(u, "grant", 30)}
                            className="rounded-md bg-violet-700 px-2 py-1 text-[11px] font-bold hover:bg-violet-600 disabled:opacity-50"
                          >
                            +30d
                          </button>
                          <button
                            disabled={busyUser === u.id}
                            onClick={() => userAction(u, "revoke")}
                            className="rounded-md bg-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-600 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent logins */}
        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-lg font-bold">Recent logins</h2>
          {recentLogins.length === 0 ? (
            <p className="text-sm text-slate-400">No logins recorded yet.</p>
          ) : (
            <div className="space-y-1.5">
              {recentLogins.map((u) => (
                <div key={u.id} className="flex items-center justify-between border-b border-slate-700/60 py-1.5 text-sm">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200">{u.name || "—"}</span>{" "}
                    <span className="text-slate-400">{u.email}</span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{fmtDateTime(u.lastSignInAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Create coupon */}
        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-lg font-bold">Create a coupon</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-bold text-slate-400">
              Code
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME1WEEK" className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Free access (days)
              <input type="number" min={0} value={freeDays} onChange={(e) => setFreeDays(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Discount % (info)
              <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Expires (optional)
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Max redemptions (optional)
              <input type="number" min={1} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} placeholder="Unlimited" className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Note (optional)
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Launch promo" className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400" />
            </label>
          </div>
          <button onClick={createCoupon} disabled={creating || !code} className="mt-4 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50">
            {creating ? "Creating…" : "+ Create coupon"}
          </button>
        </section>

        {/* Coupon list */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-lg font-bold">Coupons ({coupons.length})</h2>
          {coupons.length === 0 ? (
            <p className="text-sm text-slate-400">No coupons yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Code</th>
                    <th className="py-2 pr-4">Free days</th>
                    <th className="py-2 pr-4">Disc %</th>
                    <th className="py-2 pr-4">Used</th>
                    <th className="py-2 pr-4">Expires</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-t border-slate-700">
                      <td className="py-2 pr-4 font-mono font-bold text-violet-300">{c.code}</td>
                      <td className="py-2 pr-4">{c.free_days}</td>
                      <td className="py-2 pr-4">{c.discount_percent}%</td>
                      <td className="py-2 pr-4">
                        {c.redeemed_count}
                        {c.max_redemptions != null ? ` / ${c.max_redemptions}` : ""}
                      </td>
                      <td className="py-2 pr-4">{fmtDate(c.expires_at)}</td>
                      <td className="py-2 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.active ? "bg-emerald-900/60 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                          {c.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <button onClick={() => toggleCoupon(c)} className="rounded-md bg-slate-700 px-2.5 py-1 text-xs font-bold hover:bg-slate-600">
                            {c.active ? "Disable" : "Enable"}
                          </button>
                          <button onClick={() => deleteCoupon(c)} className="rounded-md bg-rose-900/70 px-2.5 py-1 text-xs font-bold text-rose-200 hover:bg-rose-800">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
