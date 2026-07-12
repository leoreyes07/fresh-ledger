export interface Ingredient {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  unit: string;
  unitCost: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // in unit of the ingredient
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
  targetMargin: number; // e.g. 75 for 75%
  laborOverheadPercent: number; // e.g. 30 for 30%
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
