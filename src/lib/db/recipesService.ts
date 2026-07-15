// ============================================================
// Recipes Service — CRUD with recipe_ingredients join table
// ============================================================

import { supabase } from '../supabase';
import { Recipe, RecipeIngredient } from '../../types';

// --- Row mappers --------------------------------------------

function rowToRecipeIngredient(row: Record<string, unknown>): RecipeIngredient {
  return {
    id: row.id as number,
    recipeId: row.recipe_id as string,
    ingredientId: (row.ingredient_id as string | null) ?? undefined,
    subRecipeId: (row.sub_recipe_id as string | null) ?? undefined,
    quantity: Number(row.quantity),
  };
}

function rowToRecipe(
  row: Record<string, unknown>,
  ingredientRows: Record<string, unknown>[],
): Recipe {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    prepTime: (row.prep_time as string) ?? '',
    yieldAmount: Number(row.yield_amount),
    yieldUnit: row.yield_unit as string,
    ingredients: ingredientRows
      .filter(r => r.recipe_id === row.id)
      .map(rowToRecipeIngredient),
    methodNotes: (row.method_notes as string[]) ?? [],
    targetMargin: Number(row.target_margin),
    laborOverheadPercent: Number(row.labor_overhead_percent),
    description: (row.description as string | null) ?? undefined,
    allergens: (row.allergens as string[]) ?? [],
    portionSize: row.portion_size != null ? Number(row.portion_size) : undefined,
    portionUnit: (row.portion_unit as string | null) ?? undefined,
    targetFoodCostPercent: row.target_food_cost_percent != null
      ? Number(row.target_food_cost_percent)
      : undefined,
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
  };
}

// --- CRUD ---------------------------------------------------

export async function getAll(): Promise<Recipe[]> {
  const [recipesResult, ingredientsResult] = await Promise.all([
    supabase.from('recipes').select('*').order('name'),
    supabase.from('recipe_ingredients').select('*'),
  ]);

  if (recipesResult.error) throw new Error(`recipesService.getAll: ${recipesResult.error.message}`);
  if (ingredientsResult.error) throw new Error(`recipesService.getAll (join): ${ingredientsResult.error.message}`);

  const ingRows = (ingredientsResult.data ?? []) as Record<string, unknown>[];
  return (recipesResult.data ?? []).map(row => rowToRecipe(row as Record<string, unknown>, ingRows));
}

export async function create(data: Omit<Recipe, 'id'>): Promise<Recipe> {
  const { data: row, error } = await supabase
    .from('recipes')
    .insert({
      name: data.name,
      category: data.category,
      prep_time: data.prepTime,
      yield_amount: data.yieldAmount,
      yield_unit: data.yieldUnit,
      method_notes: data.methodNotes,
      target_margin: data.targetMargin,
      labor_overhead_percent: data.laborOverheadPercent,
      description: data.description ?? null,
      allergens: data.allergens ?? [],
      portion_size: data.portionSize ?? null,
      portion_unit: data.portionUnit ?? null,
      target_food_cost_percent: data.targetFoodCostPercent ?? null,
      sale_price: data.salePrice ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`recipesService.create: ${error.message}`);

  await upsertIngredients(row.id as string, data.ingredients);

  const ingRows = await getIngredientRows(row.id as string);
  return rowToRecipe(row as Record<string, unknown>, ingRows);
}

export async function update(id: string, data: Partial<Omit<Recipe, 'id'>>): Promise<Recipe> {
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.category !== undefined) patch.category = data.category;
  if (data.prepTime !== undefined) patch.prep_time = data.prepTime;
  if (data.yieldAmount !== undefined) patch.yield_amount = data.yieldAmount;
  if (data.yieldUnit !== undefined) patch.yield_unit = data.yieldUnit;
  if (data.methodNotes !== undefined) patch.method_notes = data.methodNotes;
  if (data.targetMargin !== undefined) patch.target_margin = data.targetMargin;
  if (data.laborOverheadPercent !== undefined) patch.labor_overhead_percent = data.laborOverheadPercent;
  if (data.description !== undefined) patch.description = data.description ?? null;
  if (data.allergens !== undefined) patch.allergens = data.allergens;
  if (data.portionSize !== undefined) patch.portion_size = data.portionSize ?? null;
  if (data.portionUnit !== undefined) patch.portion_unit = data.portionUnit ?? null;
  if (data.targetFoodCostPercent !== undefined) patch.target_food_cost_percent = data.targetFoodCostPercent ?? null;
  if (data.salePrice !== undefined) patch.sale_price = data.salePrice ?? null;

  const { data: row, error } = await supabase
    .from('recipes')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`recipesService.update: ${error.message}`);

  if (data.ingredients !== undefined) {
    await upsertIngredients(id, data.ingredients);
  }

  const ingRows = await getIngredientRows(id);
  return rowToRecipe(row as Record<string, unknown>, ingRows);
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw new Error(`recipesService.remove: ${error.message}`);
}

// --- Helpers ------------------------------------------------

async function upsertIngredients(recipeId: string, ingredients: RecipeIngredient[]): Promise<void> {
  // Delete existing lines, then re-insert
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);

  if (ingredients.length === 0) return;

  const rows = ingredients.map(ing => ({
    recipe_id: recipeId,
    ingredient_id: ing.ingredientId ?? null,
    sub_recipe_id: ing.subRecipeId ?? null,
    quantity: ing.quantity,
  }));

  const { error } = await supabase.from('recipe_ingredients').insert(rows);
  if (error) throw new Error(`recipesService.upsertIngredients: ${error.message}`);
}

async function getIngredientRows(recipeId: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .eq('recipe_id', recipeId);

  if (error) throw new Error(`recipesService.getIngredientRows: ${error.message}`);
  return (data ?? []) as Record<string, unknown>[];
}
