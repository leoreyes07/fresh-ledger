# Specification: Serving Configuration

## 1. Overview
Replaces standard "cooking recipes" with "serving configurations" (Menu Items). A serving configuration bundles ice cream scoops with packaging (cones, cups) and toppings to determine the total Cost of Goods Sold (COGS) and suggested retail price.

## 2. Requirements

### 2.1. Menu Item Model
- System must allow defining a `MenuItem`.
- A `MenuItem` has:
  - `name` (e.g., "Double Scoop Waffle Cone")
  - `components`: Array of references to `InventoryItem`s and quantities.
  - `targetMargin`: Target profit margin percentage (e.g., 70%).

### 2.2. Component Types
Components can be:
- Ice Cream (measured in fl oz scoops).
- Packaging (measured in units, e.g., 1 waffle cone).

### 2.3. Pricing Calculation
- `Total COGS` = Sum of (Component Quantity * Component Unit Cost).
- `Suggested Price` = `Total COGS / (1 - (targetMargin / 100))`. 
- Example: COGS is $1.00. Target margin is 70%. Suggested price = `1.00 / (1 - 0.70) = $3.33`.

## 3. Scenarios

### Scenario 1: Calculating a Double Scoop Cone
- Given a 4 oz scoop costs $0.46
- And a waffle cone costs $0.25
- When defining a "Double Scoop Cone" Menu Item (2 scoops + 1 cone)
- Then the Total COGS is `(0.46 * 2) + 0.25 = $1.17`
- When target margin is 70%
- Then the Suggested Price should be `$3.90` (1.17 / 0.3)
