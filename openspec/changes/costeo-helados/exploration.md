## Exploration: Ice Cream Costing & Pricing / Costeo y Pricing de Helados

### Current State / Estado Actual
**[EN]** The current system (`fresh-ledger`) has a solid foundation for gastronomy costing. The `Ingredient` and `Recipe` types support units, unit costs, and yield factors. However, the data and terminology are built for a general restaurant/bakery (e.g., risotto, sourdough).
**[ES]** El sistema actual (`fresh-ledger`) tiene una base sólida de costeo para gastronomía. Los tipos `Ingredient` y `Recipe` soportan unidades, costos unitarios y factor de rendimiento (mermas). Sin embargo, los datos y la terminología están pensados para un restaurante general (risotto, masa madre).

### Affected Areas / Áreas Afectadas
- **[EN]** `src/types.ts` — Needs adjustments for the ice cream retail world. Key addition: calculate portions (scoops in ounces) from bulk containers (gallons).
- **[ES]** `src/types.ts` — Requiere ajustes para el mundo de la reventa de helados. Clave: calcular porciones (bochas en onzas) desde contenedores a granel (galones).
- **[EN]** `src/data.ts` — Needs cleaning. Introduce retail ice cream base items (2.5-gallon tubs, waffle cones, cups) and modular serving configurations.
- **[ES]** `src/data.ts` — Debe limpiarse. Introducir insumos base de reventa (baldes de 2.5 galones, conos, vasos) y configuraciones de servicio modulares.
- **[EN]** `src/components/...` — The UI must adjust so the main flow (Dashboard) clearly shows: Cost per Tub, Cost per Scoop considering yield loss, and Suggested Selling Price.
- **[ES]** `src/components/...` — La UI debe ajustarse para que el flujo principal muestre: Costo del Balde, Costo por Bocha considerando mermas, y Precio Sugerido.

### Approaches / Enfoques
1. **[EN] Direct Adaptation (Recommended)** — Keep the current structure, adapt the types for "Tubs" and "Servings", and change the mock data.
   **[ES] Adaptación Directa (Recomendada)** — Mantener la estructura actual, adaptar los tipos para "Baldes" y "Porciones", y cambiar los datos de prueba.
   - *Pros:* Very fast to implement, reuses 90% of code. / Muy rápido de implementar, reusa el 90% del código.
   - *Cons:* Needs accurate volume conversions (gallons to fl oz). / Requiere conversiones de volumen exactas.
   - *Effort:* Low / Bajo

2. **[EN] Exclusive Ice Cream Redesign** — Change all semantics entirely to "Bulk Tub", "Scoop", etc., rewriting everything from scratch.
   **[ES] Rediseño Exclusivo Heladero** — Cambiar toda la semántica a "Balde a Granel", "Bocha", etc., reescribiendo todo de cero.
   - *Pros:* Hyper-personalized niche tool. / Herramienta de nicho hiper-personalizada.
   - *Cons:* Loses future flexibility for other desserts. / Pierde flexibilidad para otros postres.
   - *Effort:* Medium / Medio

### Recommendation / Recomendación
**[EN] Option 1: Direct Adaptation.** The system is already powerful. We just need to tweak the units and focus the view on the main need: Profitability per scoop/tub.
**[ES] Opción 1: Adaptación Directa.** El sistema ya es potente. Solo ajustamos las unidades y centramos la vista en la necesidad principal: Rentabilidad por bocha/balde.

### Risks / Riesgos
- **[EN] Density and Yield:** Tubs are bought in gallons but served with waste. Yield factor calculations must be exact.
- **[ES] Densidad y Merma:** Los baldes se compran en galones pero se sirven con merma. El cálculo de rendimiento debe ser exacto.

### Ready for Proposal / Listo para Propuesta
**[EN]** Yes. Ready to define deliverables and write the technical proposal.
**[ES]** Sí. Listos para definir los entregables y escribir la propuesta técnica.
