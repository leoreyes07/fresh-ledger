// ============================================================
// Sales Service — CRUD via Supabase
// ============================================================

import { supabase } from '../supabase';
import { SaleRecord } from '../../types';

// --- Row mapper ---------------------------------------------

function rowToSaleRecord(row: Record<string, unknown>): SaleRecord {
  return {
    id: row.id as string,
    date: row.date as string,
    itemName: row.item_name as string,
    quantity: Number(row.quantity),
    revenue: Number(row.revenue),
    cost: Number(row.cost),
  };
}

// --- CRUD ---------------------------------------------------

export async function getAll(): Promise<SaleRecord[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`salesService.getAll: ${error.message}`);
  return (data ?? []).map(rowToSaleRecord);
}

export async function create(data: Omit<SaleRecord, 'id'>): Promise<SaleRecord> {
  const { data: row, error } = await supabase
    .from('sales')
    .insert({
      date: data.date,
      item_name: data.itemName,
      quantity: data.quantity,
      revenue: data.revenue,
      cost: data.cost,
    })
    .select()
    .single();

  if (error) throw new Error(`salesService.create: ${error.message}`);
  return rowToSaleRecord(row);
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) throw new Error(`salesService.remove: ${error.message}`);
}
