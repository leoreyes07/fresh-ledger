import { InventoryItem, MenuItem } from '../types';

export const CONSTANTS = {
  FL_OZ_PER_GALLON: 128,
};

/**
 * Calculates the cost of a single unit of an inventory item.
 * For Ice Cream Tubs (gallons), it returns the cost per fluid ounce (fl oz),
 * taking into account the yield factor (waste).
 * For other items (packaging, units), it returns the raw cost per unit.
 */
export function calculateCostPerUnit(item: InventoryItem): number {
  if (item.category === 'Ice Cream Tub' && item.unit === 'gallons') {
    const totalUsableOz = item.volume * CONSTANTS.FL_OZ_PER_GALLON * item.yieldFactor;
    return item.unitCost / totalUsableOz; // Cost per fl oz
  }
  
  // For Packaging or items where volume isn't converted, volume is usually 1
  return item.unitCost / item.volume; 
}

/**
 * Calculates the Total Cost of Goods Sold (COGS) for a MenuItem
 * by summing the cost of all its components.
 */
export function calculateMenuCOGS(menuItem: MenuItem, inventory: InventoryItem[]): number {
  return menuItem.components.reduce((total, component) => {
    const item = inventory.find(i => i.id === component.inventoryItemId);
    if (!item) return total;
    
    const costPerUnit = calculateCostPerUnit(item);
    return total + (costPerUnit * component.quantity);
  }, 0);
}

/**
 * Calculates the Suggested Retail Price based on COGS and Target Margin %.
 * Formula: Price = Cost / (1 - Margin)
 * Example: Margin 70% (0.7). Cost $1.00 -> 1.00 / 0.3 = $3.33
 */
export function calculateSuggestedPrice(cogs: number, targetMarginPercent: number): number {
  const marginDecimal = targetMarginPercent / 100;
  if (marginDecimal >= 1) return cogs; // Edge case protection
  return cogs / (1 - marginDecimal);
}
