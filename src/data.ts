import { Ingredient, Recipe, SaleRecord } from './types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Bread Flour (High Protein)', category: 'Flour & Grains', stockLevel: 150, unit: 'kg', unitCost: 2.0, yieldFactor: 1 },
  { id: '2', name: 'Filtered Water', category: 'Liquids', stockLevel: 500, unit: 'L', unitCost: 0.1, yieldFactor: 1 },
  { id: '3', name: 'Active Sourdough Starter', category: 'Starters', stockLevel: 10, unit: 'kg', unitCost: 1.5, yieldFactor: 1 },
  { id: '4', name: 'Fine Sea Salt', category: 'Spices & Seasonings', stockLevel: 15, unit: 'kg', unitCost: 5.0, yieldFactor: 1 },
  { id: '5', name: 'Rice Flour (for dusting)', category: 'Flour & Grains', stockLevel: 20, unit: 'kg', unitCost: 3.0, yieldFactor: 1 },
  { id: '6', name: 'Fresh Basil', category: 'Herbs', stockLevel: 2.5, unit: 'kg', unitCost: 12.0, yieldFactor: 0.85 },
  { id: '7', name: 'Olive Oil (Extra Virgin)', category: 'Oils & Fats', stockLevel: 15, unit: 'L', unitCost: 8.5, yieldFactor: 1 },
  { id: '8', name: 'Large Grade A Eggs', category: 'Dairy & Eggs', stockLevel: 12, unit: 'units', unitCost: 0.25, yieldFactor: 1 },
  { id: '9', name: 'Beef Short Ribs', category: 'Meats', stockLevel: 25, unit: 'kg', unitCost: 18.0, yieldFactor: 0.80 },
  { id: '10', name: 'Atlantic Salmon Fillet', category: 'Meats', stockLevel: 18, unit: 'kg', unitCost: 22.0, yieldFactor: 0.90 },
  { id: '11', name: 'Arborio Rice', category: 'Flour & Grains', stockLevel: 40, unit: 'kg', unitCost: 4.5, yieldFactor: 1 },
  { id: '12', name: 'Black Truffle Oil', category: 'Oils & Fats', stockLevel: 2, unit: 'L', unitCost: 95.0, yieldFactor: 1 }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'sourdough',
    name: 'Artisanal Sourdough',
    category: 'Bread & Bakery',
    prepTime: '24h',
    yieldAmount: 2,
    yieldUnit: 'Loaves (800g ea)',
    ingredients: [
      { ingredientId: '1', quantity: 1.0 }, // 1000g = 1kg
      { ingredientId: '2', quantity: 0.75 }, // 750ml = 0.75L
      { ingredientId: '3', quantity: 0.20 }, // 200g = 0.2kg
      { ingredientId: '4', quantity: 0.02 }, // 20g = 0.02kg
      { ingredientId: '5', quantity: 0.05 }  // 50g = 0.05kg
    ],
    methodNotes: [
      'Autolyse flour and water for 1 hour.',
      'Mix in starter and salt. Stretch and fold 4 times over 2 hours.',
      'Bulk ferment at room temp for 4-6 hours until 50% increase.',
      'Shape and cold retard in bannetons for 12-16 hours.',
      'Bake in Dutch oven at 450°F (20 mins covered, 20 mins uncovered).'
    ],
    targetMargin: 75,
    laborOverheadPercent: 30,
    allergens: ['gluten'],
  },
  {
    id: 'ribs',
    name: 'Braised Ribs',
    category: 'Entrees',
    prepTime: '4h',
    yieldAmount: 10,
    yieldUnit: 'Portions',
    ingredients: [
      { ingredientId: '9', quantity: 3.5 }, // Beef Short Ribs
      { ingredientId: '7', quantity: 0.2 }, // Olive Oil
      { ingredientId: '4', quantity: 0.05 } // Sea Salt
    ],
    methodNotes: [
      'Sear short ribs on all sides until deep brown.',
      'Braised with red wine, aromatics, and beef stock at 325°F for 3 hours.',
      'Let rest, strain and reduce braising liquid to a glaze.'
    ],
    targetMargin: 68,
    laborOverheadPercent: 25,
    allergens: [],
  },
  {
    id: 'salmon',
    name: 'Sous Vide Salmon',
    category: 'Entrees',
    prepTime: '1h',
    yieldAmount: 6,
    yieldUnit: 'Portions',
    ingredients: [
      { ingredientId: '10', quantity: 1.2 }, // Salmon fillet
      { ingredientId: '7', quantity: 0.1 },  // Olive Oil
      { ingredientId: '4', quantity: 0.02 }  // Salt
    ],
    methodNotes: [
      'Portion salmon fillets into 200g cuts.',
      'Vacuum seal with olive oil, salt, and fresh herbs.',
      'Cook in water bath at 122°F (50°C) for 40 minutes, then sear skin if desired.'
    ],
    targetMargin: 62,
    laborOverheadPercent: 20,
    allergens: ['fish'],
  },
  {
    id: 'risotto',
    name: 'Truffle Risotto',
    category: 'Entrees',
    prepTime: '45m',
    yieldAmount: 8,
    yieldUnit: 'Portions',
    ingredients: [
      { ingredientId: '11', quantity: 1.0 },  // Arborio Rice
      { ingredientId: '12', quantity: 0.05 }, // Truffle Oil
      { ingredientId: '4', quantity: 0.02 },  // Salt
      { ingredientId: '8', quantity: 4 }      // Eggs (for texture/enriching)
    ],
    methodNotes: [
      'Toast arborio rice in deep pan.',
      'Slowly add warm stock, stirring continuously until fully absorbed.',
      'Finish with butter, parmigiano-reggiano, and drizzle with truffle oil.'
    ],
    targetMargin: 55,
    laborOverheadPercent: 25,
    allergens: ['gluten', 'eggs', 'dairy'],
  }
];


export const INITIAL_SALES: SaleRecord[] = [
  { id: 's1', date: 'Oct 24, 2023', itemName: 'Truffle Risotto', quantity: 12, revenue: 336.00, cost: 84.00 },
  { id: 's2', date: 'Oct 24, 2023', itemName: 'Seared Scallops', quantity: 8, revenue: 256.00, cost: 96.00 },
  { id: 's3', date: 'Oct 24, 2023', itemName: 'Wagyu Burger', quantity: 24, revenue: 528.00, cost: 168.00 },
  { id: 's4', date: 'Oct 23, 2023', itemName: 'House Salad', quantity: 35, revenue: 420.00, cost: 70.00 },
  { id: 's5', date: 'Oct 23, 2023', itemName: 'Truffle Risotto', quantity: 15, revenue: 420.00, cost: 105.00 },
  { id: 's6', date: 'Oct 22, 2023', itemName: 'Braised Ribs', quantity: 18, revenue: 810.00, cost: 240.00 },
  { id: 's7', date: 'Oct 22, 2023', itemName: 'Artisanal Sourdough', quantity: 50, revenue: 450.00, cost: 131.50 },
  { id: 's8', date: 'Oct 21, 2023', itemName: 'Sous Vide Salmon', quantity: 14, revenue: 490.00, cost: 180.00 },
  { id: 's9', date: 'Oct 21, 2023', itemName: 'House Salad', quantity: 20, revenue: 240.00, cost: 40.00 },
  { id: 's10', date: 'Oct 20, 2023', itemName: 'Wagyu Burger', quantity: 30, revenue: 660.00, cost: 210.00 }
];
