// ============================================================
// Ingredients Service — CRUD + price history via Supabase
// ============================================================

import { supabase } from '../supabase';
import { Ingredient, PriceRecord } from '../../types';

// --- DB row shape (snake_case) -> domain type (camelCase) ---

function rowToIngredient(row: Record<string, unknown>): Ingredient {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    stockLevel: Number(row.stock_level),
    unit: row.unit as string,
    unitCost: Number(row.unit_cost),
    supplier: (row.supplier as string | null) ?? undefined,
    lastPurchaseDate: (row.last_purchase_date as string | null) ?? undefined,
    purchaseUnit: (row.purchase_unit as string | null) ?? undefined,
    qtyPerPackage: row.qty_per_package != null ? Number(row.qty_per_package) : undefined,
    yieldFactor: row.yield_factor != null ? Number(row.yield_factor) : 1,
  };
}

function ingredientToRow(data: Omit<Ingredient, 'id'>): Record<string, unknown> {
  return {
    name: data.name,
    category: data.category,
    stock_level: data.stockLevel,
    unit: data.unit,
    unit_cost: data.unitCost,
    supplier: data.supplier ?? null,
    last_purchase_date: data.lastPurchaseDate ?? null,
    purchase_unit: data.purchaseUnit ?? null,
    qty_per_package: data.qtyPerPackage ?? null,
    yield_factor: data.yieldFactor ?? 1,
  };
}

// --- CRUD ---------------------------------------------------

export async function getAll(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name');

  if (error) throw new Error(`ingredientsService.getAll: ${error.message}`);
  return (data ?? []).map(rowToIngredient);
}

export async function create(data: Omit<Ingredient, 'id'>): Promise<Ingredient> {
  const { data: row, error } = await supabase
    .from('ingredients')
    .insert(ingredientToRow(data))
    .select()
    .single();

  if (error) throw new Error(`ingredientsService.create: ${error.message}`);
  return rowToIngredient(row);
}

export async function update(id: string, data: Partial<Omit<Ingredient, 'id'>>): Promise<Ingredient> {
  // Detect price change to record history
  const current = await getById(id);
  if (current && data.unitCost !== undefined && data.unitCost !== current.unitCost) {
    await recordPriceHistory(id, current.unitCost);
  }

  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.category !== undefined) patch.category = data.category;
  if (data.stockLevel !== undefined) patch.stock_level = data.stockLevel;
  if (data.unit !== undefined) patch.unit = data.unit;
  if (data.unitCost !== undefined) patch.unit_cost = data.unitCost;
  if (data.supplier !== undefined) patch.supplier = data.supplier ?? null;
  if (data.lastPurchaseDate !== undefined) patch.last_purchase_date = data.lastPurchaseDate ?? null;
  if (data.purchaseUnit !== undefined) patch.purchase_unit = data.purchaseUnit ?? null;
  if (data.qtyPerPackage !== undefined) patch.qty_per_package = data.qtyPerPackage ?? null;
  if (data.yieldFactor !== undefined) patch.yield_factor = data.yieldFactor;

  const { data: row, error } = await supabase
    .from('ingredients')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`ingredientsService.update: ${error.message}`);
  return rowToIngredient(row);
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('ingredients').delete().eq('id', id);
  if (error) throw new Error(`ingredientsService.remove: ${error.message}`);
}

async function getById(id: string): Promise<Ingredient | null> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return rowToIngredient(data);
}

// --- Price history ------------------------------------------

async function recordPriceHistory(ingredientId: string, oldPrice: number): Promise<void> {
  await supabase.from('ingredient_price_history').insert({
    ingredient_id: ingredientId,
    price: oldPrice,
  });
}

export async function getPriceHistory(ingredientId: string): Promise<PriceRecord[]> {
  const { data, error } = await supabase
    .from('ingredient_price_history')
    .select('*')
    .eq('ingredient_id', ingredientId)
    .order('recorded_at', { ascending: true });

  if (error) throw new Error(`ingredientsService.getPriceHistory: ${error.message}`);

  return (data ?? []).map(row => ({
    id: row.id as number,
    ingredientId: row.ingredient_id as string,
    price: Number(row.price),
    recordedAt: row.recorded_at as string,
  }));
}
