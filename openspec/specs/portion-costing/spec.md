# Specification: Portion Costing

## 1. Overview
Defines the mathematical models to calculate the exact cost of an ice cream portion (scoop) extracted from a bulk container (e.g., a 2.5-gallon tub), accounting for volume conversions and yield loss (waste).

## 2. Requirements

### 2.1. Bulk Inventory Model
- System must allow defining an `InventoryItem`.
- An `InventoryItem` must have:
  - `name` (e.g., "Vanilla Ice Cream Tub")
  - `cost` (total cost to purchase)
  - `volume` (e.g., 2.5)
  - `unit` (e.g., "gallons", "units")
  - `yieldFactor` (0.0 to 1.0, representing usable product after waste, default 0.95)

### 2.2. Volume Conversions
- 1 Gallon = 128 Fluid Ounces (fl oz).
- A 2.5-gallon tub contains `2.5 * 128 = 320 fl oz` theoretically.
- Usable volume = `Total Volume * yieldFactor`. Example: If yield is 95%, usable = 304 fl oz.

### 2.3. Cost Calculation
- Cost per usable fl oz = `Total Cost / Usable Volume`.
- Example: $30 tub. Usable = 304 fl oz. Cost per oz = $0.098.
- Cost per scoop = `Scoop Size (oz) * Cost per usable fl oz`.

## 3. Scenarios

### Scenario 1: Standard Tub Costing
- Given a 2.5-gallon tub costing $35.00
- And a yield factor of 95% (304 usable oz)
- When calculating the cost of a 4 oz scoop
- Then the cost should be `(35 / 304) * 4 = $0.46`
