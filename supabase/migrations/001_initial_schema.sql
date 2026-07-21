-- ============================================================
-- Fresh Ledger - Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  category            TEXT NOT NULL,
  stock_level         NUMERIC NOT NULL DEFAULT 0,
  unit                TEXT NOT NULL,
  unit_cost           NUMERIC NOT NULL DEFAULT 0,
  supplier            TEXT,
  last_purchase_date  TEXT,
  purchase_unit       TEXT,
  qty_per_package     NUMERIC,
  yield_factor        NUMERIC NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredient price history
CREATE TABLE IF NOT EXISTS ingredient_price_history (
  id            BIGSERIAL PRIMARY KEY,
  ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
  price         NUMERIC NOT NULL,
  recorded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT NOT NULL,
  category                 TEXT NOT NULL,
  prep_time                TEXT,
  yield_amount             NUMERIC NOT NULL DEFAULT 1,
  yield_unit               TEXT NOT NULL,
  method_notes             JSONB DEFAULT '[]',
  target_margin            NUMERIC NOT NULL DEFAULT 75,
  labor_overhead_percent   NUMERIC NOT NULL DEFAULT 30,
  description              TEXT,
  allergens                JSONB DEFAULT '[]',
  portion_size             NUMERIC,
  portion_unit             TEXT,
  target_food_cost_percent NUMERIC,
  sale_price               NUMERIC,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients (supports sub-recipes)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id            BIGSERIAL PRIMARY KEY,
  recipe_id     TEXT REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id TEXT REFERENCES ingredients(id) ON DELETE SET NULL,
  sub_recipe_id TEXT REFERENCES recipes(id) ON DELETE SET NULL,
  quantity      NUMERIC NOT NULL,
  CONSTRAINT must_have_one CHECK (
    (ingredient_id IS NOT NULL) != (sub_recipe_id IS NOT NULL)
  )
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       TEXT NOT NULL,
  item_name  TEXT NOT NULL,
  quantity   NUMERIC NOT NULL,
  revenue    NUMERIC NOT NULL,
  cost       NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- Single-user app: all rows require authenticated session.
-- No per-user filtering needed.
-- ============================================================

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can do everything
CREATE POLICY "Authenticated users: full access" ON ingredients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users: full access" ON ingredient_price_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users: full access" ON recipes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users: full access" ON recipe_ingredients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users: full access" ON sales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
