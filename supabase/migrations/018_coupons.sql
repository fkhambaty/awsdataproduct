-- Coupons & redemptions
-- Coupons grant free premium access for a number of days (e.g. "1 week free"), with an
-- optional discount percent (informational / future paid-checkout use), an optional
-- expiry, and an optional redemption cap.
--
-- These tables are managed ONLY by the server (service role) via the /api/admin and
-- /api/coupons routes. RLS is enabled with NO policies, so anon/authenticated clients
-- cannot read or write them directly; the service role bypasses RLS.

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 100 CHECK (discount_percent BETWEEN 0 AND 100),
  -- Days of free premium granted on redemption (0 = no free access).
  free_days INTEGER NOT NULL DEFAULT 7 CHECK (free_days >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  -- Coupon can be redeemed until this time (null = no expiry).
  expires_at TIMESTAMPTZ,
  -- Max total redemptions across all users (null = unlimited).
  max_redemptions INTEGER,
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, parent_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_parent ON coupon_redemptions(parent_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Server-only access.
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
-- (Intentionally no policies — only the service role may touch these tables.)
