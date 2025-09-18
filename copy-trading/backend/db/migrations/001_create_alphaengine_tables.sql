-- AlphaEngine Database Migration
-- Clean slate approach - create fresh tables for copy trading functionality

-- AlphaEngine core database tables for copy trading platform

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    performance_metrics JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on wallet_address for faster lookups
CREATE INDEX idx_strategies_wallet_address ON strategies(wallet_address);
CREATE INDEX idx_strategies_is_active ON strategies(is_active);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE CASCADE,
    subscriber_wallet VARCHAR(255) NOT NULL,
    subscription_amount DECIMAL(18,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(strategy_id, subscriber_wallet)
);

-- Create indexes for subscriptions
CREATE INDEX idx_subscriptions_strategy_id ON subscriptions(strategy_id);
CREATE INDEX idx_subscriptions_subscriber_wallet ON subscriptions(subscriber_wallet);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);

-- Create trade_confirmations table
CREATE TABLE IF NOT EXISTS trade_confirmations (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE CASCADE,
    trade_hash VARCHAR(255) UNIQUE NOT NULL,
    trade_type VARCHAR(50),
    token_pair VARCHAR(100),
    amount DECIMAL(18,8),
    price DECIMAL(18,8),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscriber_confirmations JSONB,
    broadcast_status VARCHAR(50) DEFAULT 'pending'
);

-- Create indexes for trade_confirmations
CREATE INDEX idx_trade_confirmations_strategy_id ON trade_confirmations(strategy_id);
CREATE INDEX idx_trade_confirmations_trade_hash ON trade_confirmations(trade_hash);
CREATE INDEX idx_trade_confirmations_broadcast_status ON trade_confirmations(broadcast_status);
CREATE INDEX idx_trade_confirmations_timestamp ON trade_confirmations(timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();