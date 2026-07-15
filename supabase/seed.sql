-- ============================================================
-- Fresh Ledger - Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Ingredients
INSERT INTO ingredients (id, name, category, stock_level, unit, unit_cost, yield_factor) VALUES
  ('1', 'Bread Flour (High Protein)', 'Flour & Grains', 150, 'kg', 2.0, 1.0),
  ('2', 'Filtered Water', 'Liquids', 500, 'L', 0.1, 1.0),
  ('3', 'Active Sourdough Starter', 'Starters', 10, 'kg', 1.5, 1.0),
  ('4', 'Fine Sea Salt', 'Spices & Seasonings', 15, 'kg', 5.0, 1.0),
  ('5', 'Rice Flour (for dusting)', 'Flour & Grains', 20, 'kg', 3.0, 1.0),
  ('6', 'Fresh Basil', 'Herbs', 2.5, 'kg', 12.0, 0.85),
  ('7', 'Olive Oil (Extra Virgin)', 'Oils & Fats', 15, 'L', 8.5, 1.0),
  ('8', 'Large Grade A Eggs', 'Dairy & Eggs', 12, 'units', 0.25, 1.0),
  ('9', 'Beef Short Ribs', 'Meats', 25, 'kg', 18.0, 0.80),
  ('10', 'Atlantic Salmon Fillet', 'Meats', 18, 'kg', 22.0, 0.90),
  ('11', 'Arborio Rice', 'Flour & Grains', 40, 'kg', 4.5, 1.0),
  ('12', 'Black Truffle Oil', 'Oils & Fats', 2, 'L', 95.0, 1.0)
ON CONFLICT (id) DO NOTHING;

-- Recipes
INSERT INTO recipes (id, name, category, prep_time, yield_amount, yield_unit, method_notes, target_margin, labor_overhead_percent) VALUES
  (
    'sourdough',
    'Artisanal Sourdough',
    'Bread & Bakery',
    '24h',
    2,
    'Loaves (800g ea)',
    '["Autolyse flour and water for 1 hour.", "Mix in starter and salt. Stretch and fold 4 times over 2 hours.", "Bulk ferment at room temp for 4-6 hours until 50% increase.", "Shape and cold retard in bannetons for 12-16 hours.", "Bake in Dutch oven at 450°F (20 mins covered, 20 mins uncovered)."]',
    75,
    30
  ),
  (
    'ribs',
    'Braised Ribs',
    'Entrees',
    '4h',
    10,
    'Portions',
    '["Sear short ribs on all sides until deep brown.", "Braised with red wine, aromatics, and beef stock at 325°F for 3 hours.", "Let rest, strain and reduce braising liquid to a glaze."]',
    68,
    25
  ),
  (
    'salmon',
    'Sous Vide Salmon',
    'Entrees',
    '1h',
    6,
    'Portions',
    '["Portion salmon fillets into 200g cuts.", "Vacuum seal with olive oil, salt, and fresh herbs.", "Cook in water bath at 122°F (50°C) for 40 minutes, then sear skin if desired."]',
    62,
    20
  ),
  (
    'risotto',
    'Truffle Risotto',
    'Entrees',
    '45m',
    8,
    'Portions',
    '["Toast arborio rice in deep pan.", "Slowly add warm stock, stirring continuously until fully absorbed.", "Finish with butter, parmigiano-reggiano, and drizzle with truffle oil."]',
    55,
    25
  )
ON CONFLICT (id) DO NOTHING;

-- Recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
  -- Sourdough
  ('sourdough', '1', 1.0),
  ('sourdough', '2', 0.75),
  ('sourdough', '3', 0.20),
  ('sourdough', '4', 0.02),
  ('sourdough', '5', 0.05),
  -- Braised Ribs
  ('ribs', '9', 3.5),
  ('ribs', '7', 0.2),
  ('ribs', '4', 0.05),
  -- Sous Vide Salmon
  ('salmon', '10', 1.2),
  ('salmon', '7', 0.1),
  ('salmon', '4', 0.02),
  -- Truffle Risotto
  ('risotto', '11', 1.0),
  ('risotto', '12', 0.05),
  ('risotto', '4', 0.02),
  ('risotto', '8', 4.0)
ON CONFLICT DO NOTHING;

-- Sales
INSERT INTO sales (id, date, item_name, quantity, revenue, cost) VALUES
  ('s1', 'Oct 24, 2023', 'Truffle Risotto', 12, 336.00, 84.00),
  ('s2', 'Oct 24, 2023', 'Seared Scallops', 8, 256.00, 96.00),
  ('s3', 'Oct 24, 2023', 'Wagyu Burger', 24, 528.00, 168.00),
  ('s4', 'Oct 23, 2023', 'House Salad', 35, 420.00, 70.00),
  ('s5', 'Oct 23, 2023', 'Truffle Risotto', 15, 420.00, 105.00),
  ('s6', 'Oct 22, 2023', 'Braised Ribs', 18, 810.00, 240.00),
  ('s7', 'Oct 22, 2023', 'Artisanal Sourdough', 50, 450.00, 131.50),
  ('s8', 'Oct 21, 2023', 'Sous Vide Salmon', 14, 490.00, 180.00),
  ('s9', 'Oct 21, 2023', 'House Salad', 20, 240.00, 40.00),
  ('s10', 'Oct 20, 2023', 'Wagyu Burger', 30, 660.00, 210.00)
ON CONFLICT (id) DO NOTHING;
