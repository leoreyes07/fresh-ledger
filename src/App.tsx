import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import SalesReportsScreen from './components/SalesReportsScreen';
import RecipeCalculatorScreen from './components/RecipeCalculatorScreen';
import InventoryScreen from './components/InventoryScreen';
import NewEntryModal from './components/NewEntryModal';
import LoginScreen from './components/LoginScreen';
import SettingsScreen from './components/SettingsScreen';

import { useAuth } from './lib/AuthContext';
import { useSettings } from './lib/SettingsContext';
import * as inventoryService from './lib/db/inventoryService';
import * as menuItemsService from './lib/db/menuItemsService';
import * as salesService from './lib/db/salesService';

import { InventoryItem, MenuItem, SaleRecord } from './types';

export default function App() {
  const { session, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const businessName = settings?.ui?.business_name || 'Mi negocio';
  
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const location = useLocation();

  // Core state — loaded from Supabase
  const [ingredients, setIngredients] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<MenuItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load data once user is authenticated
  useEffect(() => {
    if (!session) {
      setIngredients([]);
      setRecipes([]);
      setSales([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setDataError(null);

    Promise.all([
      inventoryService.getAll(),
      menuItemsService.getAll(),
      salesService.getAll(),
    ])
      .then(([ings, recs, sls]) => {
        setIngredients(ings);
        setRecipes(recs);
        setSales(sls);
      })
      .catch(err => setDataError(err.message))
      .finally(() => setDataLoading(false));
  }, [session]);

  // Synchronize document titles with routing
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/dashboard')) {
      document.title = `Dashboard - ${businessName}`;
    } else if (path.startsWith('/sales')) {
      document.title = `Sales Reports - ${businessName}`;
    } else if (path.startsWith('/recipes')) {
      document.title = `MenuItem Calculator - ${businessName}`;
    } else if (path.startsWith('/inventory')) {
      document.title = `Inventory - ${businessName}`;
    } else {
      document.title = businessName;
    }
  }, [location, businessName]);

  // --- Handlers (now async, calling services) ---------------

  const handleAddIngredient = async (newIng: Omit<InventoryItem, 'id'>) => {
    const created = await inventoryService.create(newIng);
    setIngredients(prev => [...prev, created]);
  };

  const handleUpdateIngredient = async (updatedIng: InventoryItem) => {
    const { id, ...rest } = updatedIng;
    const updated = await inventoryService.update(id, rest);
    setIngredients(prev => prev.map(ing => ing.id === updated.id ? updated : ing));
  };

  const handleRemoveIngredient = async (id: string) => {
    await inventoryService.remove(id);
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const handleAddRecipe = async (newRec: Omit<MenuItem, 'id'>) => {
    const created = await menuItemsService.create(newRec);
    setRecipes(prev => [...prev, created]);
  };

  const handleUpdateRecipe = async (updatedRec: MenuItem) => {
    const { id, ...rest } = updatedRec;
    const updated = await menuItemsService.update(id, rest);
    setRecipes(prev => prev.map(rec => rec.id === updated.id ? updated : rec));
  };

  const handleRemoveRecipe = async (id: string) => {
    await menuItemsService.remove(id);
    setRecipes(prev => prev.filter(rec => rec.id !== id));
  };

  const handleAddSale = async (newSale: Omit<SaleRecord, 'id'>) => {
    const created = await salesService.create(newSale);
    setSales(prev => [created, ...prev]);
  };

  const handleRemoveSale = async (id: string) => {
    await salesService.remove(id);
    setSales(prev => prev.filter(s => s.id !== id));
  };

  // --- Auth loading state -----------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface mb-4 shadow-lg animate-pulse">
            <span className="text-3xl">🌿</span>
          </div>
          <p className="text-sm text-subtle">Loading Fresh Ledger...</p>
        </div>
      </div>
    );
  }

  // --- Auth guard: show login if not authenticated ----------

  if (!session) {
    return <LoginScreen />;
  }

  // --- Data loading state -----------------------------------

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface mb-4 shadow-lg">
            <span className="text-3xl">🌿</span>
          </div>
          <p className="text-sm text-subtle">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="max-w-md text-center px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-main mb-2">Failed to load data</h2>
          <p className="text-sm text-subtle mb-4">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-main antialiased transition-colors duration-200">
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
          <Route path="/settings" element={<SettingsScreen />} />
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
