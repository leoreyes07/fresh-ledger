import React, { useState } from 'react';
import { X, Receipt, ClipboardList, Utensils, Trash2, Plus } from 'lucide-react';
import { InventoryItem, MenuItem, MenuComponent, SaleRecord } from '../types';
import { useLanguage } from '../LanguageContext';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIngredient: (ing: Omit<InventoryItem, 'id'>) => void;
  onAddRecipe: (rec: Omit<MenuItem, 'id'>) => void;
  onAddSale: (sale: Omit<SaleRecord, 'id'>) => void;
  ingredients: InventoryItem[];
}

export default function NewEntryModal({ isOpen, onClose, onAddIngredient, onAddRecipe, onAddSale, ingredients }: NewEntryModalProps) {
  const { language, t, translateItem, translateCategory, translateUnit } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sale' | 'ingredient' | 'recipe'>('sale');

  // Sale form state
  const [saleItemName, setSaleItemName] = useState('Vanilla Scoop');
  const [saleQty, setSaleQty] = useState(1);
  const [saleRev, setSaleRev] = useState(3.50);
  const [saleCost, setSaleCost] = useState(1.20);

  // InventoryItem form state
  const [ingName, setIngName] = useState('');
  const [ingCategory, setIngCategory] = useState<InventoryItem['category']>('Ice Cream Tub');
  const [ingStock, setIngStock] = useState(1);
  const [ingUnit, setIngUnit] = useState<InventoryItem['unit']>('gallons');
  const [ingCost, setIngCost] = useState(25.00);
  const [ingVolume, setIngVolume] = useState(2.5);

  // MenuItem form state
  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Cones');
  const [recipeComponents, setRecipeComponents] = useState<MenuComponent[]>([]);
  const [recipeMargin, setRecipeMargin] = useState(75);
  const [recipePrice, setRecipePrice] = useState(4.50);

  // Current adding component state
  const [selectedIngId, setSelectedIngId] = useState(ingredients[0]?.id || '');
  const [qtyOz, setQtyOz] = useState('');
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
      volume: Number(ingVolume),
      yieldFactor: 1, // Default to 100% yield
    });
    onClose();
  };

  const handleRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) return;
    onAddRecipe({
      name: recipeName,
      category: recipeCategory,
      components: recipeComponents,
      targetMargin: Number(recipeMargin),
      allergens: [],
      salePrice: Number(recipePrice)
    });
    
    setRecipeName('');
    setRecipeComponents([]);
    onClose();
  };

  const selectedIng = ingredients.find(i => i.id === selectedIngId) || ingredients[0];
  const baseUnit = selectedIng ? selectedIng.unit : 'oz';

  const handleAddComponent = () => {
    if (!selectedIngId) return;
    let qty = 0;
    
    if (baseUnit === 'units') {
      qty = parseFloat(qtyUnits);
    } else {
      qty = parseFloat(qtyOz);
    }

    if (isNaN(qty) || qty <= 0) return;

    setRecipeComponents(prev => {
      const existing = prev.find(ri => ri.inventoryItemId === selectedIngId);
      if (existing) {
        return prev.map(ri => ri.inventoryItemId === selectedIngId ? { ...ri, quantity: ri.quantity + qty } : ri);
      }
      return [...prev, { inventoryItemId: selectedIngId, quantity: qty }];
    });

    setQtyOz('');
    setQtyUnits('');
  };

  const handleRemoveComponent = (id: string) => {
    setRecipeComponents(prev => prev.filter(ri => ri.inventoryItemId !== id));
  };

  return (
    <div className="fixed inset-0 bg-main/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#bbcabf] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-main">{t('modal.title')}</h3>
            <p className="text-xs text-[#545f73]">{t('modal.sub')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer"><X size={20} /></button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1 bg-app p-1.5 rounded-xl my-4">
          <button onClick={() => setActiveTab('sale')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'sale' ? 'bg-surface text-[#006c49] shadow-sm' : 'text-[#545f73]'}`}><Receipt size={14} /> {t('modal.saleTab')}</button>
          <button onClick={() => setActiveTab('ingredient')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'ingredient' ? 'bg-surface text-[#006c49] shadow-sm' : 'text-[#545f73]'}`}><ClipboardList size={14} /> Inventory</button>
          <button onClick={() => setActiveTab('recipe')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'recipe' ? 'bg-surface text-[#006c49] shadow-sm' : 'text-[#545f73]'}`}><Utensils size={14} /> Menu Item</button>
        </div>

        {/* Dynamic Forms Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'sale' && (
            <form onSubmit={handleSaleSubmit} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Item Name</label>
                  <input type="text" value={saleItemName} onChange={(e) => setSaleItemName(e.target.value)} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" />
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Qty</label><input type="number" min="1" value={saleQty} onChange={(e) => setSaleQty(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Revenue</label><input type="number" step="0.01" value={saleRev} onChange={(e) => setSaleRev(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Cost</label><input type="number" step="0.01" value={saleCost} onChange={(e) => setSaleCost(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" /></div>
               </div>
               <button type="submit" className="w-full bg-[#006c49] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110">Add Sale</button>
            </form>
          )}

          {activeTab === 'ingredient' && (
            <form onSubmit={handleIngredientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Name</label>
                <input required type="text" value={ingName} onChange={(e) => setIngName(e.target.value)} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Category</label>
                  <select value={ingCategory} onChange={(e) => setIngCategory(e.target.value as any)} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm">
                    <option value="Ice Cream Tub">Ice Cream Tub</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Toppings">Toppings</option>
                    <option value="Syrups & Sauces">Syrups & Sauces</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Unit</label>
                  <select value={ingUnit} onChange={(e) => setIngUnit(e.target.value as any)} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm">
                    <option value="gallons">Gallons</option>
                    <option value="lbs">lbs</option>
                    <option value="oz">oz</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Volume</label>
                  <input type="number" step="0.1" value={ingVolume} onChange={(e) => setIngVolume(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Cost Per Pkg</label>
                  <input type="number" step="0.01" value={ingCost} onChange={(e) => setIngCost(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Stock</label>
                  <input type="number" step="1" value={ingStock} onChange={(e) => setIngStock(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm font-mono" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#006c49] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110">Add Inventory Item</button>
            </form>
          )}

          {activeTab === 'recipe' && (
            <form onSubmit={handleRecipeSubmit} className="space-y-4 pb-6">
              <div>
                <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Menu Item Name</label>
                <input required type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Category</label>
                  <select value={recipeCategory} onChange={(e) => setRecipeCategory(e.target.value)} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm cursor-pointer">
                    <option value="Cones">Cones</option>
                    <option value="Cups">Cups</option>
                    <option value="Pints">Pints</option>
                    <option value="Sundaes">Sundaes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Target Margin %</label>
                  <input type="number" value={recipeMargin} onChange={(e) => setRecipeMargin(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c4a42] uppercase mb-1">Sale Price</label>
                  <input type="number" step="0.01" value={recipePrice} onChange={(e) => setRecipePrice(Number(e.target.value))} className="w-full bg-app border border-[#bbcabf] rounded-lg p-2 text-sm" />
                </div>
              </div>

              {/* Components Builder */}
              <div className="border-t border-[#bbcabf]/30 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-main uppercase tracking-wider">Components</h4>
                
                {recipeComponents.length === 0 ? (
                  <p className="text-xs text-[#545f73] italic bg-surface-hover p-3 rounded-xl border border-border text-center">No components added yet.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {recipeComponents.map(ri => {
                      const ing = ingredients.find(i => i.id === ri.inventoryItemId);
                      if (!ing) return null;
                      return (
                        <div key={ri.inventoryItemId} className="flex justify-between items-center bg-app border border-[#bbcabf]/30 p-2.5 rounded-xl text-xs font-semibold">
                          <span className="text-main">{ing.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[#545f73]">{ri.quantity} {ing.unit === 'units' ? 'units' : 'fl oz'}</span>
                            <button type="button" onClick={() => handleRemoveComponent(ri.inventoryItemId)} className="text-rose-600 hover:text-rose-800 p-1"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-app border border-[#bbcabf]/50 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#3c4a42] uppercase mb-1">Select Ingredient</label>
                    <select value={selectedIngId} onChange={(e) => { setSelectedIngId(e.target.value); setQtyOz(''); setQtyUnits(''); }} className="w-full bg-surface border border-[#bbcabf] rounded-lg p-2 text-sm text-main">
                      <option value="" disabled>Select...</option>
                      {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                    </select>
                  </div>

                  {baseUnit === 'units' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-[#3c4a42] uppercase mb-1">Qty (units)</label>
                      <input type="number" min="0.1" step="any" value={qtyUnits} onChange={(e) => setQtyUnits(e.target.value)} className="w-full bg-surface border border-[#bbcabf] rounded-lg p-2 text-sm font-mono" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-[#3c4a42] uppercase mb-1">Qty (fl oz)</label>
                      <input type="number" min="0.1" step="any" value={qtyOz} onChange={(e) => setQtyOz(e.target.value)} className="w-full bg-surface border border-[#bbcabf] rounded-lg p-2 text-sm font-mono" />
                    </div>
                  )}

                  <button type="button" onClick={handleAddComponent} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5"><Plus size={14} /> Add Component</button>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#006c49] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-sm active:scale-95">Create Menu Item</button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
