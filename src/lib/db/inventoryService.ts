// ============================================================
// Inventory Service — CRUD + price history via Supabase
// ============================================================

import { supabase } from '../supabase';
import { InventoryItem, PriceRecord, InventoryCategory } from '../../types';

// --- DB row shape (snake_case) -> domain type (camelCase) ---

function rowToInventoryItem(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as InventoryCategory,
    stockLevel: Number(row.stock_level),
    unit: row.unit as 'gallons' | 'units' | 'oz' | 'lbs',
    unitCost: Number(row.unit_cost),
    supplier: (row.supplier as string | null) ?? undefined,
    lastPurchaseDate: (row.last_purchase_date as string | null) ?? undefined,
    volume: row.qty_per_package != null ? Number(row.qty_per_package) : 1, // Mapped to qty_per_package in DB
    yieldFactor: row.yield_factor != null ? Number(row.yield_factor) : 1,
  };
}

function inventoryItemToRow(data: Omit<InventoryItem, 'id'>): Record<string, unknown> {
  return {
    name: data.name,
    category: data.category,
    stock_level: data.stockLevel,
    unit: data.unit,
    unit_cost: data.unitCost,
    supplier: data.supplier ?? null,
    last_purchase_date: data.lastPurchaseDate ?? null,
    qty_per_package: data.volume ?? null, // Mapped volume to qty_per_package
    yield_factor: data.yieldFactor ?? 1,
  };
}

// --- CRUD ---------------------------------------------------

export async function getAll(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('ingredients') // keeping old table name to not break db
    .select('*')
    .order('name');

  if (error) throw new Error(`inventoryService.getAll: ${error.message}`);
  return (data ?? []).map(rowToInventoryItem);
}

export async function create(data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  const { data: row, error } = await supabase
    .from('ingredients')
    .insert(inventoryItemToRow(data))
    .select()
    .single();

  if (error) throw new Error(`inventoryService.create: ${error.message}`);
  return rowToInventoryItem(row);
}

export async function update(id: string, data: Partial<Omit<InventoryItem, 'id'>>): Promise<InventoryItem> {
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
  if (data.volume !== undefined) patch.qty_per_package = data.volume ?? null;
  if (data.yieldFactor !== undefined) patch.yield_factor = data.yieldFactor;

  const { data: row, error } = await supabase
    .from('ingredients')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`inventoryService.update: ${error.message}`);
  return rowToInventoryItem(row);
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('ingredients').delete().eq('id', id);
  if (error) throw new Error(`inventoryService.remove: ${error.message}`);
}

async function getById(id: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return rowToInventoryItem(data);
}

// --- Price history ------------------------------------------

async function recordPriceHistory(inventoryItemId: string, oldPrice: number): Promise<void> {
  await supabase.from('ingredient_price_history').insert({
    ingredient_id: inventoryItemId,
    price: oldPrice,
  });
}

export async function getPriceHistory(inventoryItemId: string): Promise<PriceRecord[]> {
  const { data, error } = await supabase
    .from('ingredient_price_history')
    .select('*')
    .eq('ingredient_id', inventoryItemId)
    .order('recorded_at', { ascending: true });

  if (error) throw new Error(`inventoryService.getPriceHistory: ${error.message}`);

  return (data ?? []).map(row => ({
    id: row.id as number,
    inventoryItemId: row.ingredient_id as string,
    price: Number(row.price),
    recordedAt: row.recorded_at as string,
  }));
}
