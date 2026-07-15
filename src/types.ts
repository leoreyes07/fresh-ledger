// ============================================================
// Core domain types for Fresh Ledger
// ============================================================

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  unit: string;
  unitCost: number;
  // Extended fields
  supplier?: string;
  lastPurchaseDate?: string;
  purchaseUnit?: string;
  qtyPerPackage?: number;
  /** 0.0 to 1.0 — ratio of usable product after waste/trimming. Default 1. */
  yieldFactor: number;
}

export interface PriceRecord {
  id: number;
  ingredientId: string;
  price: number;
  recordedAt: string;
}

export interface RecipeIngredient {
  id?: number;
  recipeId?: string;
  /** One of ingredientId or subRecipeId must be set */
  ingredientId?: string;
  /** Reference to another recipe used as a component */
  subRecipeId?: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  prepTime: string;
  yieldAmount: number;
  yieldUnit: string;
  ingredients: RecipeIngredient[];
  methodNotes: string[];
  targetMargin: number;       // e.g. 75 for 75%
  laborOverheadPercent: number; // e.g. 30 for 30%
  // Extended fields
  description?: string;
  allergens: string[];
  portionSize?: number;
  portionUnit?: string;
  targetFoodCostPercent?: number;
  salePrice?: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  revenue: number;
  cost: number;
}

export type Screen = 'dashboard' | 'sales' | 'recipes' | 'inventory';

/** Menu Engineering quadrant classification */
export type DishClassification = 'star' | 'plow-horse' | 'puzzle' | 'dog';
