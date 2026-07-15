import React, { useState } from 'react';
import { X, Receipt, ClipboardList, Utensils, Trash2, Plus } from 'lucide-react';
import { Ingredient, Recipe, RecipeIngredient, SaleRecord } from '../types';
import { useLanguage } from '../LanguageContext';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onAddRecipe: (rec: Omit<Recipe, 'id'>) => void;
  onAddSale: (sale: Omit<SaleRecord, 'id'>) => void;
  ingredients: Ingredient[];
}

export default function NewEntryModal({ isOpen, onClose, onAddIngredient, onAddRecipe, onAddSale, ingredients }: NewEntryModalProps) {
  const { language, t, translateItem, translateCategory, translateUnit } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sale' | 'ingredient' | 'recipe'>('sale');

  // Sale form state
  const [saleItemName, setSaleItemName] = useState('Artisanal Sourdough');
  const [saleQty, setSaleQty] = useState(1);
  const [saleRev, setSaleRev] = useState(9.00);
  const [saleCost, setSaleCost] = useState(2.63);

  // Ingredient form state
  const [ingName, setIngName] = useState('');
  const [ingCategory, setIngCategory] = useState('Flour & Grains');
  const [ingStock, setIngStock] = useState(1);
  const [ingUnit, setIngUnit] = useState('kg');
  const [ingCost, setIngCost] = useState(1.50);

  // Recipe form state
  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Bread & Bakery');
  const [recipePrep, setRecipePrep] = useState('1h');
  const [recipeYieldAmt, setRecipeYieldAmt] = useState(2);
  const [recipeYieldUnit, setRecipeYieldUnit] = useState('Loaves');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  // Current adding ingredient state
  const [selectedIngId, setSelectedIngId] = useState(ingredients[0]?.id || '');
  const [qtyGrams, setQtyGrams] = useState('');
  const [qtyOunces, setQtyOunces] = useState('');
  const [qtyUnits, setQtyUnits] = useState('');

  if (!isOpen) return null;

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSale({
      date: new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      itemName: saleItemName,
      quantity: Number(saleQty),
      revenue: Number(saleRev),
      cost: Number(saleCost)
    });
    onClose();
  };

  const handleIngredientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;
    onAddIngredient({
      name: ingName,
      category: ingCategory,
      stockLevel: Number(ingStock),
      unit: ingUnit,
      unitCost: Number(ingCost),
      yieldFactor: 1,
    });
    onClose();
  };

  const handleRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) return;
    onAddRecipe({
      name: recipeName,
      category: recipeCategory,
      prepTime: recipePrep,
      yieldAmount: Number(recipeYieldAmt),
      yieldUnit: recipeYieldUnit,
      ingredients: recipeIngredients,
      methodNotes: ['Combine ingredients.', 'Process, portion, and bake.'],
      targetMargin: 70,
      laborOverheadPercent: 25,
      allergens: [],
    });
    // Reset recipe state
    setRecipeName('');
    setRecipeIngredients([]);
    onClose();
  };

  // Unit conversion helpers
  const selectedIng = ingredients.find(i => i.id === selectedIngId) || ingredients[0];
  const baseUnit = selectedIng ? selectedIng.unit : 'g';

  const handleGramsChange = (val: string) => {
    setQtyGrams(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setQtyOunces((num * 0.0352739619).toFixed(3));
    } else {
      setQtyOunces('');
    }
  };

  const handleOuncesChange = (val: string) => {
    setQtyOunces(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setQtyGrams((num * 28.3495231).toFixed(2));
    } else {
      setQtyGrams('');
    }
  };

  const handleAddIngToRecipe = () => {
    if (!selectedIngId) return;
    let qty = 0;
    if (baseUnit === 'units') {
      qty = parseFloat(qtyUnits);
    } else {
      const g = parseFloat(qtyGrams);
      if (isNaN(g) || g <= 0) return;
      if (baseUnit === 'kg' || baseUnit === 'L') {
        qty = g / 1000;
      } else {
        qty = g;
      }
    }

    if (isNaN(qty) || qty <= 0) return;

    setRecipeIngredients(prev => {
      const existing = prev.find(ri => ri.ingredientId === selectedIngId);
      if (existing) {
        return prev.map(ri => ri.ingredientId === selectedIngId ? { ...ri, quantity: ri.quantity + qty } : ri);
      }
      return [...prev, { ingredientId: selectedIngId, quantity: qty }];
    });

    setQtyGrams('');
    setQtyOunces('');
    setQtyUnits('');
  };

  const handleRemoveIngFromRecipe = (id: string) => {
    setRecipeIngredients(prev => prev.filter(ri => ri.ingredientId !== id));
  };

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#bbcabf] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-[#0b1c30]">{t('modal.title')}</h3>
            <p className="text-xs text-[#545f73]">{t('modal.sub')}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1 bg-[#f8f9ff] p-1.5 rounded-xl my-4">
          <button
            onClick={() => setActiveTab('sale')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'sale'
                ? 'bg-white text-[#006c49] shadow-sm'
                : 'text-[#545f73] hover:text-[#0b1c30]'
            }`}
          >
            <Receipt size={14} />
            {t('modal.saleTab')}
          </button>
          <button
            onClick={() => setActiveTab('ingredient')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'ingredient'
                ? 'bg-white text-[#006c49] shadow-sm'
                : 'text-[#545f73] hover:text-[#0b1c30]'
            }`}
          >
            <ClipboardList size={14} />
            {t('modal.ingTab')}
          </button>
          <button
            onClick={() => setActiveTab('recipe')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'recipe'
                ? 'bg-white text-[#006c49] shadow-sm'
                : 'text-[#545f73] hover:text-[#0b1c30]'
            }`}
          >
            <Utensils size={14} />
            {t('modal.recipeTab')}
          </button>
        </div>

        {/* Dynamic Forms Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'sale' && (
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.selectItem')}</label>
                <select
                  value={saleItemName}
                  onChange={(e) => {
                    const item = e.target.value;
                    setSaleItemName(item);
                    if (item === 'Artisanal Sourdough') { setSaleRev(saleQty * 9.00); setSaleCost(saleQty * 2.63); }
                    else if (item === 'Braised Ribs') { setSaleRev(saleQty * 45.00); setSaleCost(saleQty * 14.40); }
                    else if (item === 'Sous Vide Salmon') { setSaleRev(saleQty * 35.00); setSaleCost(saleQty * 12.85); }
                    else if (item === 'Truffle Risotto') { setSaleRev(saleQty * 28.00); setSaleCost(saleQty * 7.00); }
                  }}
                  className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none cursor-pointer"
                >
                  <option value="Artisanal Sourdough">{translateItem('Artisanal Sourdough')}</option>
                  <option value="Braised Ribs">{translateItem('Braised Ribs')}</option>
                  <option value="Sous Vide Salmon">{translateItem('Sous Vide Salmon')}</option>
                  <option value="Truffle Risotto">{translateItem('Truffle Risotto')}</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.qty')}</label>
                  <input
                    type="number"
                    min="1"
                    value={saleQty}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setSaleQty(q);
                      if (saleItemName === 'Artisanal Sourdough') { setSaleRev(q * 9.00); setSaleCost(q * 2.63); }
                      else if (saleItemName === 'Braised Ribs') { setSaleRev(q * 45.00); setSaleCost(q * 14.40); }
                      else if (saleItemName === 'Sous Vide Salmon') { setSaleRev(q * 35.00); setSaleCost(q * 12.85); }
                      else if (saleItemName === 'Truffle Risotto') { setSaleRev(q * 28.00); setSaleCost(q * 7.00); }
                    }}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.revenue')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={saleRev}
                    onChange={(e) => setSaleRev(Number(e.target.value))}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.cost')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={saleCost}
                    onChange={(e) => setSaleCost(Number(e.target.value))}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#006c49] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  {t('modal.confirmSale')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'ingredient' && (
            <form onSubmit={handleIngredientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.ingName')}</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Yeast, Sugar, Butter"
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.category')}</label>
                  <select
                    value={ingCategory}
                    onChange={(e) => setIngCategory(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.initialStock')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ingStock}
                    onChange={(e) => setIngStock(Number(e.target.value))}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.unit')}</label>
                  <select
                    value={ingUnit}
                    onChange={(e) => setIngUnit(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none cursor-pointer"
                  >
                    <option value="kg">kg ({translateUnit('kg')})</option>
                    <option value="g">g ({translateUnit('g')})</option>
                    <option value="L">L ({translateUnit('L')})</option>
                    <option value="ml">ml ({translateUnit('ml')})</option>
                    <option value="units">units ({translateUnit('units')})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.costPerUnit')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ingCost}
                    onChange={(e) => setIngCost(Number(e.target.value))}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#006c49] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  {t('modal.addToPantry')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'recipe' && (
            <form onSubmit={handleRecipeSubmit} className="space-y-4 pb-6">
              <div>
                <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.recipeName')}</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Garlic Baguette, Croissant"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.category')}</label>
                  <select
                    value={recipeCategory}
                    onChange={(e) => setRecipeCategory(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none cursor-pointer"
                  >
                    <option value="Bread & Bakery">{translateCategory('Bread & Bakery')}</option>
                    <option value="Entrees">{translateCategory('Entrees')}</option>
                    <option value="Appetizers">{translateCategory('Appetizers')}</option>
                    <option value="Desserts">{translateCategory('Desserts')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.prepTime')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 2h, 45m"
                    value={recipePrep}
                    onChange={(e) => setRecipePrep(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.yieldAmt')}</label>
                  <input
                    type="number"
                    min="1"
                    value={recipeYieldAmt}
                    onChange={(e) => setRecipeYieldAmt(Number(e.target.value))}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">{t('modal.yieldUnit')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Loaves, Portions, Cups"
                    value={recipeYieldUnit}
                    onChange={(e) => setRecipeYieldUnit(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              {/* Recipe Ingredients Builder section */}
              <div className="border-t border-[#bbcabf]/30 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">{t('recipe.ingredients')}</h4>
                
                {recipeIngredients.length === 0 ? (
                  <p className="text-xs text-[#545f73] italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    {t('recipe.noIngredients')}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {recipeIngredients.map(ri => {
                      const ing = ingredients.find(i => i.id === ri.ingredientId);
                      if (!ing) return null;
                      return (
                        <div key={ri.ingredientId} className="flex justify-between items-center bg-[#f8f9ff] border border-[#bbcabf]/30 p-2.5 rounded-xl text-xs font-semibold">
                          <span className="text-[#0b1c30]">{translateItem(ing.name)}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[#545f73]">
                              {ing.unit === 'kg' 
                                ? `${(ri.quantity * 1000).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} g (${(ri.quantity * 1000 * 0.0352739619).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 })} oz)` 
                                : ing.unit === 'L'
                                ? `${(ri.quantity * 1000).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} ml (${(ri.quantity * 1000 * 0.0352739619).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 })} oz)`
                                : `${ri.quantity.toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} ${translateUnit(ing.unit)}`}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveIngFromRecipe(ri.ingredientId)}
                              className="text-rose-600 hover:text-rose-800 transition-colors p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add new ingredient box with dual inputs */}
                <div className="bg-[#f8f9ff] border border-[#bbcabf]/50 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#3c4a42] uppercase mb-1">{t('recipe.selectIngredient')}</label>
                    <select
                      value={selectedIngId}
                      onChange={(e) => {
                        setSelectedIngId(e.target.value);
                        setQtyGrams('');
                        setQtyOunces('');
                        setQtyUnits('');
                      }}
                      className="w-full bg-white border border-[#bbcabf] rounded-lg p-2 text-sm text-[#0b1c30] outline-none cursor-pointer"
                    >
                      <option value="" disabled>{t('recipe.selectIngredient')}</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{translateItem(ing.name)} ({translateUnit(ing.unit)})</option>
                      ))}
                    </select>
                  </div>

                  {baseUnit === 'units' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-[#3c4a42] uppercase mb-1">{t('modal.qty')} ({translateUnit('units')})</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={qtyUnits}
                        onChange={(e) => setQtyUnits(e.target.value)}
                        className="w-full bg-white border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                        placeholder="e.g. 4"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#3c4a42] uppercase mb-1">{t('recipe.quantityGrams')}</label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={qtyGrams}
                            onChange={(e) => handleGramsChange(e.target.value)}
                            className="w-full bg-white border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                            placeholder="g"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#3c4a42] uppercase mb-1">{t('recipe.quantityOunces')}</label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={qtyOunces}
                            onChange={(e) => handleOuncesChange(e.target.value)}
                            className="w-full bg-white border border-[#bbcabf] rounded-lg p-2 text-sm font-mono text-[#0b1c30] outline-none"
                            placeholder="oz"
                          />
                        </div>
                      </div>
                      {/* Equivalence warning/label */}
                      {(qtyGrams || qtyOunces) && (
                        <div className="text-[11px] text-emerald-700 font-bold">
                          {t('recipe.equivalentIn')
                            .replace('{amount}', (baseUnit === 'kg' || baseUnit === 'L' ? (parseFloat(qtyGrams || '0') / 1000).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 4 }) : parseFloat(qtyGrams || '0').toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 })).toString())
                            .replace('{unit}', translateUnit(baseUnit))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddIngToRecipe}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                    {t('recipe.addIngredient')}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#006c49] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  {t('modal.createRecipe')}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
