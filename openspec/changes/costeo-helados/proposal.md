# Proposal: Ice Cream Costing & Pricing / Costeo y Pricing de Helados

## Intent / Propósito
**[EN]** The user buys 2.5-gallon ice cream tubs and needs to calculate the cost per portion (scoop/cone/cup) to determine the ideal selling price based on a target margin. We are pivoting the app from a general cooking recipe ledger to a retail portion costing calculator.
**[ES]** El usuario compra baldes de helado de 2.5 galones y necesita calcular el costo por porción (bocha/cono/copa) para definir el precio de venta ideal basado en un margen objetivo. Pivotamos la app de un "libro de recetas" general a una calculadora de costeo de porciones para reventa.

## Scope / Alcance

### In Scope / Dentro del Alcance
- **[EN]** Model ice cream tubs as inventory items (cost per 2.5 gal).
- **[ES]** Modelar los baldes de helado como inventario (costo por 2.5 galones).
- **[EN]** Model portion sizes (e.g., scoops in oz) to calculate unit cost.
- **[ES]** Modelar tamaños de porción (ej. bocha en oz) para calcular el costo unitario.
- **[EN]** Include additional serving costs (cones, cups, spoons).
- **[ES]** Incluir costos adicionales por servicio (cucuruchos, vasos, cucharitas).
- **[EN]** Pricing calculator dashboard based on target margins.
- **[ES]** Dashboard de cálculo de precios basado en márgenes deseados.

### Out of Scope / Fuera del Alcance
- **[EN]** Manufacturing/Recipes (mixing raw ingredients like milk and sugar).
- **[ES]** Fabricación/Recetas (mezclar ingredientes crudos como leche y azúcar).
- **[EN]** Complex inventory depletion tracking.
- **[ES]** Seguimiento de stock descontado en tiempo real.

## Capabilities / Capacidades

### New Capabilities
- `portion-costing`: Calculation of cost per serving from bulk container volume/weight. / Cálculo de costo por porción desde el volumen/peso del contenedor.

### Modified Capabilities
- `recipe-management`: Changed from "cooking recipes" to "serving configurations" (e.g., "2 scoops in a waffle cone"). / Cambiado de "recetas de cocina" a "configuraciones de servicio" (ej. "2 bochas en cono dulce").

## Approach / Enfoque
**[EN]** We will simplify the `types.ts` file. Instead of `Recipe` having raw ingredients, a "Serving Configuration" will consist of a "Bulk Product" (fraction of the tub) plus "Packaging/Toppings". The dashboard will focus on calculating how many scoops yield from a 2.5-gal tub and the total cost per serving.
**[ES]** Simplificaremos `types.ts`. En vez de usar ingredientes crudos, una "Configuración de Servicio" consistirá en un "Producto a Granel" (fracción del balde) más "Empaque/Toppings". El dashboard se enfocará en calcular cuántas bochas rinde un balde de 2.5 gal. y el costo final de cada venta.

## Affected Areas / Áreas Afectadas

| Area | Impact | Description |
|------|--------|-------------|
| `src/types.ts` | Modified | Update domain models to reflect Retail (Tubs -> Servings) / Actualizar modelos para reventa. |
| `src/data.ts` | Modified | Replace initial data with 2.5 gal tub examples / Reemplazar con ejemplos de baldes. |
| `src/components/` | Modified | Adapt views to the new pricing logic / Adaptar vistas a la nueva lógica de pricing. |

## Risks / Riesgos

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **[EN]** Volume vs Weight / Volumen vs Peso | Medium | **[EN]** Tubs are in gallons, portions might be in oz. Need clear conversion factors. / **[ES]** Baldes en galones, porciones en oz. Requerimos factores de conversión claros (1 gal = 128 fl oz). |
| **[EN]** Yield loss (Waste) / Merma al servir | High | **[EN]** Not every drop of the tub can be scooped. Add a "Yield Factor" (e.g. 95%). / **[ES]** Siempre queda helado pegado al balde. Agregar un factor de rendimiento (ej: 95%). |

## Rollback Plan / Plan de Reversión
**[EN]** Revert git commits to the current state. The current state is fully functional for standard recipes.
**[ES]** Revertir los commits de git al estado actual mediante control de versiones.

## Dependencies / Dependencias
- None. / Ninguna.

## Success Criteria / Criterios de Éxito
- [ ] **[EN]** User can input the price of a 2.5-gallon tub. / **[ES]** El usuario puede ingresar el precio del balde.
- [ ] **[EN]** User can define portion sizes and see the exact cost per serving. / **[ES]** El usuario puede definir tamaño de porción y ver el costo exacto.
- [ ] **[EN]** User can add a target margin and get a suggested retail price. / **[ES]** El usuario obtiene un precio sugerido según el margen.
