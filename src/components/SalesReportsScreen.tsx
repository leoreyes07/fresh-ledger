import React, { useState } from 'react';
import { Calendar, Download, Search, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Percent, Star, Plus, Trash2 } from 'lucide-react';
import { SaleRecord } from '../types';
import { useLanguage } from '../LanguageContext';
import { useCurrency } from '../lib/CurrencyContext';

interface SalesReportsScreenProps {
  sales: SaleRecord[];
  onAddSale: (sale: Omit<SaleRecord, 'id'>) => void;
  onRemoveSale: (id: string) => void;
}

export default function SalesReportsScreen({ sales, onAddSale, onRemoveSale }: SalesReportsScreenProps) {
  const { language, t, translateItem } = useLanguage();
  const { format } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('This Month (Oct)');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Add Sale Form state
  const [newItemName, setNewItemName] = useState('Vanilla Scoop');
  const [newQty, setNewQty] = useState(10);
  const [newRevenue, setNewRevenue] = useState(90.00);
  const [newCost, setNewCost] = useState(26.30);
  const [newDate, setNewDate] = useState('Oct 25, 2023');

  // Filter sales
  const filteredSales = sales.filter(item => 
    translateItem(item.itemName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  // Metrics
  const totalRev = filteredSales.reduce((sum, item) => sum + item.revenue, 0);
  const totalCost = filteredSales.reduce((sum, item) => sum + item.cost, 0);
  const avgMargin = totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : 0;
  
  // Find top item
  const itemQuantities: { [key: string]: number } = {};
  filteredSales.forEach(s => {
    itemQuantities[s.itemName] = (itemQuantities[s.itemName] || 0) + s.quantity;
  });
  let topItemName = 'None';
  let maxQty = 0;
  Object.keys(itemQuantities).forEach(name => {
    if (itemQuantities[name] > maxQty) {
      maxQty = itemQuantities[name];
      topItemName = name;
    }
  });

  const handleExport = () => {
    const headers = language === 'es' ? "Fecha,Artículo,Cantidad,Ingresos,Costo,Margen" : "Date,Item,Quantity,Revenue,Cost,Margin";
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers].join(",") + "\n"
      + sales.map(s => `${s.date},${translateItem(s.itemName)},${s.quantity},${s.revenue},${s.cost},${((s.revenue - s.cost) / s.revenue * 100).toFixed(1)}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fresh_ledger_sales_${timeframe.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage(t('sales.csvSuccess'));
    setTimeout(() => setExportMessage(''), 4000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newQty <= 0) return;
    onAddSale({
      date: newDate,
      itemName: newItemName,
      quantity: Number(newQty),
      revenue: Number(newRevenue),
      cost: Number(newCost)
    });
    setNewQty(10);
    setNewRevenue(90);
    setNewCost(26.3);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-main tracking-tight font-display">{t('sales.title')}</h2>
          <p className="text-subtle font-medium mt-1">{t('sales.sub')}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full md:w-auto pl-10 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-main shadow-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer"
            >
              <option value="This Month (Oct)">{t('sales.timeframe.month')}</option>
              <option value="Last Month (Sep)">{t('sales.timeframe.lastMonth')}</option>
              <option value="Q3 2023">{t('sales.timeframe.q3')}</option>
              <option value="Year to Date">{t('sales.timeframe.ytd')}</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-main hover:bg-surface-hover active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Download size={16} /> {t('sales.exportCsv')}
          </button>
        </div>
      </header>

      {exportMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-100 transition-all animate-fade-in">
          {exportMessage}
        </div>
      )}

      {/* Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Daily Sales Avg */}
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-subtle uppercase tracking-wider">{t('sales.dailyAvg')}</h3>
            <span className="p-2 rounded-xl bg-surface-hover text-subtle"><TrendingUp size={16} /></span>
          </div>
          <div>
            <div className="text-3xl font-black text-main font-display mb-1">
              ${(totalRev / Math.max(sales.length, 1) * 3).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span>+5.2%</span>
              <span className="text-subtle font-medium">{t('sales.vsLastWeek')}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Profit (Highlighted Emerald Bento) */}
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-500 transition-all flex flex-col justify-between cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-emerald-100/80 uppercase tracking-wider">{t('sales.monthlyProfit')}</h3>
            <span className="p-2 rounded-xl bg-emerald-700/50 text-white"><DollarSign size={16} /></span>
          </div>
          <div>
            <div className="text-3xl font-black font-display mb-1 group-hover:scale-105 transition-transform duration-200">
              ${(totalRev - totalCost).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-100">
              <span>+12.4%</span>
              <span className="text-emerald-200/80 font-normal">{t('sales.vsLastMonth')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Margin */}
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-subtle uppercase tracking-wider">{t('sales.avgMargin')}</h3>
            <span className="p-2 rounded-xl bg-surface-hover text-subtle"><Percent size={16} /></span>
          </div>
          <div>
            <div className="text-3xl font-black text-main font-display mb-1">{avgMargin.toFixed(1)}%</div>
            <div className="text-xs font-semibold text-subtle">
              {t('sales.targetMargin65')}
            </div>
          </div>
        </div>

        {/* Card 4: Top Item (Highlighted Dark Bento) */}
        <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-subtle uppercase tracking-wider">{t('sales.topItem')}</h3>
            <span className="p-2 rounded-xl bg-slate-800 text-subtle"><Star size={16} /></span>
          </div>
          <div>
            <div className="text-lg font-extrabold text-white mb-1 truncate font-display group-hover:text-emerald-400 transition-colors">
              {topItemName === 'None' ? (language === 'es' ? 'Ninguno' : 'None') : translateItem(topItemName)}
            </div>
            <div className="text-xs font-bold text-emerald-400">
              {maxQty} {t('sales.unitsSold')}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table and Actions Panel (Bento Container) */}
      <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Table Top bar */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-main font-display">{t('sales.itemizedReport')}</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 py-1.5 px-3.5 rounded-xl border border-emerald-100 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={14} /> {t('sales.logNewSale')}
            </button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
            <input 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={t('sales.searchPlaceholder')}
              type="text"
              className="w-full pl-9 pr-3.5 py-2 bg-surface-hover border border-border rounded-xl text-sm text-main focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Collapsible Add New Sale Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="p-6 bg-surface-hover/80 border-b border-border grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-fade-in">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-1.5">{t('sales.itemName')}</label>
              <select
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              >
                <option value="Vanilla Scoop">{translateItem('Vanilla Scoop')}</option>
                <option value="Double Chocolate Cone">{translateItem('Double Chocolate Cone')}</option>
                <option value="Sundae Special">{translateItem('Sundae Special')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-1.5">{t('sales.quantity')}</label>
              <input 
                type="number"
                min="1"
                value={newQty}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  setNewQty(q);
                  // Approximate pricing for Ice Cream items
                  if (newItemName === 'Sundae Special') { setNewRevenue(q * 8.50); setNewCost(q * 2.72); }
                  else if (newItemName === 'Double Chocolate Cone') { setNewRevenue(q * 6.20); setNewCost(q * 1.86); }
                  else if (newItemName === 'Vanilla Scoop') { setNewRevenue(q * 4.30); setNewCost(q * 1.25); }
                  else { setNewRevenue(q * 5.00); setNewCost(q * 1.50); }
                }}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-1.5">{t('sales.revenue')}</label>
              <input 
                type="number"
                step="0.01"
                value={newRevenue}
                onChange={(e) => setNewRevenue(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-1.5">{t('sales.totalCost')}</label>
              <input 
                type="number"
                step="0.01"
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm text-main outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                {t('sales.logRecord')}
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-surface border border-border text-subtle py-2.5 px-3.5 rounded-xl text-xs font-bold hover:bg-surface-hover transition-all cursor-pointer"
              >
                {t('sales.cancel')}
              </button>
            </div>
          </form>
        )}

        {/* The Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-hover sticky top-0 border-b border-border">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-subtle uppercase tracking-wider">{t('sales.thDate')}</th>
                <th className="py-4 px-6 text-xs font-bold text-subtle uppercase tracking-wider">{t('sales.thItem')}</th>
                <th className="py-4 px-6 text-xs font-bold text-subtle uppercase tracking-wider text-right">{t('sales.thQty')}</th>
                <th className="py-4 px-6 text-xs font-bold text-subtle uppercase tracking-wider text-right">{t('sales.thRevenue')}</th>
                <th className="py-4 px-6 text-xs font-bold text-subtle uppercase tracking-wider text-right">{t('sales.thCost')}</th>
                <th className="py-4 px-6 text-xs font-bold text-subtle uppercase tracking-wider text-right">{t('sales.thMargin')}</th>
                <th className="py-4 px-6 text-xs font-bold text-subtle uppercase tracking-wider text-center">{t('sales.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.length > 0 ? (
                paginatedSales.map((item) => {
                  const marginPct = item.revenue > 0 ? ((item.revenue - item.cost) / item.revenue) * 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors group">
                      <td className="py-4 px-6 text-sm text-subtle font-medium whitespace-nowrap">{item.date}</td>
                      <td className="py-4 px-6 text-sm text-main font-extrabold font-sans">{translateItem(item.itemName)}</td>
                      <td className="py-4 px-6 text-sm text-main text-right font-semibold font-mono">{item.quantity}</td>
                      <td className="py-4 px-6 text-sm text-main text-right font-extrabold font-mono">{format(item.revenue)}</td>
                      <td className="py-4 px-6 text-sm text-subtle text-right font-medium font-mono">{format(item.cost)}</td>
                      <td className="py-4 px-6 text-sm text-emerald-600 text-right font-extrabold font-mono">{marginPct.toFixed(1)}%</td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => onRemoveSale(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-subtle font-medium">
                    {t('sales.noMatches')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-border bg-surface-hover/50 flex justify-between items-center">
          <span className="text-xs font-semibold text-subtle">
            {t('sales.showing')} {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSales.length)} {t('sales.of')} {filteredSales.length} {t('sales.entries')}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1.5 bg-surface border border-border rounded-lg hover:bg-surface-hover disabled:opacity-40 transition-all text-subtle cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1.5 bg-surface border border-border rounded-lg hover:bg-surface-hover disabled:opacity-40 transition-all text-subtle cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
