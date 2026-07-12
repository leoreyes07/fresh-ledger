# Fresh Ledger 🍲📈

**Fresh Ledger** is a premium, real-time cost, inventory, and sales management web application tailored for professional kitchens, restaurants, bakeries, and culinary creators. It enables millimetric food cost tracking and optimizes the financial performance of every single dish or dessert.

---

## 🚀 Key Features

### 1. 📊 Bento-Style Dashboard
- Weekly revenue, total cost, and net margin visualization.
- Interactive weekly profit trends chart.
- Automatic inventory alerts for low-stock raw materials.
- Direct access to historically high-margin recipes.

### 2. 🧾 Real-Time Sales Logging
- Sales records filtering by timeframe and search filters.
- Automatic cost-of-goods-sold (COGS) vs revenue comparisons.
- Complete transaction log with easy entry deletion.

### 3. ⚖️ Dynamic Recipe Cost Calculator
- Detailed raw ingredient cost breakdown.
- **Dual Automatic Unit Converter**: Add quantities in either **grams** or **ounces**, automatically converting and normalizing them based on the inventory unit (kg, L, g, ml, etc.) instantly.
- Intelligent scaling (1x, 2x, 5x, 10x batches) for catering, events, or prep lists.
- Recommended retail pricing suggestions based on **Target Gross Margin (%)** and labor overhead.
- Printable recipe cards for kitchen workstations.
- Complete recipe deletion to clean up demo items and start fresh.

### 4. 📦 Smart Inventory Control
- Raw materials status tracking (In Stock, Low Stock, Out of Stock).
- Millimetric unit cost calculations and total asset valuation.
- Easy ingredient additions, edits, and deletions.

### 5. 🗺️ URL-Based Navigation
- Full integration with `react-router-dom` for clean, bookmarkable paths.
- Direct linking to recipe detail pages (e.g. `/recipes/sourdough`).
- Responsive, collapsable side navigation for mobile viewports.

### 6. 🌐 Dual-Language Support
- Fluent dynamic switching between **Spanish** and **English** (names, units, steps, and categories translation).

---

## 🛠️ Tech Stack

- **React 19** & **TypeScript** (fully type-safe codebase).
- **Vite** (for blazing-fast local server and building).
- **React Router DOM v6** (client-side routing).
- **Tailwind CSS** (sleek, modern, HSL-color bento UI).
- **Lucide React** (modern iconography).
- **Local Storage API** (100% offline persistence without external database configuration).

---

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended) along with npm.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fresh-ledger.git
   cd fresh-ledger
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.

4. **Verify types and lint**:
   ```bash
   npm run lint
   ```

---

## 📁 Project Structure

```text
fresh-ledger/
├── src/
│   ├── components/       # Interface screens and modular components
│   ├── data.ts           # Seed mock data (Ingredients, Recipes, Sales)
│   ├── types.ts          # TypeScript type definitions
│   ├── translations.ts   # Localization dictionary
│   ├── LanguageContext.tsx # Global language provider
│   ├── main.tsx          # Application entry point & router wrapping
│   └── App.tsx           # Layout, global state, and route configuration
├── package.json          # Dependencies and scripts
└── README.md             # Documentation
```

---

## 💾 Persistence
All changes (ingredients added, recipes logged/edited, sales recorded, and items deleted) are synchronized instantly using the browser's `localStorage`. You can refresh the page or restart your browser without losing your workspace setup.
