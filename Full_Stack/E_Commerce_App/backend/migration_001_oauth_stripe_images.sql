-- Migration: real GitHub OAuth + real Stripe payments + product images
-- Safe to run once against an existing dev database that still has the
-- original dummy-OAuth / dummy-payment schema.

BEGIN;

-- users: allow OAuth-only accounts (no password) and a display name
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- oauth_accounts: allow github in addition to the original google/microsoft
ALTER TABLE oauth_accounts DROP CONSTRAINT IF EXISTS oauth_accounts_provider_check;
ALTER TABLE oauth_accounts ADD CONSTRAINT oauth_accounts_provider_check
    CHECK (provider IN ('google', 'microsoft', 'github'));

-- products: add image for the product listing / details pages
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- payments: replace the dummy token with real Stripe references
ALTER TABLE payments DROP COLUMN IF EXISTS dummy_token;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_message TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- stripe_payment_intent_id should be unique once populated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_stripe_payment_intent_id_key'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

COMMIT;
