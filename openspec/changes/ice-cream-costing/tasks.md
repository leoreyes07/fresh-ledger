# Implementation Tasks: Ice Cream Costing

## 1. Domain Types
- [x] Rename `Ingredient` to `InventoryItem` in `src/types.ts`.
- [x] Add `category` (`Ice Cream Tub` | `Packaging` | `Topping`), `volume`, `yieldFactor` to `InventoryItem`.
- [x] Rename `Recipe` to `MenuItem` in `src/types.ts`.
- [x] Rename `RecipeIngredient` to `MenuComponent` and update references.

## 2. Core Logic
- [x] Create `src/lib/calculations.ts`.
- [x] Implement `calculateCostPerUnit(item)` handling the `volume * 128 * yieldFactor` logic for tubs.
- [x] Implement `calculateMenuCOGS(menuItem, inventory)`.
- [x] Implement `calculateSuggestedPrice(cogs, targetMargin)`.

## 3. Seed Data
- [x] Update `src/data.ts` - `INITIAL_INGREDIENTS` -> `INITIAL_INVENTORY`. Add tubs (2.5 gal) and packaging.
- [x] Update `src/data.ts` - `INITIAL_RECIPES` -> `INITIAL_MENU_ITEMS`. Add examples like "Double Scoop Waffle Cone".
- [x] Update `INITIAL_SALES` to match the new `MenuItem` names.

## 4. UI Components Refactor
- [x] Update `App.tsx` state names (e.g. `ingredients` to `inventory`, `recipes` to `menuItems`).
- [x] Refactor `Inventory` view component to show `volume` and `yieldFactor`.
- [x] Refactor `Recipes` view (now Menu / Servings view) to use the new `calculateMenuCOGS` and `calculateSuggestedPrice` utilities instead of inline calculations.
- [x] Ensure all TypeScript errors are resolved and the Vite dev server runs without issues.
