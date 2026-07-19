-- ============================================================
-- Fresh Ledger - Settings Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users: full access" ON settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Default Settings
INSERT INTO settings (key, value) VALUES
  ('currency', '{"code": "NIO", "symbol": "C$", "decimal_places": 2, "thousand_separator": ",", "decimal_separator": "."}'),
  ('pricing', '{"default_target_food_cost": 30, "default_target_margin": 70, "rounding_enabled": true, "rounding_method": "nearest", "round_to": 0.50}'),
  ('taxes', '{"enabled": false, "tax_rate": 15}'),
  ('units', '{"default_weight_unit": "g", "default_volume_unit": "ml", "allow_unit_conversion": true}'),
  ('alerts', '{"low_margin_alert_threshold": 65, "high_food_cost_alert_threshold": 35}'),
  ('ui', '{"theme": "system", "compact_tables": false}')
ON CONFLICT (key) DO NOTHING;
