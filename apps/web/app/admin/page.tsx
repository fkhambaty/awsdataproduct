"use client";

import { useCallback, useEffect, useState } from "react";

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
  activeCoupons: number;
  totalRedemptions: number;
  recentUsers: { email: string; name: string; subscription_tier: string; created_at: string }[];
}

const PIN_KEY = "fb_admin_pin";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pinError, setPinError] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // New coupon form
  const [code, setCode] = useState("");
  const [freeDays, setFreeDays] = useState(7);
  const [discount, setDiscount] = useState(100);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  const adminFetch = useCallback(
    (path: string, init?: RequestInit, overridePin?: string) =>
      fetch(path, {
        ...init,
        headers: { ...(init?.headers ?? {}), "x-admin-pin": overridePin ?? pin, "Content-Type": "application/json" },
      }),
    [pin],
  );

  const loadAll = useCallback(
    async (usePin: string) => {
      const [statsRes, couponsRes] = await Promise.all([
        adminFetch("/api/admin/stats", {}, usePin),
        adminFetch("/api/admin/coupons", {}, usePin),
      ]);
      if (statsRes.status === 401 || couponsRes.status === 401) {
        throw new Error("unauthorized");
      }
      const s = (await statsRes.json()) as Stats;
      const c = (await couponsRes.json()) as { coupons: Coupon[] };
      setStats(s);
      setCoupons(c.coupons ?? []);
    },
    [adminFetch],
  );

  const authenticate = useCallback(
    async (candidate: string) => {
      setChecking(true);
      setPinError("");
      try {
        await loadAll(candidate);
        setPin(candidate);
        setAuthed(true);
        try {
          sessionStorage.setItem(PIN_KEY, candidate);
        } catch {
          /* ignore */
        }
      } catch {
        setPinError("Wrong PIN.");
        setAuthed(false);
        try {
          sessionStorage.removeItem(PIN_KEY);
        } catch {
          /* ignore */
        }
      } finally {
        setChecking(false);
      }
    },
    [loadAll],
  );

  // Try a saved PIN on load.
  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem(PIN_KEY) ?? "";
    } catch {
      saved = "";
    }
    if (saved) void authenticate(saved);
  }, [authenticate]);

  async function refresh() {
    try {
      await loadAll(pin);
    } catch {
      /* ignore */
    }
  }

  async function createCoupon() {
    setCreating(true);
    setMsg(null);
    try {
      const res = await adminFetch("/api/admin/coupons", {
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
      if (!res.ok) {
        setMsg({ text: json.error ?? "Could not create coupon.", ok: false });
      } else {
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
    await adminFetch("/api/admin/coupons", {
      method: "PATCH",
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    await refresh();
  }

  async function deleteCoupon(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}? This cannot be undone.`)) return;
    await adminFetch("/api/admin/coupons", { method: "DELETE", body: JSON.stringify({ id: c.id }) });
    await refresh();
  }

  function logout() {
    try {
      sessionStorage.removeItem(PIN_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setPin("");
    setStats(null);
    setCoupons([]);
  }

  // ── PIN gate ──
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void authenticate(pin);
          }}
          className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center shadow-2xl"
        >
          <div className="mb-4 text-4xl">🔐</div>
          <h1 className="mb-1 text-lg font-bold text-slate-100">Admin access</h1>
          <p className="mb-5 text-xs text-slate-400">Enter your control PIN.</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-center text-2xl tracking-[0.4em] text-slate-100 outline-none focus:border-violet-400"
            placeholder="••••••"
          />
          {pinError && <p className="mt-3 text-sm text-rose-400">{pinError}</p>}
          <button
            type="submit"
            disabled={checking}
            className="mt-5 w-full rounded-lg bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {checking ? "Checking…" : "Enter"}
          </button>
        </form>
      </main>
    );
  }

  // ── Admin dashboard ──
  return (
    <main className="min-h-screen bg-slate-900 p-4 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-5xl">
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
              Lock
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Registered users", value: stats?.totalUsers },
            { label: "Premium users", value: stats?.premiumUsers },
            { label: "Children", value: stats?.totalChildren },
            { label: "Active coupons", value: stats?.activeCoupons },
            { label: "Coupon redemptions", value: stats?.totalRedemptions },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-3xl font-black text-violet-300">{s.value ?? "—"}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{s.label}</p>
            </div>
          ))}
        </section>

        {msg && (
          <div
            className={`mb-4 rounded-lg px-4 py-2 text-sm font-semibold ${msg.ok ? "bg-emerald-900/50 text-emerald-300" : "bg-rose-900/50 text-rose-300"}`}
          >
            {msg.text}
          </div>
        )}

        {/* Create coupon */}
        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-lg font-bold">Create a coupon</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-bold text-slate-400">
              Code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="WELCOME1WEEK"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Free access (days)
              <input
                type="number"
                min={0}
                value={freeDays}
                onChange={(e) => setFreeDays(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Discount % (info)
              <input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Expires (optional)
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Max redemptions (optional)
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                placeholder="Unlimited"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="text-xs font-bold text-slate-400">
              Note (optional)
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Launch promo"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
          </div>
          <button
            onClick={createCoupon}
            disabled={creating || !code}
            className="mt-4 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {creating ? "Creating…" : "+ Create coupon"}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            &ldquo;Free access (days)&rdquo; is what a user gets on redeem (e.g. 7 = one week free). Discount % is stored
            for your records / future paid-checkout discounts.
          </p>
        </section>

        {/* Coupon list */}
        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
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
                      <td className="py-2 pr-4">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.active ? "bg-emerald-900/60 text-emerald-300" : "bg-slate-700 text-slate-400"}`}
                        >
                          {c.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleCoupon(c)}
                            className="rounded-md bg-slate-700 px-2.5 py-1 text-xs font-bold hover:bg-slate-600"
                          >
                            {c.active ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => deleteCoupon(c)}
                            className="rounded-md bg-rose-900/70 px-2.5 py-1 text-xs font-bold text-rose-200 hover:bg-rose-800"
                          >
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

        {/* Recent sign-ups */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-lg font-bold">Recent sign-ups</h2>
          {stats?.recentUsers?.length ? (
            <div className="space-y-1.5">
              {stats.recentUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-700/60 py-1.5 text-sm">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200">{u.name || "—"}</span>{" "}
                    <span className="text-slate-400">{u.email}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`text-xs font-bold ${u.subscription_tier === "free" ? "text-slate-500" : "text-emerald-400"}`}>
                      {u.subscription_tier}
                    </span>
                    <span className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No users yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
