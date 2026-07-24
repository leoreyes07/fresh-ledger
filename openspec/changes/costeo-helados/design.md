# Technical Design: Ice Cream Costing & Pricing

## 1. Domain Model Changes (`src/types.ts`)

We will rename and adapt the existing types to match the retail/serving business model.

### 1.1 `InventoryItem` (Replaces `Ingredient`)
```typescript
export type InventoryCategory = 'Ice Cream Tub' | 'Packaging' | 'Topping' | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: 'gallons' | 'units' | 'oz' | 'lbs';
  unitCost: number;       // The total cost to purchase the unit (e.g., $35 for a tub)
  volume: number;         // E.g., 2.5 for a 2.5-gallon tub. 1 for packaging.
  yieldFactor: number;    // Usable percentage (0.0 to 1.0). e.g., 0.95 for tubs.
  stockLevel: number;
}
```

### 1.2 `MenuItem` (Replaces `Recipe`)
```typescript
export interface MenuComponent {
  inventoryItemId: string;
  quantity: number; // For Ice Cream: in fl oz (scoop size). For Packaging: in units.
}

export interface MenuItem {
  id: string;
  name: string;              // e.g., "Double Scoop Waffle Cone"
  category: string;
  components: MenuComponent[];
  targetMargin: number;      // e.g., 70 for 70%
  salePrice?: number;        // Explicit override, or dynamically calculated
}
```

## 2. Core Logic / Utilities (`src/lib/calculations.ts` or similar)

A new utility file will handle the mathematical conversions to avoid logic leaks into the UI components.

```typescript
export const CONSTANTS = {
  FL_OZ_PER_GALLON: 128,
};

export function calculateCostPerUnit(item: InventoryItem): number {
  if (item.category === 'Ice Cream Tub' && item.unit === 'gallons') {
    const totalUsableOz = item.volume * CONSTANTS.FL_OZ_PER_GALLON * item.yieldFactor;
    return item.unitCost / totalUsableOz; // Cost per fl oz
  }
  
  // For Packaging or items where volume isn't converted
  return item.unitCost / item.volume; 
}

export function calculateMenuCOGS(menuItem: MenuItem, inventory: InventoryItem[]): number {
  return menuItem.components.reduce((total, component) => {
    const item = inventory.find(i => i.id === component.inventoryItemId);
    if (!item) return total;
    
    const costPerUnit = calculateCostPerUnit(item);
    return total + (costPerUnit * component.quantity);
  }, 0);
}

export function calculateSuggestedPrice(cogs: number, targetMarginPercent: number): number {
  const marginDecimal = targetMarginPercent / 100;
  return cogs / (1 - marginDecimal);
}
```

## 3. Data Seed Changes (`src/data.ts`)

Replace existing data with Retail Ice Cream data:
- **Tubs**: Vanilla, Chocolate, Strawberry (2.5 gallons).
- **Packaging**: Waffle Cones, Sugar Cones, Plastic Cups, Spoons.
- **MenuItems**: 
  - Single Scoop Cup (1 scoop, 1 cup, 1 spoon)
  - Double Scoop Waffle Cone (2 scoops, 1 waffle cone)

## 4. UI Component Updates

### 4.1 Views/Pages
- **Inventory View**: Modify columns to display `volume` and `yieldFactor`. For tubs, show the calculated "Cost per fl oz" in a secondary badge.
- **Menu Items View**: Replace the "Recipe builder". The form needs to allow adding components (scoops in oz, packaging in units). The summary card MUST prominently display:
  - Total COGS (Cost)
  - Target Margin
  - Suggested Retail Price
  - Actual Profit (if overriding Suggested Price)

## 5. Rollout Strategy
1. Update `types.ts` and fix all typescript compilation errors across the project (due to renaming).
2. Create the calculation utilities and tests (if any).
3. Replace `data.ts` to use the new Ice Cream types.
4. Refactor the UI components to align with the new data model.
