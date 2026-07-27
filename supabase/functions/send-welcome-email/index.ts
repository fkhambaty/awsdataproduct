import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUBJECT = "You're awesome - Welcome to FunBerryKids";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user?.id) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = user.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "No email on account" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set — welcome email skipped");
      return new Response(
        JSON.stringify({ ok: false, skipped: true, reason: "email_not_configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date().toISOString();

    const { data: claimed, error: claimErr } = await admin
      .from("parents")
      .update({ welcome_email_sent_at: now, updated_at: now })
      .eq("id", user.id)
      .is("welcome_email_sent_at", null)
      .select("name")
      .maybeSingle();

    if (claimErr) {
      console.error("welcome claim", claimErr);
      return new Response(JSON.stringify({ error: "Could not update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!claimed) {
      const { data: existing } = await admin
        .from("parents")
        .select("welcome_email_sent_at")
        .eq("id", user.id)
        .maybeSingle();
      if (!existing) {
        return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no_parent_row" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const from =
      Deno.env.get("WELCOME_EMAIL_FROM") ??
      "FunBerry Kids <onboarding@resend.dev>";

    const displayName =
      (claimed.name && String(claimed.name).trim()) ||
      email.split("@")[0] ||
      "there";

    const html = `<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1e3a5f;">
  <p>Hi ${escapeHtml(displayName)},</p>
  <p><strong>You're awesome</strong> — thanks for joining <strong>FunBerry Kids</strong>!</p>
  <p>We're excited to help your family learn through play. Jump in anytime and explore the games together.</p>
  <p style="margin-top: 2rem; color: #64748b; font-size: 14px;">— The FunBerry Kids team</p>
</body></html>`;

    let res: Response;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: SUBJECT,
          html,
        }),
      });
    } catch (fetchErr) {
      console.error("Resend fetch", fetchErr);
      const revertAt = new Date().toISOString();
      await admin
        .from("parents")
        .update({ welcome_email_sent_at: null, updated_at: revertAt })
        .eq("id", user.id);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("Resend error", res.status, text);
      const revertAt = new Date().toISOString();
      await admin
        .from("parents")
        .update({ welcome_email_sent_at: null, updated_at: revertAt })
        .eq("id", user.id);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify the admin of a new sign-up (once per user; guarded by welcome_email_sent_at).
    const adminTo = Deno.env.get("ADMIN_NOTIFY_EMAIL");
    if (adminTo) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [adminTo],
            subject: "FunBerry: new sign-up 🎉",
            html: `<p>A new parent just joined FunBerryKids.</p>
                   <p><strong>Name:</strong> ${escapeHtml(displayName)}<br/>
                   <strong>Email:</strong> ${escapeHtml(email)}</p>`,
          }),
        });
      } catch (e) {
        console.warn("admin sign-up notify failed", e);
      }
    }

    return new Response(JSON.stringify({ ok: true, sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
