// ============================================================
// Cost Engine — pure business logic, no React, no side effects
// ============================================================

import { Ingredient, Recipe, RecipeIngredient, DishClassification } from '../types';

// ---- Ingredient cost ----------------------------------------

/**
 * Effective cost per unit, adjusted for yield factor.
 * Example: 1kg chicken at $10/kg with 80% yield = $12.50 effective cost/kg
 */
export function ingredientEffectiveCost(ingredient: Ingredient): number {
  const yield_ = ingredient.yieldFactor > 0 ? ingredient.yieldFactor : 1;
  return ingredient.unitCost / yield_;
}

/**
 * Cost for a specific quantity of an ingredient, yield-adjusted.
 */
export function ingredientLineCost(ingredient: Ingredient, quantity: number): number {
  return ingredientEffectiveCost(ingredient) * quantity;
}

// ---- Recipe cost (recursive, supports sub-recipes) ----------

/**
 * Total ingredient cost for a recipe (for the full yield).
 * Recursively computes sub-recipe costs.
 * @param scale - multiplier (1 = as written, 2 = double batch, etc.)
 */
export function recipeTotalCost(
  recipe: Recipe,
  allIngredients: Ingredient[],
  allRecipes: Recipe[],
  scale = 1,
): number {
  const ingMap = new Map(allIngredients.map(i => [i.id, i]));
  const recMap = new Map(allRecipes.map(r => [r.id, r]));

  let total = 0;

  for (const line of recipe.ingredients) {
    const qty = line.quantity * scale;

    if (line.ingredientId) {
      const ing = ingMap.get(line.ingredientId);
      if (ing) {
        total += ingredientLineCost(ing, qty);
      }
    } else if (line.subRecipeId) {
      const sub = recMap.get(line.subRecipeId);
      if (sub) {
        // Sub-recipe cost = (cost per yield unit) * quantity used
        const subCostPerYieldUnit = recipeCostPerUnit(sub, allIngredients, allRecipes);
        total += subCostPerYieldUnit * qty;
      }
    }
  }

  return total;
}

/**
 * Cost per single yield unit of a recipe.
 * Example: if recipe yields 8 portions and costs $40 total -> $5/portion
 */
export function recipeCostPerUnit(
  recipe: Recipe,
  allIngredients: Ingredient[],
  allRecipes: Recipe[],
): number {
  const total = recipeTotalCost(recipe, allIngredients, allRecipes);
  const yield_ = recipe.yieldAmount > 0 ? recipe.yieldAmount : 1;
  return total / yield_;
}

// ---- Portion cost -------------------------------------------

/**
 * Cost per portion.
 * If recipe has portionSize defined, splits cost per yield unit by portions per unit.
 * Otherwise returns cost per yield unit (assumes yield = portions).
 */
export function costPerPortion(
  recipe: Recipe,
  allIngredients: Ingredient[],
  allRecipes: Recipe[],
): number {
  return recipeCostPerUnit(recipe, allIngredients, allRecipes);
}

// ---- Pricing metrics ----------------------------------------

/**
 * Food cost percentage: portionCost / salePrice * 100
 * Industry benchmark: aim for < 30%
 */
export function foodCostPercent(portionCost: number, salePrice: number): number {
  if (salePrice <= 0) return 0;
  return (portionCost / salePrice) * 100;
}

/**
 * Gross profit margin: (salePrice - portionCost) / salePrice * 100
 */
export function profitMarginPercent(portionCost: number, salePrice: number): number {
  if (salePrice <= 0) return 0;
  return ((salePrice - portionCost) / salePrice) * 100;
}

/**
 * Suggested sale price from a target food cost percentage.
 * Example: cost $3, target food cost 30% -> $3 / 0.30 = $10
 */
export function priceFromFoodCostTarget(portionCost: number, targetPct: number): number {
  if (targetPct <= 0) return 0;
  return portionCost / (targetPct / 100);
}

/**
 * Suggested sale price from a target profit margin percentage.
 * Example: cost $3, target margin 70% -> $3 / (1 - 0.70) = $10
 */
export function priceFromMarginTarget(portionCost: number, targetMargin: number): number {
  const complement = 1 - targetMargin / 100;
  if (complement <= 0) return 0;
  return portionCost / complement;
}

/**
 * Charm pricing: rounds raw price based on settings.
 * Default is nearest .95 or .50.
 */
export function charmPrice(raw: number, settings?: any): number {
  if (!settings?.pricing?.rounding_enabled) return raw;
  
  const method = settings?.pricing?.rounding_method || 'nearest';
  const roundTo = settings?.pricing?.round_to || 0.50;
  
  // Basic implementation of dynamic rounding
  // Using roundTo (e.g. 0.50, 0.95, 1.00)
  const floor = Math.floor(raw);
  const decimal = raw - floor;
  
  if (method === 'ceil') {
    return Math.ceil(raw / roundTo) * roundTo;
  } else if (method === 'floor') {
    return Math.floor(raw / roundTo) * roundTo;
  }
  
  // nearest (custom charm pricing logic based on common values)
  if (roundTo === 0.95) {
    return floor + 0.95;
  }
  
  if (decimal <= 0.5) {
    return floor + (decimal <= 0.25 ? 0.25 : 0.5);
  } else {
    return floor + (decimal <= 0.75 ? 0.75 : 0.95);
  }
}

// ---- Menu Engineering ---------------------------------------

/**
 * Classify a dish in the Menu Engineering matrix.
 * - Star:       high margin, high sales (promote, keep)
 * - Plow Horse: low margin, high sales  (reprice or reduce cost)
 * - Puzzle:     high margin, low sales  (promote more, reposition)
 * - Dog:        low margin, low sales   (consider removing)
 */
export function classifyDish(
  dishMargin: number,
  avgMargin: number,
  dishSales: number,
  avgSales: number,
): DishClassification {
  const highMargin = dishMargin >= avgMargin;
  const highSales = dishSales >= avgSales;

  if (highMargin && highSales) return 'star';
  if (!highMargin && highSales) return 'plow-horse';
  if (highMargin && !highSales) return 'puzzle';
  return 'dog';
}

// ---- Composite helper ----------------------------------------

export interface RecipeMetrics {
  totalCost: number;
  costPerPortion: number;
  foodCostPct: number;
  marginPct: number;
  suggestedPriceFC: number;   // from food cost target
  suggestedPriceMargin: number; // from margin target
  charmPriceFC: number;
  charmPriceMargin: number;
}

/** Compute all pricing metrics for a recipe at once. */
export function computeRecipeMetrics(
  recipe: Recipe,
  allIngredients: Ingredient[],
  allRecipes: Recipe[],
  settings?: any
): RecipeMetrics {
  const totalCost = recipeTotalCost(recipe, allIngredients, allRecipes);
  const cpp = costPerPortion(recipe, allIngredients, allRecipes);
  const salePrice = recipe.salePrice ?? 0;

  const defaultFcPct = settings?.pricing?.default_target_food_cost ?? 30;
  const defaultMarginPct = settings?.pricing?.default_target_margin ?? 70;

  const fcPct = recipe.targetFoodCostPercent ?? defaultFcPct;
  const marginPct = recipe.targetMargin ?? defaultMarginPct;

  const suggestedFC = priceFromFoodCostTarget(cpp, fcPct);
  const suggestedMargin = priceFromMarginTarget(cpp, marginPct);

  return {
    totalCost,
    costPerPortion: cpp,
    foodCostPct: foodCostPercent(cpp, salePrice),
    marginPct: profitMarginPercent(cpp, salePrice),
    suggestedPriceFC: suggestedFC,
    suggestedPriceMargin: suggestedMargin,
    charmPriceFC: charmPrice(suggestedFC, settings),
    charmPriceMargin: charmPrice(suggestedMargin, settings),
  };
}
