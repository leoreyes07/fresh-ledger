// ============================================================
// Core domain types for Retail Ice Cream Costing
// ============================================================

export type InventoryCategory = 'Ice Cream Tub' | 'Packaging' | 'Topping' | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  stockLevel: number;
  unit: 'gallons' | 'units' | 'oz' | 'lbs';
  unitCost: number;       // The total cost to purchase the unit (e.g., $35 for a tub)
  volume: number;         // E.g., 2.5 for a 2.5-gallon tub. 1 for packaging.
  /** 0.0 to 1.0 — ratio of usable product after waste/trimming. Default 0.95 for tubs. */
  yieldFactor: number;
  // Extended fields
  supplier?: string;
  lastPurchaseDate?: string;
}

export interface PriceRecord {
  id: number;
  inventoryItemId: string;
  price: number;
  recordedAt: string;
}

export interface MenuComponent {
  id?: number;
  menuItemId?: string;
  inventoryItemId: string;
  quantity: number; // For Ice Cream: in fl oz (scoop size). For Packaging: in units.
}

export interface MenuItem {
  id: string;
  name: string;              // e.g., "Double Scoop Waffle Cone"
  category: string;
  components: MenuComponent[];
  targetMargin: number;      // e.g., 70 for 70%
  // Extended fields
  description?: string;
  allergens: string[];
  salePrice?: number;        // Explicit override. If undefined, calculate suggested price
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
