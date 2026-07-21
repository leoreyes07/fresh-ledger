-- ============================================================
-- Fresh Ledger - Seed Data for Ice Cream Parlor
-- Run this in the Supabase SQL Editor to populate initial ingredients
-- ============================================================

INSERT INTO ingredients (name, category, stock_level, unit, unit_cost, yield_factor) VALUES
  ('Leche Entera', 'Lácteos', 100, 'L', 1.20, 1.0),
  ('Crema de Leche (35% grasa)', 'Lácteos', 50, 'L', 4.50, 1.0),
  ('Azúcar Blanca Múltiple', 'Secos', 200, 'kg', 0.80, 1.0),
  ('Dextrosa', 'Secos', 50, 'kg', 2.10, 1.0),
  ('Leche en Polvo Descremada', 'Lácteos', 25, 'kg', 3.50, 1.0),
  ('Neutro/Estabilizante para Helados', 'Aditivos', 5, 'kg', 15.00, 1.0),
  ('Dulce de Leche Heladero', 'Sabores', 30, 'kg', 3.20, 1.0),
  ('Cacao en Polvo (22-24%)', 'Sabores', 15, 'kg', 8.50, 1.0),
  ('Pasta de Vainilla', 'Sabores', 2, 'L', 45.00, 1.0),
  ('Frutillas Frescas', 'Frutas', 20, 'kg', 2.50, 0.85),
  ('Jugo de Limón Natural', 'Frutas', 10, 'L', 3.00, 1.0),
  ('Cucuruchos Dulces', 'Packaging', 500, 'unidades', 0.15, 1.0),
  ('Vasitos de Cartón (1/4 kg)', 'Packaging', 1000, 'unidades', 0.10, 1.0),
  ('Cucharitas de Plástico', 'Packaging', 2000, 'unidades', 0.02, 1.0),
  ('Bola de Helado', 'Extras', 100, 'unidades', 0.50, 1.0),
  ('Crema Chantilly', 'Toppings', 10, 'kg', 5.00, 1.0),
  ('Cereza', 'Toppings', 200, 'unidades', 0.05, 1.0),
  ('Bananos', 'Frutas', 5, 'kg', 1.00, 0.90),
  ('Topping de Chocolate', 'Toppings', 5, 'L', 3.00, 1.0),
  ('Topping de Caramelo', 'Toppings', 5, 'L', 3.00, 1.0),
  ('Topping de Maní', 'Toppings', 5, 'kg', 4.50, 1.0);
