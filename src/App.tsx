import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import SalesReportsScreen from './components/SalesReportsScreen';
import RecipeCalculatorScreen from './components/RecipeCalculatorScreen';
import InventoryScreen from './components/InventoryScreen';
import NewEntryModal from './components/NewEntryModal';

import { INITIAL_INGREDIENTS, INITIAL_RECIPES, INITIAL_SALES } from './data';
import { Ingredient, Recipe, SaleRecord } from './types';

export default function App() {
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const location = useLocation();

  // Core Persistent State
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const cached = localStorage.getItem('fresh_ledger_ingredients');
    return cached ? JSON.parse(cached) : INITIAL_INGREDIENTS;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const cached = localStorage.getItem('fresh_ledger_recipes');
    return cached ? JSON.parse(cached) : INITIAL_RECIPES;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const cached = localStorage.getItem('fresh_ledger_sales');
    return cached ? JSON.parse(cached) : INITIAL_SALES;
  });

  // Save states to local storage
  useEffect(() => {
    localStorage.setItem('fresh_ledger_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('fresh_ledger_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('fresh_ledger_sales', JSON.stringify(sales));
  }, [sales]);

  // Synchronize document titles with routing
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/dashboard')) {
      document.title = 'Dashboard - Fresh Ledger';
    } else if (path.startsWith('/sales')) {
      document.title = 'Sales Reports - Fresh Ledger';
    } else if (path.startsWith('/recipes')) {
      document.title = 'Recipe Calculator - Fresh Ledger';
    } else if (path.startsWith('/inventory')) {
      document.title = 'Inventory - Fresh Ledger';
    } else {
      document.title = 'Fresh Ledger';
    }
  }, [location]);

  // Handle data updates
  const handleAddIngredient = (newIng: Omit<Ingredient, 'id'>) => {
    const id = `ing_${Date.now()}`;
    setIngredients(prev => [...prev, { ...newIng, id }]);
  };

  const handleUpdateIngredient = (updatedIng: Ingredient) => {
    setIngredients(prev => prev.map(ing => ing.id === updatedIng.id ? updatedIng : ing));
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const handleAddRecipe = (newRec: Omit<Recipe, 'id'>) => {
    const id = `rec_${Date.now()}`;
    setRecipes(prev => [...prev, { ...newRec, id }]);
  };

  const handleUpdateRecipe = (updatedRec: Recipe) => {
    setRecipes(prev => prev.map(rec => rec.id === updatedRec.id ? updatedRec : rec));
  };

  const handleRemoveRecipe = (id: string) => {
    setRecipes(prev => prev.filter(rec => rec.id !== id));
  };

  const handleAddSale = (newSale: Omit<SaleRecord, 'id'>) => {
    const id = `sale_${Date.now()}`;
    setSales(prev => [
      { ...newSale, id },
      ...prev
    ]);
  };

  const handleRemoveSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] antialiased">
      {/* Navigation sidebar */}
      <Sidebar 
        onOpenNewEntry={() => setIsNewEntryOpen(true)}
      />

      {/* Main viewport area */}
      <main className="lg:ml-[240px] p-4 md:p-8 pt-20 lg:pt-8 min-h-screen max-w-7xl mx-auto w-full">
        <Routes>
          <Route 
            path="/" 
            element={
              <DashboardScreen 
                ingredients={ingredients}
                recipes={recipes}
                sales={sales}
              />
            } 
          />
          <Route 
            path="/sales" 
            element={
              <SalesReportsScreen 
                sales={sales}
                onAddSale={handleAddSale}
                onRemoveSale={handleRemoveSale}
              />
            } 
          />
          <Route 
            path="/recipes" 
            element={
              <RecipeCalculatorScreen 
                recipes={recipes}
                ingredients={ingredients}
                onUpdateRecipe={handleUpdateRecipe}
                onRemoveRecipe={handleRemoveRecipe}
              />
            } 
          />
          <Route 
            path="/recipes/:recipeId" 
            element={
              <RecipeCalculatorScreen 
                recipes={recipes}
                ingredients={ingredients}
                onUpdateRecipe={handleUpdateRecipe}
                onRemoveRecipe={handleRemoveRecipe}
              />
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <InventoryScreen 
                ingredients={ingredients}
                onAddIngredient={handleAddIngredient}
                onUpdateIngredient={handleUpdateIngredient}
                onRemoveIngredient={handleRemoveIngredient}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Generic CTA modal wizard */}
      <NewEntryModal 
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onAddIngredient={handleAddIngredient}
        onAddRecipe={handleAddRecipe}
        onAddSale={handleAddSale}
        ingredients={ingredients}
      />
    </div>
  );
}
