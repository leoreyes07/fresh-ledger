import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../types';
import { useLanguage } from '../LanguageContext';

interface InventoryScreenProps {
  ingredients: InventoryItem[];
  onAddIngredient: (ing: Omit<InventoryItem, 'id'>) => void;
  onUpdateIngredient: (ing: InventoryItem) => void;
  onRemoveIngredient: (id: string) => void;
}

export default function InventoryScreen({
  ingredients,
  onAddIngredient,
  onUpdateIngredient,
  onRemoveIngredient,
}: InventoryScreenProps) {
  const { language, t, translateItem, translateCategory, translateUnit } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // State for Editing an ingredient
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStockLevel, setEditStockLevel] = useState(0);
  const [editUnit, setEditUnit] = useState('kg');
  const [editUnitCost, setEditUnitCost] = useState(0);

  // State for Adding an ingredient
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Flour & Grains');
  const [newStockLevel, setNewStockLevel] = useState(10);
  const [newUnit, setNewUnit] = useState('kg');
  const [newUnitCost, setNewUnitCost] = useState(1.50);

  // List of unique categories for filtering
  const categories = ['All', ...Array.from(new Set(ingredients.map(i => i.category)))];

  // Filters
  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = translateItem(ing.name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate dynamic totals
  const totalValSum = filteredIngredients.reduce((sum, item) => sum + (item.stockLevel * item.unitCost), 0);

  const handleStartEdit = (ing: InventoryItem) => {
    setEditingIngId(ing.id);
    setEditName(ing.name);
    setEditCategory(ing.category);
    setEditStockLevel(ing.stockLevel);
    setEditUnit(ing.unit);
    setEditUnitCost(ing.unitCost);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateIngredient({
      id,
      name: editName,
      category: editCategory,
      stockLevel: Number(editStockLevel),
      unit: editUnit as any,
      unitCost: Number(editUnitCost),
      volume: ingredients.find(i => i.id === id)?.volume ?? 1,
      yieldFactor: ingredients.find(i => i.id === id)?.yieldFactor ?? 1,
    });
    setEditingIngId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddIngredient({
      name: newName,
      category: newCategory,
      stockLevel: Number(newStockLevel),
      unit: newUnit as any,
      unitCost: Number(newUnitCost),
      volume: 1,
      yieldFactor: 1,
    });
    // Reset Form
    setNewName('');
    setNewStockLevel(10);
    setNewUnitCost(1.50);
    setShowAddForm(false);
  };

  // Status dot indicators based on stock levels:
  const getStockStatus = (stock: number, unit: string) => {
    const minThreshold = unit === 'units' ? 15 : 5; // low stock trigger
    if (stock <= 0) return { dotClass: 'bg-rose-500', textClass: 'text-rose-600', label: t('inventory.outOfStock') };
    if (stock < minThreshold) return { dotClass: 'bg-amber-500', textClass: 'text-amber-600', label: t('inventory.lowStock') };
    return { dotClass: 'bg-emerald-500', textClass: 'text-emerald-700', label: t('inventory.inStock') };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Search and Category Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-surface p-5 rounded-3xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('inventory.searchPlaceholder')}
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-hover border border-border rounded-2xl text-sm text-main focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface border border-border text-sm rounded-2xl py-2.5 px-4 text-subtle focus:border-emerald-500 outline-none cursor-pointer w-full md:w-52 font-semibold"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat === 'All' ? t('inventory.allCategories') : translateCategory(cat)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-main tracking-tight font-display">{t('inventory.title')}</h2>
          <p className="text-subtle font-medium mt-1 font-sans">{t('inventory.sub')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            {t('inventory.addIng')}
          </button>
        </div>
      </div>

      {/* Inline add ingredient form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-main uppercase tracking-wider font-display">{t('inventory.addNewIng')}</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-subtle hover:text-subtle"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-subtle uppercase mb-2 tracking-wider">{t('inventory.ingName')}</label>
              <input 
                required
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('inventory.yeastPlaceholder')}
                className="w-full bg-surface-hover border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-subtle uppercase mb-2 tracking-wider">{t('inventory.category')}</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              >
                <option value="Flour & Grains">{translateCategory('Flour & Grains')}</option>
                <option value="Liquids">{translateCategory('Liquids')}</option>
                <option value="Starters">{translateCategory('Starters')}</option>
                <option value="Spices & Seasonings">{translateCategory('Spices & Seasonings')}</option>
                <option value="Herbs">{translateCategory('Herbs')}</option>
                <option value="Oils & Fats">{translateCategory('Oils & Fats')}</option>
                <option value="Dairy & Eggs">{translateCategory('Dairy & Eggs')}</option>
                <option value="Meats">{translateCategory('Meats')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-subtle uppercase mb-2 tracking-wider">{t('inventory.stockAmount')}</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                value={newStockLevel}
                onChange={(e) => setNewStockLevel(Number(e.target.value))}
                className="w-full bg-surface-hover border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-subtle uppercase mb-2 tracking-wider">{t('inventory.unit')}</label>
              <select 
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              >
                <option value="kg">kg ({translateUnit('kg')})</option>
                <option value="g">g ({translateUnit('g')})</option>
                <option value="L">L ({translateUnit('L')})</option>
                <option value="ml">ml ({translateUnit('ml')})</option>
                <option value="units">units ({translateUnit('units')})</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-subtle uppercase mb-2 tracking-wider">{t('inventory.costPerUnit')}</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.001"
                value={newUnitCost}
                onChange={(e) => setNewUnitCost(Number(e.target.value))}
                className="w-full bg-surface-hover border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:brightness-110 shadow-sm active:scale-95 cursor-pointer"
            >
              {t('inventory.addItem')}
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="bg-surface-hover hover:bg-surface-alt text-subtle text-xs font-bold py-2.5 px-5 rounded-xl border border-border cursor-pointer"
            >
              {t('inventory.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Main Pantry Data Table (Bento Container) */}
      <div className="bg-surface border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover text-subtle font-bold text-xs uppercase tracking-wider border-b border-border">
                <th className="py-4 px-6">{t('inventory.thName')}</th>
                <th className="py-4 px-6">{t('inventory.thCategory')}</th>
                <th className="py-4 px-6">{t('inventory.thStock')}</th>
                <th className="py-4 px-6 text-right">{t('inventory.thUnitCost')}</th>
                <th className="py-4 px-6 text-right">{t('inventory.thTotalValue')}</th>
                <th className="py-4 px-6 text-center">{t('inventory.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-main">
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map((item) => {
                  const isEditing = editingIngId === item.id;
                  const status = getStockStatus(item.stockLevel, item.unit);
                  const totalVal = item.stockLevel * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-55/40 transition-colors">
                      {/* Name Col */}
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-surface border border-border rounded-lg p-1.5 text-sm font-bold text-main outline-none focus:border-emerald-500"
                          />
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-subtle font-bold font-display text-xs">
                              {translateItem(item.name).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-extrabold text-main font-sans">{translateItem(item.name)}</span>
                          </div>
                        )}
                      </td>

                      {/* Category Col */}
                      <td className="py-4 px-6 text-subtle font-semibold">
                        {isEditing ? (
                          <input 
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="bg-surface border border-border rounded-lg p-1.5 text-sm text-main outline-none focus:border-emerald-500"
                          />
                        ) : (
                          translateCategory(item.category)
                        )}
                      </td>

                      {/* Stock Level Col */}
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number"
                              value={editStockLevel}
                              onChange={(e) => setEditStockLevel(Number(e.target.value))}
                              className="w-20 bg-surface border border-border rounded-lg p-1.5 text-sm font-mono text-right outline-none focus:border-emerald-500"
                            />
                            <span className="text-xs font-semibold text-subtle">{translateUnit(editUnit)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${status.dotClass}`}></span>
                            <span className="font-bold font-mono text-slate-950">
                              {item.stockLevel} {translateUnit(item.unit)}
                            </span>
                            {item.stockLevel < (item.unit === 'units' ? 15 : 5) && (
                              <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                <AlertTriangle size={10} /> {t('inventory.lowAlert')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Unit Cost Col */}
                      <td className="py-4 px-6 text-right font-semibold text-subtle font-mono">
                        {isEditing ? (
                          <input 
                            type="number"
                            step="0.01"
                            value={editUnitCost}
                            onChange={(e) => setEditUnitCost(Number(e.target.value))}
                            className="w-20 bg-surface border border-border rounded-lg p-1.5 text-sm font-mono text-right outline-none focus:border-emerald-500"
                          />
                        ) : (
                          `$${item.unitCost.toFixed(2)} / ${translateUnit(item.unit)}`
                        )}
                      </td>

                      {/* Total Value Col */}
                      <td className="py-4 px-6 text-right font-black text-main font-mono">
                        ${totalVal.toFixed(2)}
                      </td>

                      {/* Actions Col */}
                      <td className="py-4 px-6 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleSaveEdit(item.id)}
                              className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 rounded-lg cursor-pointer"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => setEditingIngId(null)}
                              className="text-rose-600 hover:text-rose-800 p-1.5 bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-1.5">
                            <button 
                              onClick={() => handleStartEdit(item)}
                              className="text-subtle hover:text-main p-1.5 hover:bg-surface-hover rounded-lg transition-all cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => onRemoveIngredient(item.id)}
                              className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-subtle font-medium">
                    {t('inventory.noMatches')}
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer */}
            <tfoot className="bg-surface-hover border-t-2 border-border">
              <tr>
                <td className="py-4 px-6 text-right font-bold text-xs uppercase tracking-wider text-subtle" colSpan={4}>
                  {t('inventory.totalAssetValue')}
                </td>
                <td className="py-4 px-6 text-right font-black text-emerald-600 text-lg font-mono">
                  ${totalValSum.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
