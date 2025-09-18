-- Safe migration to update subscriptions table with new columns

-- 1. Add new columns if they don't exist (safe)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS alpha_generator_address VARCHAR(42);

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS encrypted_consumer_address TEXT;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'generator';

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Update alpha_consumer_address to allow longer addresses (safe)
ALTER TABLE subscriptions 
ALTER COLUMN alpha_consumer_address TYPE VARCHAR(42);

-- 3. Update subscription_tx_hash to allow longer hashes (safe)
ALTER TABLE subscriptions 
ALTER COLUMN subscription_tx_hash TYPE VARCHAR(66);

-- 4. Make subscription_tx_hash nullable (safe for existing data)
ALTER TABLE subscriptions 
ALTER COLUMN subscription_tx_hash DROP NOT NULL;

-- 5. Update any existing records to have created_at and updated_at
UPDATE subscriptions 
SET created_at = COALESCE(subscribed_at, NOW())
WHERE created_at IS NULL;

UPDATE subscriptions 
SET updated_at = COALESCE(subscribed_at, NOW())
WHERE updated_at IS NULL;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_generator 
ON subscriptions(alpha_generator_address);

CREATE INDEX IF NOT EXISTS idx_subscriptions_encrypted 
ON subscriptions(encrypted_consumer_address);

CREATE INDEX IF NOT EXISTS idx_subscriptions_type 
ON subscriptions(subscription_type);