// ============================================================
// MenuItems Service (was Recipes Service)
// ============================================================

import { supabase } from '../supabase';
import { MenuItem, MenuComponent } from '../../types';

// --- Row mappers --------------------------------------------

function rowToMenuComponent(row: Record<string, unknown>): MenuComponent {
  return {
    id: row.id as number,
    menuItemId: row.recipe_id as string, // mapped from recipe_id
    inventoryItemId: (row.ingredient_id as string | null) ?? '', // mapped from ingredient_id
    quantity: Number(row.quantity),
  };
}

function rowToMenuItem(
  row: Record<string, unknown>,
  componentRows: Record<string, unknown>[],
): MenuItem {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    components: componentRows
      .filter(r => r.recipe_id === row.id)
      .map(rowToMenuComponent),
    targetMargin: Number(row.target_margin),
    description: (row.description as string | null) ?? undefined,
    allergens: (row.allergens as string[]) ?? [],
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
  };
}

// --- CRUD ---------------------------------------------------

export async function getAll(): Promise<MenuItem[]> {
  const [recipesResult, ingredientsResult] = await Promise.all([
    supabase.from('recipes').select('*').order('name'),
    supabase.from('recipe_ingredients').select('*'),
  ]);

  if (recipesResult.error) throw new Error(`menuItemsService.getAll: ${recipesResult.error.message}`);
  if (ingredientsResult.error) throw new Error(`menuItemsService.getAll (join): ${ingredientsResult.error.message}`);

  const ingRows = (ingredientsResult.data ?? []) as Record<string, unknown>[];
  return (recipesResult.data ?? []).map(row => rowToMenuItem(row as Record<string, unknown>, ingRows));
}

export async function create(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const { data: row, error } = await supabase
    .from('recipes')
    .insert({
      name: data.name,
      category: data.category,
      target_margin: data.targetMargin,
      description: data.description ?? null,
      allergens: data.allergens ?? [],
      sale_price: data.salePrice ?? null,
      // Legacy required fields for Supabase schema
      prep_time: '',
      yield_amount: 1,
      yield_unit: 'units',
      method_notes: [],
      labor_overhead_percent: 0,
    })
    .select()
    .single();

  if (error) throw new Error(`menuItemsService.create: ${error.message}`);

  await upsertComponents(row.id as string, data.components);

  const compRows = await getComponentRows(row.id as string);
  return rowToMenuItem(row as Record<string, unknown>, compRows);
}

export async function update(id: string, data: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem> {
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.category !== undefined) patch.category = data.category;
  if (data.targetMargin !== undefined) patch.target_margin = data.targetMargin;
  if (data.description !== undefined) patch.description = data.description ?? null;
  if (data.allergens !== undefined) patch.allergens = data.allergens;
  if (data.salePrice !== undefined) patch.sale_price = data.salePrice ?? null;

  const { data: row, error } = await supabase
    .from('recipes')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`menuItemsService.update: ${error.message}`);

  if (data.components !== undefined) {
    await upsertComponents(id, data.components);
  }

  const compRows = await getComponentRows(id);
  return rowToMenuItem(row as Record<string, unknown>, compRows);
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw new Error(`menuItemsService.remove: ${error.message}`);
}

// --- Helpers ------------------------------------------------

async function upsertComponents(menuItemId: string, components: MenuComponent[]): Promise<void> {
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', menuItemId);

  if (components.length === 0) return;

  const rows = components.map(comp => ({
    recipe_id: menuItemId,
    ingredient_id: comp.inventoryItemId,
    quantity: comp.quantity,
  }));

  const { error } = await supabase.from('recipe_ingredients').insert(rows);
  if (error) throw new Error(`menuItemsService.upsertComponents: ${error.message}`);
}

async function getComponentRows(menuItemId: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .eq('recipe_id', menuItemId);

  if (error) throw new Error(`menuItemsService.getComponentRows: ${error.message}`);
  return (data ?? []) as Record<string, unknown>[];
}
