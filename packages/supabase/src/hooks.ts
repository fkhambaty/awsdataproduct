import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabase } from "./client";
import {
  buildParentCoachingReport,
  FALLBACK_COACHING_AXES,
  FALLBACK_CONTRIBUTIONS,
  type CoachingContributionRow,
  type CoachingCoreCapabilityRow,
  type CoachingSkillAxisRow,
  type ParentCoachingReport,
  type ProgressRowLike,
  type SkillAxisCapabilityMapRow,
} from "./coachingReport";
import type {
  Child,
  Database,
  Parent,
  Progress,
  Unlock,
  Reward,
  LearningPack,
  PackPage,
} from "./types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export type SignUpOptions = {
  /** Overrides default web redirect after email confirmation (use Expo deep link on mobile). */
  emailRedirectTo?: string;
};

/**
 * Sign up a parent. Name and PIN are stored in auth user metadata so a DB trigger can
 * insert into `parents` even when email confirmation leaves the client without a session
 * (RLS would block a client-side insert).
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  pin?: string,
  options?: SignUpOptions
) {
  const defaultSite =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
    "https://funberrykids.in";
  const emailRedirectTo =
    options?.emailRedirectTo ?? `${defaultSite.replace(/\/$/, "")}/auth/confirm-email`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name: name,
        name,
        ...(pin ? { pin } : {}),
      },
    },
  });
  if (error) throw error;

  // Supabase returns an obfuscated user for existing confirmed accounts when confirmations are enabled.
  // Detect that shape and surface a clear, actionable message to the UI.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  // If confirmations are disabled, session exists — upsert parent for redundancy with trigger.
  if (data.session && data.user) {
    await supabase.from("parents").upsert(
      {
        id: data.user.id,
        email,
        name,
        ...(pin ? { pin } : {}),
      } as never,
      { onConflict: "id" }
    );
  }
  return data;
}

/** Resend the signup confirmation email (Supabase rate limits apply on free tier). */
export async function resendSignupConfirmation(email: string, redirectTo?: string) {
  const defaultSite =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
    "https://funberrykids.in";
  const emailRedirectTo =
    redirectTo ?? `${defaultSite.replace(/\/$/, "")}/auth/confirm-email`;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo },
  });
  if (error) throw error;
}

/**
 * Sends the one-time welcome email (Edge Function + Resend) using the caller's session.
 * Pass the app's Supabase client on React Native (SecureStore session); omit on web.
 * Safe to call on every login — the server skips if already sent.
 */
export async function trySendWelcomeEmailAfterAuth(
  client: SupabaseClient<Database> = supabase as SupabaseClient<Database>
): Promise<void> {
  const { error } = await client.functions.invoke("send-welcome-email", { body: {} });
  if (error && typeof console !== "undefined" && console.warn) {
    console.warn("[FunBerry] welcome email:", error.message);
  }
}

/**
 * Verify the 6-digit signup code emailed to the parent. On success the account's
 * email is confirmed (a DB trigger flips parents.email_verified to true) and a
 * short-lived session is returned by Supabase.
 */
export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: token.trim(),
    type: "signup",
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  void trySendWelcomeEmailAfterAuth();
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("funberrykids_timer");
      const keysToClear: string[] = [];
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("funberrykids_timer_")) keysToClear.push(key);
      }
      for (const key of keysToClear) sessionStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup errors in restricted browser contexts.
    }
  }
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

async function ensureParentRowFromAuth(user: User): Promise<void> {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    typeof meta.full_name === "string" && meta.full_name.trim()
      ? meta.full_name.trim()
      : typeof meta.name === "string" && meta.name.trim()
        ? meta.name.trim()
        : "";
  const pin =
    typeof meta.pin === "string" && meta.pin.trim() ? meta.pin.trim() : undefined;

  const payload = {
    id: user.id,
    email: user.email ?? "",
    name: fullName,
    ...(pin ? { pin } : {}),
  };

  await supabase.from("parents").upsert(payload as never, { onConflict: "id" });
}

// ── Parent ────────────────────────────────────────────────────────────────────

export async function getParent(): Promise<Parent | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("parents")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return null;
  return data as Parent;
}

export async function updateParentPin(pin: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("parents")
    .update({ pin } as never)
    .eq("id", user.id);
  if (error) throw error;
}

export async function verifyParentPin(pin: string): Promise<boolean> {
  const parent = await getParent();
  if (!parent || !parent.pin) return false;
  return parent.pin === pin;
}

export async function updateParentPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ── Children ──────────────────────────────────────────────────────────────────

export async function getChildren(): Promise<Child[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Child[];
}

/**
 * Add a child. photoUrl is a base64 data URL (e.g. "data:image/jpeg;base64,...")
 * or a cartoon-face emoji string. Stored in `photo_url` column.
 */
export async function addChild(
  name: string,
  age: number,
  photoUrl?: string | null
): Promise<Child> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await ensureParentRowFromAuth(user);

  const { data, error } = await supabase
    .from("children")
    .insert({
      parent_id: user.id,
      name,
      age,
      ...(photoUrl != null ? { photo_url: photoUrl } : {}),
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data as Child;
}

export async function updateChild(
  childId: string,
  name: string,
  age: number,
  photoUrl?: string | null
): Promise<Child> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("children")
    .update({
      name,
      age,
      ...(photoUrl !== undefined ? { photo_url: photoUrl } : {}),
    } as never)
    .eq("id", childId)
    .eq("parent_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Child;
}

export async function updateChildPhoto(childId: string, photoUrl: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("children")
    .update({ photo_url: photoUrl } as never)
    .eq("id", childId)
    .eq("parent_id", user.id);
  if (error) throw error;
}

// ── Progress ──────────────────────────────────────────────────────────────────

export async function getChildProgress(childId: string) {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Progress[];
}

/** Aggregate play telemetry across all children on the account (Grown-up Headquarters dashboard). */
export async function getFamilyPlayStats(): Promise<{
  totalSessions: number;
  uniqueGamesTouched: number;
  lastActivityAt: string | null;
}> {
  const { data, error } = await supabase.rpc("family_play_stats" as never);
  if (!error && data) {
    const row = (Array.isArray(data) ? data[0] : data) as {
      total_sessions?: number | string;
      unique_games_touched?: number | string;
      last_activity_at?: string | null;
    } | null;
    if (row) {
      return {
        totalSessions: Number(row.total_sessions ?? 0),
        uniqueGamesTouched: Number(row.unique_games_touched ?? 0),
        lastActivityAt: row.last_activity_at ?? null,
      };
    }
  }

  const kids = await getChildren();
  let totalSessions = 0;
  const gameIds = new Set<string>();
  let lastActivityAt: string | null = null;
  for (const k of kids) {
    const rows = await getChildProgress(k.id);
    totalSessions += rows.length;
    for (const r of rows) {
      gameIds.add(r.game_id);
      const ts = r.completed_at || r.created_at;
      if (ts && (!lastActivityAt || ts > lastActivityAt)) lastActivityAt = ts;
    }
  }
  return {
    totalSessions,
    uniqueGamesTouched: gameIds.size,
    lastActivityAt,
  };
}

/**
 * Returns a map of { gameId → bestStarsEarned } for a child.
 * Used to initialize the completedGames state in the play UI.
 */
export async function getChildBestProgress(childId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("progress")
    .select("game_id, stars_earned")
    .eq("child_id", childId);

  if (error || !data) return {};

  return (data as { game_id: string; stars_earned: number }[]).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.game_id] = Math.max(acc[row.game_id] ?? 0, row.stars_earned ?? 0);
      return acc;
    },
    {}
  );
}

/** Retry a Supabase call once on transient failure so star crediting is reliable. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }
  throw lastError;
}

async function incrementChildStars(childId: string, delta: number): Promise<void> {
  if (delta <= 0) return;
  await withRetry(async () => {
    const { error: rpcError } = await supabase.rpc("increment_stars" as never, {
      p_child_id: childId,
      p_stars: delta,
    } as never);
    if (!rpcError) return;
    const { data: row, error: selErr } = await supabase
      .from("children")
      .select("total_stars")
      .eq("id", childId)
      .single();
    if (selErr || row == null) throw selErr ?? new Error("Child not found for star update");
    const cur = (row as { total_stars: number | null }).total_stars ?? 0;
    const { error: upErr } = await supabase
      .from("children")
      .update({ total_stars: cur + delta } as never)
      .eq("id", childId);
    if (upErr) throw upErr;
  });
}

/**
 * Save (or update) game progress for a child.
 * `gameId` is the client key (GameConfig.id), stored in `progress.game_id` as text.
 * Keeps the best stars_earned per game; adds this round's stars to `children.total_stars` every time.
 */
export async function saveProgress(
  childId: string,
  gameId: string,
  starsEarned: number,
  score: number,
  timeSpent: number
): Promise<Progress> {
  type ProgressRow = { id: string; stars_earned: number; attempts: number };

  const { data: existingRaw } = await supabase
    .from("progress")
    .select("id, stars_earned, attempts")
    .eq("child_id", childId)
    .eq("game_id", gameId)
    .order("stars_earned", { ascending: false })
    .limit(1)
    .maybeSingle();

  const existing = existingRaw as ProgressRow | null;

  let row: Progress;

  if (existing) {
    const prevStars = existing.stars_earned ?? 0;
    const newBestStars = Math.max(prevStars, starsEarned);

    row = await withRetry(async () => {
      const { data, error } = await supabase
        .from("progress")
        .update({
          stars_earned: newBestStars,
          score,
          time_spent_seconds: timeSpent,
          attempts: (existing.attempts ?? 0) + 1,
          completed: newBestStars > 0,
          completed_at: newBestStars > 0 ? new Date().toISOString() : null,
        } as never)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as Progress;
    });
  } else {
    row = await withRetry(async () => {
      const { data, error } = await supabase
        .from("progress")
        .insert({
          child_id: childId,
          game_id: gameId,
          stars_earned: starsEarned,
          score,
          time_spent_seconds: timeSpent,
          attempts: 1,
          completed: starsEarned > 0,
          completed_at: starsEarned > 0 ? new Date().toISOString() : null,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data as Progress;
    });
  }

  if (starsEarned > 0) {
    await incrementChildStars(childId, starsEarned);
  }

  return row;
}

// ── Unlocks ───────────────────────────────────────────────────────────────────

export async function getChildUnlocks(childId: string) {
  const { data, error } = await supabase
    .from("unlocks")
    .select("*")
    .eq("child_id", childId);
  if (error) throw error;
  return data as Unlock[];
}

export async function unlockZone(childId: string, zoneId: string) {
  const { data, error } = await supabase
    .from("unlocks")
    .upsert({ child_id: childId, zone_id: zoneId } as never)
    .select()
    .single();
  if (error) throw error;
  return data as Unlock;
}

// ── Rewards ───────────────────────────────────────────────────────────────────

export async function getChildRewards(childId: string) {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("child_id", childId)
    .order("earned_at", { ascending: false });
  if (error) throw error;
  return data as Reward[];
}

export async function awardReward(
  childId: string,
  rewardType: "sticker" | "costume" | "badge" | "title",
  rewardId: string,
  rewardName: string
) {
  const { data, error } = await supabase
    .from("rewards")
    .upsert({
      child_id: childId,
      reward_type: rewardType,
      reward_id: rewardId,
      reward_name: rewardName,
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data as Reward;
}

// ── Learning Packs (textbook photos → games) ─────────────────────────────────

export interface PackPageInput {
  /** Raw OCR text extracted on-device. */
  ocrText: string;
  /** Parent-reviewed text used for game generation. */
  editedText: string;
  /** Optional page image as a data URL; uploaded best-effort to private storage. */
  imageDataUrl?: string | null;
}

export interface CreateLearningPackInput {
  title: string;
  subject?: string;
  theme?: string;
  sourceText: string;
  /** Cached generated output, e.g. { games: GameConfig[], generatedAt }. */
  generated: Record<string, unknown>;
  pages: PackPageInput[];
  status?: "draft" | "ready";
}

export interface LearningPackWithMeta extends LearningPack {
  pageCount: number;
  assignedChildIds: string[];
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Best-effort upload of a page image; returns the storage path or null on failure. */
async function uploadPackImage(
  parentId: string,
  packId: string,
  index: number,
  dataUrl: string,
): Promise<string | null> {
  try {
    const blob = dataUrlToBlob(dataUrl);
    if (!blob) return null;
    const path = `${parentId}/${packId}/page-${index}.jpg`;
    const { error } = await supabase.storage
      .from("book-uploads")
      .upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });
    if (error) return null;
    return path;
  } catch {
    return null;
  }
}

export async function createLearningPack(input: CreateLearningPackInput): Promise<LearningPack> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await ensureParentRowFromAuth(user);

  const { data: packData, error: packError } = await supabase
    .from("learning_packs")
    .insert({
      parent_id: user.id,
      title: input.title,
      subject: input.subject ?? "General",
      theme: input.theme ?? "jungle",
      status: input.status ?? "ready",
      source_text: input.sourceText,
      generated: input.generated,
    } as never)
    .select()
    .single();
  if (packError) throw packError;
  const pack = packData as LearningPack;

  const pageRows = await Promise.all(
    input.pages.map(async (p, i) => {
      const storagePath = p.imageDataUrl
        ? await uploadPackImage(user.id, pack.id, i, p.imageDataUrl)
        : null;
      return {
        pack_id: pack.id,
        parent_id: user.id,
        storage_path: storagePath,
        ocr_text: p.ocrText,
        edited_text: p.editedText,
        order_index: i,
      };
    }),
  );

  if (pageRows.length > 0) {
    const { error: pagesError } = await supabase.from("pack_pages").insert(pageRows as never);
    if (pagesError) throw pagesError;
  }

  return pack;
}

export async function updateLearningPack(
  packId: string,
  updates: Partial<Pick<LearningPack, "title" | "subject" | "theme" | "status" | "source_text" | "generated">>,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("learning_packs")
    .update(updates as never)
    .eq("id", packId)
    .eq("parent_id", user.id);
  if (error) throw error;
}

export async function deleteLearningPack(packId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("learning_packs")
    .delete()
    .eq("id", packId)
    .eq("parent_id", user.id);
  if (error) throw error;
}

export async function getLearningPacks(): Promise<LearningPackWithMeta[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const [{ data: packs }, { data: pages }, { data: assignments }] = await Promise.all([
    supabase.from("learning_packs").select("*").eq("parent_id", user.id).order("created_at", { ascending: false }),
    supabase.from("pack_pages").select("pack_id").eq("parent_id", user.id),
    supabase.from("pack_assignments").select("pack_id, child_id").eq("parent_id", user.id),
  ]);

  const pageCounts = new Map<string, number>();
  for (const row of (pages as { pack_id: string }[] | null) ?? []) {
    pageCounts.set(row.pack_id, (pageCounts.get(row.pack_id) ?? 0) + 1);
  }
  const assignMap = new Map<string, string[]>();
  for (const row of (assignments as { pack_id: string; child_id: string }[] | null) ?? []) {
    const arr = assignMap.get(row.pack_id) ?? [];
    arr.push(row.child_id);
    assignMap.set(row.pack_id, arr);
  }

  return ((packs as LearningPack[] | null) ?? []).map((p) => ({
    ...p,
    pageCount: pageCounts.get(p.id) ?? 0,
    assignedChildIds: assignMap.get(p.id) ?? [],
  }));
}

export async function getLearningPackPages(packId: string): Promise<PackPage[]> {
  const { data, error } = await supabase
    .from("pack_pages")
    .select("*")
    .eq("pack_id", packId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data as PackPage[]) ?? [];
}

/** Replace the set of children a pack is assigned to. */
export async function setPackAssignments(packId: string, childIds: string[]): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { error: delError } = await supabase
    .from("pack_assignments")
    .delete()
    .eq("pack_id", packId)
    .eq("parent_id", user.id);
  if (delError) throw delError;

  if (childIds.length === 0) return;
  const rows = childIds.map((childId) => ({
    pack_id: packId,
    child_id: childId,
    parent_id: user.id,
  }));
  const { error: insError } = await supabase.from("pack_assignments").insert(rows as never);
  if (insError) throw insError;
}

/** Ready packs assigned to a specific child (for the kid "My Lessons" screen). */
export async function getAssignedPacksForChild(childId: string): Promise<LearningPack[]> {
  const { data: assignments, error: aErr } = await supabase
    .from("pack_assignments")
    .select("pack_id")
    .eq("child_id", childId);
  if (aErr || !assignments) return [];
  const packIds = (assignments as { pack_id: string }[]).map((a) => a.pack_id);
  if (packIds.length === 0) return [];

  const { data: packs, error: pErr } = await supabase
    .from("learning_packs")
    .select("*")
    .in("id", packIds)
    .eq("status", "ready")
    .order("created_at", { ascending: false });
  if (pErr || !packs) return [];
  return packs as LearningPack[];
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  /** Set only for the signed-in parent's children; other players are anonymized. */
  child_id: string | null;
  child_name: string;
  photo_url: string | null;
  total_stars: number;
  rank: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("leaderboard_top_stars", { p_limit: limit } as never);
  if (error || !data) return [];

  const rows = data as unknown as Database["public"]["Functions"]["leaderboard_top_stars"]["Returns"][];
  return rows.map((row) => ({
    child_id: row.child_id,
    child_name: row.display_name,
    photo_url: row.photo_url,
    total_stars: row.total_stars,
    rank: Number(row.rank),
  }));
}

export async function getChildRank(childId: string): Promise<{ rank: number; total: number } | null> {
  const { data, error } = await supabase.rpc("get_child_star_rank", { p_child_id: childId } as never);
  if (error || !data) return null;
  const rows = data as unknown as Database["public"]["Functions"]["get_child_star_rank"]["Returns"][];
  const row = rows[0];
  if (!row) return null;
  return { rank: Number(row.rank), total: Number(row.total) };
}

// ── Zone / Game data (DB-backed) ──────────────────────────────────────────────

export async function getZones() {
  const { data, error } = await supabase
    .from("zones")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getGamesByZone(zoneId: string) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("zone_id", zoneId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

// ── Parent coaching reports (syllabus + skill analysis from play data) ───────

export async function fetchCoachingReference(): Promise<{
  axes: CoachingSkillAxisRow[];
  contributions: CoachingContributionRow[];
  coreCapabilities: CoachingCoreCapabilityRow[];
  axisCapabilityMap: SkillAxisCapabilityMapRow[];
}> {
  const [axesRes, contribRes, capRes, mapRes] = await Promise.all([
    supabase.from("coaching_skill_axes").select("*").order("sort_order"),
    supabase.from("game_type_skill_contribution").select("*"),
    supabase.from("coaching_core_capabilities").select("*").order("sort_order"),
    supabase.from("skill_axis_capability_map").select("*"),
  ]);
  return {
    axes: axesRes.error ? [] : ((axesRes.data as CoachingSkillAxisRow[]) ?? []),
    contributions: contribRes.error ? [] : ((contribRes.data as CoachingContributionRow[]) ?? []),
    coreCapabilities: capRes.error ? [] : ((capRes.data as CoachingCoreCapabilityRow[]) ?? []),
    axisCapabilityMap: mapRes.error ? [] : ((mapRes.data as SkillAxisCapabilityMapRow[]) ?? []),
  };
}

export async function refreshParentCoachingReport(childId: string): Promise<ParentCoachingReport> {
  const kids = await getChildren();
  const child = kids.find((c) => c.id === childId);
  if (!child) throw new Error("Child not found");

  const progress = await getChildProgress(childId);
  let { axes, contributions, coreCapabilities, axisCapabilityMap } = await fetchCoachingReference();
  if (!axes.length) axes = FALLBACK_COACHING_AXES;
  if (!contributions.length) contributions = FALLBACK_CONTRIBUTIONS;

  const report = buildParentCoachingReport(
    child,
    progress as ProgressRowLike[],
    axes,
    contributions,
    coreCapabilities,
    axisCapabilityMap,
  );

  await supabase.from("parent_coaching_reports").upsert(
    {
      child_id: childId,
      updated_at: new Date().toISOString(),
      report: report as unknown as Record<string, unknown>,
    } as never,
    { onConflict: "child_id" },
  );

  return report;
}

function isCompleteCoachingReport(r: unknown): r is ParentCoachingReport {
  if (typeof r !== "object" || r === null) return false;
  const o = r as Record<string, unknown>;
  return (
    Array.isArray(o.coreCapabilityInsights) &&
    Array.isArray(o.learningBehaviors) &&
    typeof o.decisionFramework === "object" &&
    o.decisionFramework !== null
  );
}

export async function getParentCoachingReport(childId: string): Promise<ParentCoachingReport> {
  const { data, error } = await supabase
    .from("parent_coaching_reports")
    .select("report, updated_at")
    .eq("child_id", childId)
    .maybeSingle();

  const row = data as Database["public"]["Tables"]["parent_coaching_reports"]["Row"] | null;
  if (!error && row?.report && isCompleteCoachingReport(row.report)) {
    return row.report as unknown as ParentCoachingReport;
  }
  return refreshParentCoachingReport(childId);
}
