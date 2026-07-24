import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Calculator, Settings, Tag, AlertTriangle } from 'lucide-react';
import { MenuItem, InventoryItem } from '../types';
import { calculateMenuCOGS, calculateSuggestedPrice } from '../lib/calculations';

import { useLanguage } from '../LanguageContext';

interface Props {
  recipes: MenuItem[];
  ingredients: InventoryItem[];
  onUpdateRecipe: (updated: MenuItem) => Promise<void>;
  onRemoveRecipe: (id: string) => Promise<void>;
}

export default function RecipeCalculatorScreen({ recipes, ingredients, onUpdateRecipe, onRemoveRecipe }: Props) {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const currentRecipe = useMemo(() => 
    recipes.find(r => r.id === recipeId) || null
  , [recipes, recipeId]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [addedQuantity, setAddedQuantity] = useState<number>(1);

  // Initialize editing state
  React.useEffect(() => {
    if (currentRecipe && !isEditing) {
      setEditedRecipe({ ...currentRecipe });
    }
  }, [currentRecipe, isEditing]);

  if (!currentRecipe) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface rounded-3xl shadow-sm border border-border">
        <Calculator className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-medium text-subtle">No Item Selected</h2>
        <p className="text-subtle mt-2">Select a menu item from the sidebar to view its cost profile.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editedRecipe) return;
    setIsSaving(true);
    try {
      await onUpdateRecipe(editedRecipe);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComponent = () => {
    if (!editedRecipe || !selectedIngredient || addedQuantity <= 0) return;
    
    setEditedRecipe(prev => {
      if (!prev) return prev;
      const exists = prev.components.find(c => c.inventoryItemId === selectedIngredient);
      
      const newComponents = exists
        ? prev.components.map(c => c.inventoryItemId === selectedIngredient 
            ? { ...c, quantity: c.quantity + addedQuantity } 
            : c)
        : [...prev.components, { inventoryItemId: selectedIngredient, quantity: addedQuantity }];

      return { ...prev, components: newComponents };
    });
    
    setSelectedIngredient('');
    setAddedQuantity(1);
  };

  const handleRemoveComponent = (inventoryItemId: string) => {
    if (!editedRecipe) return;
    setEditedRecipe(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        components: prev.components.filter(c => c.inventoryItemId !== inventoryItemId)
      };
    });
  };

  const displayRecipe = isEditing && editedRecipe ? editedRecipe : currentRecipe;
  const cogs = calculateMenuCOGS(displayRecipe, ingredients);
  const suggestedPrice = calculateSuggestedPrice(cogs, displayRecipe.targetMargin);
  const finalPrice = displayRecipe.salePrice || suggestedPrice;
  const actualMargin = ((finalPrice - cogs) / finalPrice) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface p-6 rounded-3xl shadow-sm border border-border">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-surface-alt rounded-xl transition-colors text-subtle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-main">{displayRecipe.name}</h1>
            <p className="text-subtle">{displayRecipe.category}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-subtle hover:bg-surface-alt rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
              >
                Edit Item
              </button>
              <button 
                onClick={async () => {
                  if (confirm('Delete this item?')) {
                    await onRemoveRecipe(displayRecipe.id);
                    navigate('/');
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Pricing & Margins */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border">
            <div className="flex items-center space-x-2 mb-6">
              <Calculator className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-main">Cost & Pricing</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-subtle mb-1">Total COGS (Cost)</label>
                <div className="text-3xl font-bold text-main">${cogs.toFixed(2)}</div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-subtle mb-2">Target Margin (%)</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={displayRecipe.targetMargin}
                    onChange={e => setEditedRecipe(prev => prev ? { ...prev, targetMargin: Number(e.target.value) } : null)}
                    className="w-full p-3 bg-surface-hover border border-border rounded-xl font-medium"
                  />
                ) : (
                  <div className="text-xl font-medium text-main">{displayRecipe.targetMargin}%</div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-subtle mb-1">Suggested Price</label>
                <div className="text-2xl font-bold text-blue-600">${suggestedPrice.toFixed(2)}</div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-subtle mb-2">Actual Sale Price (Override)</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={displayRecipe.salePrice || ''}
                    placeholder={`Leave blank to use $${suggestedPrice.toFixed(2)}`}
                    onChange={e => setEditedRecipe(prev => prev ? { ...prev, salePrice: e.target.value ? Number(e.target.value) : undefined } : null)}
                    className="w-full p-3 bg-surface-hover border border-border rounded-xl font-medium"
                  />
                ) : (
                  <div className="text-xl font-bold text-green-600">
                    {displayRecipe.salePrice ? `$${displayRecipe.salePrice.toFixed(2)}` : 'Uses Suggested'}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border bg-surface-hover -mx-6 -mb-6 p-6 rounded-b-3xl">
                <label className="block text-sm font-medium text-subtle mb-1">Actual Margin</label>
                <div className={`text-2xl font-bold ${actualMargin < displayRecipe.targetMargin ? 'text-red-500' : 'text-green-500'}`}>
                  {actualMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Components */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border">
            <div className="flex items-center space-x-2 mb-6">
              <Tag className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-main">Serving Components</h2>
            </div>

            {isEditing && (
              <div className="flex space-x-3 mb-6 p-4 bg-surface-hover rounded-2xl border border-border">
                <div className="flex-1">
                  <select 
                    value={selectedIngredient}
                    onChange={e => setSelectedIngredient(e.target.value)}
                    className="w-full p-3 bg-surface border border-border rounded-xl"
                  >
                    <option value="">Select Inventory Item...</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input 
                    type="number" 
                    placeholder="Qty"
                    value={addedQuantity}
                    onChange={e => setAddedQuantity(Number(e.target.value))}
                    className="w-full p-3 bg-surface border border-border rounded-xl"
                  />
                </div>
                <button 
                  onClick={handleAddComponent}
                  disabled={!selectedIngredient || addedQuantity <= 0}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  Add
                </button>
              </div>
            )}

            <div className="space-y-3">
              {displayRecipe.components.length === 0 ? (
                <div className="p-8 text-center text-subtle border-2 border-dashed border-border rounded-2xl">
                  No components added yet.
                </div>
              ) : (
                displayRecipe.components.map((comp, idx) => {
                  const invItem = ingredients.find(i => i.id === comp.inventoryItemId);
                  if (!invItem) return null;
                  
                  // Use calculations utility (simulate cost for this line)
                  // For a single line, cost is (cost per unit) * quantity
                  let costPerUnit = 0;
                  if (invItem.category === 'Ice Cream Tub' && invItem.unit === 'gallons') {
                     costPerUnit = invItem.unitCost / (invItem.volume * 128 * invItem.yieldFactor);
                  } else {
                     costPerUnit = invItem.unitCost / invItem.volume;
                  }
                  const lineCost = costPerUnit * comp.quantity;

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-surface-hover rounded-2xl border border-border group">
                      <div>
                        <div className="font-bold text-main">{invItem.name}</div>
                        <div className="text-sm text-subtle">
                          {comp.quantity} {invItem.category === 'Ice Cream Tub' ? 'fl oz' : 'units'} • ${costPerUnit.toFixed(3)}/ea
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold text-main">${lineCost.toFixed(2)}</div>
                        {isEditing && (
                          <button 
                            onClick={() => handleRemoveComponent(invItem.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
