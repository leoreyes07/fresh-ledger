import React, { useState } from 'react';
import { ArrowLeft, Printer, Info, Save, CheckCircle2, AlertTriangle, Trash2, Plus, Utensils } from 'lucide-react';
import { Recipe, Ingredient, RecipeIngredient } from '../types';
import { useLanguage } from '../LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../lib/SettingsContext';
import { useCurrency } from '../lib/CurrencyContext';

interface RecipeCalculatorScreenProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onUpdateRecipe: (updatedRec: Recipe) => void;
  onRemoveRecipe: (id: string) => void;
}

export default function RecipeCalculatorScreen({
  recipes,
  ingredients,
  onUpdateRecipe,
  onRemoveRecipe,
}: RecipeCalculatorScreenProps) {
  const { recipeId } = useParams<{ recipeId?: string }>();
  const navigate = useNavigate();
  const { language, t, translateItem, translateCategory, translateUnit, translateStep } = useLanguage();
  const { format } = useCurrency();

  // Find currently active recipe or default to artisanal sourdough
  const activeRecipe = recipes.find(r => r.id === recipeId) || recipes.find(r => r.id === 'sourdough') || recipes[0];

  const { settings } = useSettings();
  const defaultTargetMargin = settings.pricing?.default_target_margin || 70;

  const [batchScale, setBatchScale] = useState(1); // multiplier for batch scaling
  const [targetMargin, setTargetMargin] = useState(activeRecipe ? activeRecipe.targetMargin : defaultTargetMargin);
  const [laborOverhead, setLaborOverhead] = useState(activeRecipe ? activeRecipe.laborOverheadPercent : 30);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [editIngredients, setEditIngredients] = useState<RecipeIngredient[]>(activeRecipe ? activeRecipe.ingredients : []);

  // For adding an ingredient to active recipe
  const [selectedIngId, setSelectedIngId] = useState(ingredients[0]?.id || '');
  const [qtyGrams, setQtyGrams] = useState('');
  const [qtyOunces, setQtyOunces] = useState('');
  const [qtyUnits, setQtyUnits] = useState('');

  // Sync state if recipe changes or edit mode toggles
  React.useEffect(() => {
    if (activeRecipe) {
      setTargetMargin(activeRecipe.targetMargin);
      setLaborOverhead(activeRecipe.laborOverheadPercent);
      setCompletedSteps([]);
      setEditIngredients(activeRecipe.ingredients);
      setIsEditingIngredients(false);
    }
  }, [activeRecipe]);

  const handleDeleteRecipe = () => {
    if (!activeRecipe) return;
    if (window.confirm(language === 'es' ? '¿Estás seguro de que querés eliminar esta receta por completo?' : 'Are you sure you want to completely delete this recipe?')) {
      onRemoveRecipe(activeRecipe.id);
      navigate('/recipes');
    }
  };

  if (recipes.length === 0 || !activeRecipe) {
    return (
      <div className="space-y-8 animate-fade-in pb-12">
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center max-w-lg mx-auto mt-12 space-y-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Utensils size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">{language === 'es' ? 'No hay recetas' : 'No recipes'}</h2>
            <p className="text-slate-500 text-sm">
              {language === 'es' 
                ? 'No tenés ninguna receta cargada. Usá el botón "+ Añadir registro" en la barra lateral para crear tu primer plato o postre desde cero.' 
                : 'You have no recipes loaded. Use the "+ Add Entry" button on the sidebar to create your first recipe from scratch.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  const handleAddIngToEdit = () => {
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

    setEditIngredients(prev => {
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

  const handleRemoveIngFromEdit = (id: string) => {
    setEditIngredients(prev => prev.filter(ri => ri.ingredientId !== id));
  };
  const getIngredientDetails = (id: string) => {
    return ingredients.find(ing => ing.id === id);
  };

  // Calculate Ingredient Breakdown
  const ingredientBreakdown = activeRecipe ? activeRecipe.ingredients.map(ri => {
    const ing = getIngredientDetails(ri.ingredientId);
    const scaledQty = ri.quantity * batchScale;
    const unitCost = ing ? ing.unitCost : 0;
    const totalCost = scaledQty * unitCost;

    return {
      id: ri.ingredientId,
      name: ing ? ing.name : 'Unknown Ingredient',
      category: ing ? ing.category : 'N/A',
      quantity: scaledQty,
      unit: ing ? ing.unit : 'units',
      unitCost: unitCost,
      totalCost: totalCost
    };
  }) : [];

  // Financial Sums
  const totalFoodCost = ingredientBreakdown.reduce((sum, item) => sum + item.totalCost, 0);
  const costPerLoafUnit = totalFoodCost / (activeRecipe ? activeRecipe.yieldAmount * batchScale : 1);
  const laborOverheadAmount = totalFoodCost * (laborOverhead / 100);
  const totalLandedCost = totalFoodCost + laborOverheadAmount;

  // Recommended selling price calculation using target margin formula
  const recommendedPrice = totalLandedCost / (1 - (targetMargin / 100)) || 0;

  const calculatedProfit = recommendedPrice - totalLandedCost;

  const handleStepToggle = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(s => s !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };
  const handleSaveModel = () => {
    onUpdateRecipe({
      ...activeRecipe,
      targetMargin: targetMargin,
      laborOverheadPercent: laborOverhead
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  const handlePrint = () => {
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Recipe Selector Row / Back to List button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> {t('recipe.backToRecipes')}
          </button>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">{t('recipe.quickSelect')}</span>
          <div className="flex flex-wrap gap-2">
            {recipes.map(r => (
              <button
                key={r.id}
                onClick={() => navigate('/recipes/' + r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeRecipe.id === r.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {translateItem(r.name)}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono font-bold">
          {t('recipe.code')}: {activeRecipe.id.toUpperCase()}
        </span>
      </div>

      {/* Main Recipe Detail view */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 mb-2">
            <ArrowLeft size={12} className="text-slate-400" />
            <a 
              href="#recipes-list"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className="hover:underline font-bold text-xs uppercase tracking-wider"
            >
              {t('recipe.backToSelection')}
            </a>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">{translateItem(activeRecipe.name)}</h2>
          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs font-bold mt-3">
            <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full text-emerald-800 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {translateCategory(activeRecipe.category)}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">
              {t('recipe.prep')}: {activeRecipe.prepTime}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">
              {t('recipe.yield')}: {activeRecipe.yieldAmount * batchScale} {translateUnit(activeRecipe.yieldUnit.split(' ')[0])}
            </span>
          </div>
        </div>

        <div className="flex gap-2.5">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm px-3 py-1.5">
            <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">{t('recipe.batch')}</span>
            <select
              value={batchScale}
              onChange={(e) => setBatchScale(Number(e.target.value))}
              className="bg-transparent border-none text-xs font-bold text-emerald-600 outline-none cursor-pointer"
            >
              <option value={1}>{t('recipe.batch1x')}</option>
              <option value={2}>{t('recipe.batch2x')}</option>
              <option value={5}>{t('recipe.batch5x')}</option>
              <option value={10}>{t('recipe.batch10x')}</option>
            </select>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Printer size={16} />
            {t('recipe.printCard')}
          </button>
          <button 
            onClick={handleDeleteRecipe}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100/70 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
            title={language === 'es' ? 'Eliminar Receta' : 'Delete Recipe'}
          >
            <Trash2 size={16} className="text-rose-600" />
            <span>{language === 'es' ? 'Eliminar' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-100 transition-all animate-fade-in">
          {t('recipe.savedSuccess')}
        </div>
      )}

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {isEditingIngredients ? t('recipe.editIngredients') : t('recipe.ingredientsBreakdown')}
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsEditingIngredients(!isEditingIngredients)}
                  className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isEditingIngredients ? t('recipe.backToRecipes') : t('recipe.editIngredients')}
                </button>
                {!isEditingIngredients && (
                  <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-500">
                    {activeRecipe.ingredients.length} {t('recipe.itemsListed')}
                  </span>
                )}
              </div>
            </div>

            {isEditingIngredients ? (
              <div className="p-6 space-y-4">
                {/* List ingredients in edit state */}
                {editIngredients.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    {t('recipe.noIngredients')}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {editIngredients.map(ri => {
                      const ing = getIngredientDetails(ri.ingredientId);
                      if (!ing) return null;
                      return (
                        <div key={ri.ingredientId} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs font-bold">
                          <span className="text-slate-800">{translateItem(ing.name)}</span>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-slate-500">
                              {ing.unit === 'kg' 
                                ? `${(ri.quantity * 1000).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} g (${(ri.quantity * 1000 * 0.0352739619).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 })} oz)` 
                                : ing.unit === 'L'
                                ? `${(ri.quantity * 1000).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} ml (${(ri.quantity * 1000 * 0.0352739619).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 })} oz)`
                                : `${ri.quantity.toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} ${translateUnit(ing.unit)}`}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveIngFromEdit(ri.ingredientId)}
                              className="text-rose-600 hover:text-rose-800 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add new ingredient sub-form with dual inputs */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider">{t('recipe.addIngredient')}</h4>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('recipe.selectIngredient')}</label>
                    <select
                      value={selectedIngId}
                      onChange={(e) => {
                        setSelectedIngId(e.target.value);
                        setQtyGrams('');
                        setQtyOunces('');
                        setQtyUnits('');
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{translateItem(ing.name)} ({translateUnit(ing.unit)})</option>
                      ))}
                    </select>
                  </div>

                  {baseUnit === 'units' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('modal.qty')} ({translateUnit('units')})</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={qtyUnits}
                        onChange={(e) => setQtyUnits(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none font-bold"
                        placeholder="e.g. 4"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('recipe.quantityGrams')}</label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={qtyGrams}
                            onChange={(e) => handleGramsChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none font-bold"
                            placeholder="g"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('recipe.quantityOunces')}</label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={qtyOunces}
                            onChange={(e) => handleOuncesChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none font-bold"
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
                    onClick={handleAddIngToEdit}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                    {t('recipe.addIngredient')}
                  </button>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => {
                      onUpdateRecipe({
                        ...activeRecipe,
                        ingredients: editIngredients
                      });
                      setIsEditingIngredients(false);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer text-center"
                  >
                    {t('recipe.saveChanges')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditIngredients(activeRecipe.ingredients);
                      setIsEditingIngredients(false);
                    }}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    {t('sales.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-6">{t('recipe.thIngredient')}</th>
                        <th className="py-4 px-6 text-right">{t('recipe.thQty')}</th>
                        <th className="py-4 px-6 text-right">{t('recipe.thUnitCost')}</th>
                        <th className="py-4 px-6 text-right">{t('recipe.thTotalCost')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ingredientBreakdown.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-display font-bold text-xs">
                              {translateItem(item.name).charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-850">{translateItem(item.name)}</span>
                          </td>
                          <td className="py-4 px-6 text-right text-sm font-semibold text-slate-500 font-mono">
                            {item.quantity.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 3 })} {translateUnit(item.unit)}
                          </td>
                          <td className="py-4 px-6 text-right text-sm text-slate-400 font-mono">
                            {format(item.unitCost)} / {translateUnit(item.unit)}
                          </td>
                          <td className="py-4 px-6 text-right text-sm font-bold text-slate-900 font-mono">
                            {format(item.totalCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-slate-50/50 flex justify-end items-center border-t border-slate-150">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('recipe.totalRawCost')}</span>
                    <span className="text-3xl font-black text-slate-900 font-display">
                      {format(totalFoodCost)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Method Notes Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 font-display">
              <span className="p-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100"><Info size={16} /></span>
              {t('recipe.quickMethodNotes')}
            </h3>
            <div className="space-y-3">
              {activeRecipe.methodNotes.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                return (
                  <div 
                    key={index}
                    onClick={() => handleStepToggle(index)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isCompleted 
                        ? 'bg-emerald-50/60 border-emerald-100 text-slate-500 opacity-70' 
                        : 'bg-slate-50/60 border-slate-100 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <button className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-emerald-600' : 'text-slate-300'}`}>
                      <CheckCircle2 size={18} className={isCompleted ? 'fill-current text-emerald-50 bg-white rounded-full' : ''} />
                    </button>
                    <p className={`text-sm leading-relaxed ${isCompleted ? 'line-through' : 'font-semibold'}`}>
                      {translateStep(step)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Strategy */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5 font-display">{t('recipe.pricingStrategy')}</h3>
              
              <div className="space-y-6">
                {/* Cost Summary block */}
                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">{t('recipe.totalBatchCost').replace('{units}', (activeRecipe.yieldAmount * batchScale).toString())}</span>
                    <span className="font-bold text-slate-800 font-mono">{format(totalFoodCost)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-150 text-xs font-semibold">
                    <span className="text-slate-800 font-bold">{t('recipe.costPerUnit')}</span>
                    <span className="font-extrabold text-slate-900 font-mono">{format(costPerLoafUnit)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold pt-1">
                    <span className="text-slate-500">{t('recipe.laborOverhead').replace('{percent}', laborOverhead.toString())}</span>
                    <span className="font-bold text-rose-600 font-mono">+{format(laborOverheadAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-150 text-xs font-bold text-slate-800">
                    <span>{t('recipe.totalLandedCost')}</span>
                    <span className="font-mono">{format(totalLandedCost)}</span>
                  </div>
                </div>

                {/* Gross Margin input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('recipe.targetGrossMargin')}</label>
                  <div className="relative flex items-center">
                    <input 
                      type="number"
                      min="10"
                      max="95"
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-4 font-bold text-xs text-slate-400">%</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>{t('recipe.industryAverage')}</span>
                    <button 
                      onClick={() => setTargetMargin(defaultTargetMargin)}
                      className="text-emerald-600 hover:underline cursor-pointer"
                    >
                      {t('recipe.resetTarget')}
                    </button>
                  </div>
                </div>

                {/* Recommended Selling Price Card (Emerald highlight box!) */}
                <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-500 transition-all cursor-pointer">
                  <span className="block text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-1">
                    {t('recipe.recommendedSellingPrice')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-display">{format(recommendedPrice)}</span>
                    <span className="text-xs text-emerald-100 font-medium">/ {t('recipe.unitUnit')}</span>
                  </div>
                  <div className="mt-3.5 flex justify-between items-center text-xs border-t border-emerald-500/50 pt-3">
                    <span className="text-emerald-100 font-medium">{t('recipe.calculatedProfit')}</span>
                    <span className="font-bold text-emerald-300 text-sm">
                      +{format(calculatedProfit)} / {t('recipe.unitUnit')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleSaveModel}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 mt-6 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Save size={16} />
              {t('recipe.savePricingModel')}
            </button>
          </div>

          {/* Historical Alerts Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('recipe.priceAlerts')}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-rose-50 p-3.5 rounded-2xl border border-rose-100 text-rose-800">
                <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{t('recipe.flourPriceAlert')}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t('recipe.flourPriceAlertSub')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-display">{t('recipe.printTitle')}</h3>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                {t('recipe.close')}
              </button>
            </div>
            <div className="border border-dashed border-slate-300 p-5 rounded-2xl bg-white text-slate-900" id="printable-area">
              <div className="text-center pb-4 border-b border-slate-100">
                <h1 className="text-xl font-bold uppercase tracking-wider text-emerald-600 font-display">{t('recipe.cardHeader')}</h1>
                <p className="text-xs font-semibold text-slate-400">{t('recipe.printed')}: {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</p>
              </div>
              <div className="my-4">
                <h2 className="text-lg font-bold">{translateItem(activeRecipe.name)}</h2>
                <p className="text-xs text-slate-500 font-semibold mb-3">{translateCategory(activeRecipe.category)} | {t('recipe.yield')}: {activeRecipe.yieldAmount * batchScale} {translateUnit(activeRecipe.yieldUnit)}</p>
                <div className="space-y-1 font-mono text-xs my-3 bg-slate-50 p-4 rounded-xl">
                  {ingredientBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 text-slate-700">
                      <span>• {translateItem(item.name)}</span>
                      <span>{item.quantity} {translateUnit(item.unit)}</span>
                    </div>
                  ))}
                </div>
                <h3 className="font-bold text-xs mt-4 uppercase tracking-wider text-slate-400">{t('recipe.methodSteps')}:</h3>
                <div className="space-y-1.5 text-xs text-slate-600 mt-2">
                  {activeRecipe.methodNotes.map((step, idx) => (
                    <p key={idx}>{idx + 1}. {translateStep(step)}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => { window.print(); }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer"
              >
                {t('recipe.confirmPrint')}
              </button>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                {t('recipe.closePreview')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
