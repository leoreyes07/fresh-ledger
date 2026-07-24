import React, { useState } from 'react';
import { Calendar, MoreVertical, TrendingUp, ArrowRight, DollarSign, Percent, ShoppingBag, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InventoryItem, MenuItem, SaleRecord } from '../types';
import { useLanguage } from '../LanguageContext';
import { useCurrency } from '../lib/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface DashboardScreenProps {
  ingredients: InventoryItem[];
  recipes: MenuItem[];
  sales: SaleRecord[];
}

export default function DashboardScreen({ ingredients, recipes, sales }: DashboardScreenProps) {
  const navigate = useNavigate();
  const { language, t, translateItem } = useLanguage();
  const { format } = useCurrency();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('week');

  // Dynamic calculations
  const totalSalesVal = sales.reduce((sum, item) => sum + item.revenue, 0);
  const totalCostVal = sales.reduce((sum, item) => sum + item.cost, 0);
  const netProfitVal = totalSalesVal - totalCostVal;
  
  const totalInventoryValue = ingredients.reduce((sum, ing) => sum + (ing.stockLevel * ing.unitCost), 0);

  // Dynamic stock alerts mapping
  const lowStockIngredients = ingredients.filter(ing => {
    const minThreshold = ing.unit === 'units' ? 15 : 5;
    return ing.stockLevel < minThreshold;
  });

  // Daily profit totals for custom bar chart (Monday to Friday)
  const chartData = [
    { day: language === 'es' ? 'LUN' : 'MON', value: 450, label: format(450) },
    { day: language === 'es' ? 'MAR' : 'TUE', value: 650, label: format(650) },
    { day: language === 'es' ? 'MIÉ' : 'WED', value: 950, label: format(950), highlighted: true },
    { day: language === 'es' ? 'JUE' : 'THU', value: 550, label: format(550) },
    { day: language === 'es' ? 'VIE' : 'FRI', value: 750, label: format(750) }
  ];

  const maxChartValue = Math.max(...chartData.map(d => d.value));

  // Top recipes data mapping
  const topRecipesList = [
    { code: 'SS', name: 'Sundae Special', margin: '68%', revenue: format(850), status: 'High Profit', recipeId: 'sundae', colorClass: 'bg-[#ffddb8] text-[#523200]' },
    { code: 'DC', name: 'Double Chocolate Cone', margin: '62%', revenue: format(620), status: 'High Profit', recipeId: 'double-choc', colorClass: 'bg-emerald-100 text-emerald-800' },
    { code: 'VS', name: 'Vanilla Scoop', margin: '55%', revenue: format(430), status: 'Steady', recipeId: 'vanilla-scoop', colorClass: 'bg-[#e5eeff] text-main' }
  ];

  // Dynamic formatted date
  const formattedDate = new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Capitalize first letter for Spanish elegant title look
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-main tracking-tight font-display">{t('dash.title')}</h2>
          <p className="text-subtle font-medium mt-1">{capitalizedDate}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-surface border border-border rounded-xl text-sm font-semibold text-main shadow-sm hover:bg-surface-hover transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {t('dash.exportPdf')}
          </button>
          <button 
            onClick={() => navigate('/sales')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-emerald-500 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {t('dash.addEntry')}
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Large Bento Box: Sales Overview and Trend Chart Combined */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 lg:row-span-2 bg-surface rounded-3xl border border-border shadow-sm p-8 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-xs font-bold text-subtle uppercase tracking-wider mb-1">{t('dash.weeklyRev')}</h3>
              <p className="text-4xl font-black text-main font-display">
                {format(totalSalesVal)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp size={12} />
                +12.5% vs LW
              </span>
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="bg-surface-hover border border-border text-xs rounded-xl py-1.5 px-3 text-subtle focus:border-emerald-500 outline-none cursor-pointer font-medium"
              >
                <option value="today">{t('dash.thisWeek')}</option>
                <option value="week">{t('dash.thisMonth')}</option>
                <option value="month">{t('dash.thisYear')}</option>
              </select>
            </div>
          </div>

          {/* Interactive Chart Area */}
          <div className="flex-1 min-h-[220px] relative w-full flex items-end justify-between px-2 pb-2 mt-8 z-10">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 z-0 pointer-events-none">
              <div className="border-t border-border w-full"></div>
              <div className="border-t border-border w-full"></div>
              <div className="border-t border-border w-full"></div>
              <div className="border-t border-slate-150 w-full"></div>
            </div>

            {/* Render Bars */}
            {chartData.map((d, index) => {
              const heightPercent = (d.value / maxChartValue) * 85; // Scale
              return (
                <div key={index} className="flex flex-col items-center w-1/5 z-10 relative group cursor-pointer">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none whitespace-nowrap z-50 font-mono">
                    {language === 'es' ? 'BENEFICIO' : 'PROFIT'}: {d.label}
                  </div>

                  {/* Bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-14 rounded-2xl transition-all duration-300 ${
                      d.highlighted 
                        ? 'bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400' 
                        : 'bg-surface-alt hover:bg-slate-200/80'
                    }`}
                  ></div>
                  
                  {/* Label */}
                  <span className="text-[10px] font-bold text-subtle mt-3 tracking-wider font-display">{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Background Decorative Grid Grid Lines */}
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-[0.04] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <path d="M0 150 Q 100 120 200 160 T 400 100 T 600 130 T 800 50" fill="none" stroke="#10b981" strokeWidth="6" />
            </svg>
          </div>
        </div>

        {/* Quick Stats Premium Bento Block */}
        <div className="col-span-1 bg-emerald-600 rounded-3xl p-8 text-white flex flex-col justify-between shadow-lg shadow-emerald-600/10 hover:bg-emerald-500 transition-all duration-300 cursor-pointer group">
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">{t('dash.kitchenStatus')}</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
            </div>
            <p className="text-5xl font-black mt-4 font-display group-hover:scale-105 transition-transform duration-200">{recipes.length}</p>
            <p className="text-emerald-100 text-sm font-medium mt-1">{t('dash.activeRecipes')}</p>
          </div>
          <p className="text-emerald-150 text-xs italic font-sans mt-8 border-t border-emerald-500/50 pt-4">
            {t('dash.kitchenStatusQuote')}
          </p>
        </div>

        {/* Low Inventory Bento Alert Block */}
        <div className="col-span-1 bg-surface rounded-3xl border border-border shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2.5 h-2.5 rounded-full ${lowStockIngredients.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></div>
              <h3 className="text-xs font-bold text-subtle uppercase tracking-wider">{t('dash.stockAlerts')}</h3>
            </div>
            
            {lowStockIngredients.length > 0 ? (
              <ul className="space-y-3 mt-2">
                {lowStockIngredients.slice(0, 3).map((ing, i) => (
                  <li key={i} className="flex justify-between items-center py-1">
                    <span className="text-sm text-main font-medium">{translateItem(ing.name)}</span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                      {ing.stockLevel} {ing.unit} {t('dash.left').toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {t('dash.allOptimal')}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/inventory')}
            className="text-xs font-bold text-subtle hover:text-emerald-600 mt-4 flex items-center gap-1 group transition-colors cursor-pointer self-start"
          >
            {t('dash.viewInventory')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Recent Activity / Sales Log Block */}
        <div className="col-span-1 md:col-span-2 bg-surface rounded-3xl border border-border shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-subtle uppercase tracking-wider mb-4">{t('dash.recentSales')}</h3>
            <div className="space-y-4">
              {sales.slice(0, 2).map((sale, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center font-bold text-xs text-main font-display">
                      {translateItem(sale.itemName).charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-main block leading-tight">{translateItem(sale.itemName)}</span>
                      <span className="text-[10px] text-subtle block mt-0.5">{sale.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600 block leading-tight">+{format(sale.revenue)}</span>
                    <span className="text-[10px] text-subtle">{t('dash.qty')}: {sale.quantity}</span>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-xs text-subtle py-4 text-center">{t('dash.noTransactions')}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => navigate('/sales')}
            className="text-xs font-bold text-subtle hover:text-emerald-600 mt-4 flex items-center gap-1 group transition-colors cursor-pointer self-start"
          >
            {t('dash.logViewSales')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Profit Highlight Card (Bento Style) */}
        <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white overflow-hidden relative shadow-xl border border-slate-800 hover:scale-[1.01] transition-all duration-300">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-subtle text-xs font-bold uppercase tracking-wider mb-2">{t('dash.topRecipeMargin')}</h3>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-2xl font-black font-display text-white">{translateItem('Vanilla Scoop')}</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">70% {t('dash.netMargin')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono text-emerald-400">{format(6.37)} {language === 'es' ? 'Beneficio' : 'Profit'}</p>
                  <p className="text-xs text-subtle">{t('dash.perUnit')}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/recipes/vanilla-scoop')}
              className="text-xs font-bold text-subtle hover:text-white mt-6 flex items-center gap-1 group transition-colors cursor-pointer self-start"
            >
              {t('dash.analyzeCosts')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Top Recipes Bento Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface rounded-3xl border border-border shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-subtle uppercase tracking-wider">{t('dash.topHighMargin')}</h3>
            <button 
              onClick={() => navigate('/recipes')}
              className="text-emerald-600 hover:text-emerald-500 hover:bg-surface-hover transition-all p-2 rounded-full cursor-pointer"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="space-y-3.5">
            {topRecipesList.map((item, index) => (
              <div 
                key={index}
                onClick={() => navigate('/recipes/' + item.recipeId)}
                className="flex items-center justify-between p-3.5 hover:bg-surface-hover rounded-2xl transition-all cursor-pointer border border-slate-50 hover:border-border group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs font-display ${item.colorClass}`}>
                    {item.code}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-main group-hover:text-emerald-600 transition-colors font-sans">{translateItem(item.name)}</div>
                    <div className="text-[10px] font-bold text-subtle uppercase tracking-wider mt-0.5">{t('dash.targetMarginLabel')}: {item.margin}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-main font-mono">{item.revenue}</div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                    {t(`dash.${item.status === 'Steady' ? 'steady' : 'highProfit'}`)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Bento Card: Inventory Health Recap */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface rounded-3xl border border-border shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-subtle uppercase tracking-wider mb-4">{t('dash.inventoryHealth')}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-surface-hover p-4 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-subtle uppercase tracking-wider block">{t('dash.totalItems')}</span>
                <span className="text-3xl font-extrabold text-main font-display block mt-1">{ingredients.length}</span>
              </div>
              <div className="bg-surface-hover p-4 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-subtle uppercase tracking-wider block">{t('dash.assetValue')}</span>
                <span className="text-2xl font-extrabold text-emerald-600 font-display block mt-1.5">
                  {format(totalInventoryValue)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{t('dash.valuationNote')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
