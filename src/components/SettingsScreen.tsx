import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import { useLanguage } from '../LanguageContext';

export default function SettingsScreen() {
  const { settings, updateSetting, loading } = useSettings();
  const { t } = useLanguage();

  const [baseCurrency, setBaseCurrency] = useState(settings?.currency?.base_currency || 'NIO');
  const [exchangeRate, setExchangeRate] = useState(settings?.currency?.exchange_rate || 36.62);
  const [defaultFoodCost, setDefaultFoodCost] = useState(settings?.pricing?.default_target_food_cost || 30);
  const [defaultMargin, setDefaultMargin] = useState(settings?.pricing?.default_target_margin || 70);
  const [businessName, setBusinessName] = useState(settings?.ui?.business_name || 'Mi negocio');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // update currency
    await updateSetting('currency', {
      ...settings.currency,
      base_currency: baseCurrency,
      exchange_rate: exchangeRate
    });

    // update general ui (business name)
    await updateSetting('ui', {
      ...settings.ui,
      business_name: businessName
    });

    // update pricing
    await updateSetting('pricing', {
      ...settings.pricing,
      default_target_food_cost: defaultFoodCost,
      default_target_margin: defaultMargin
    });

    setIsSaving(false);
    setSaveMessage(t('settings.saveSuccess'));
    setTimeout(() => setSaveMessage(''), 3000);
  };

  if (loading) {
    return <div className="p-8 text-slate-500">{t('settings.loading')}</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-2xl mx-auto">
      <div>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display mb-2">{t('settings.title')}</h2>
        <p className="text-slate-500 font-medium">{t('settings.sub')}</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        
        {/* General */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nombre del Negocio</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                placeholder="Mi negocio"
              />
            </div>
          </div>
        </div>

        {/* Moneda */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{t('settings.currencyFormat')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Moneda Base</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              >
                <option value="NIO">Córdobas (NIO)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tasa de Cambio (1 USD = X NIO)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Costos y Márgenes */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{t('settings.marginsCost')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('settings.targetMargin')}</label>
              <input
                type="number"
                min="1"
                max="99"
                value={defaultMargin}
                onChange={(e) => setDefaultMargin(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('settings.maxFoodCost')}</label>
              <input
                type="number"
                min="1"
                max="99"
                value={defaultFoodCost}
                onChange={(e) => setDefaultFoodCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          {saveMessage ? (
            <span className="text-sm font-bold text-emerald-600">{saveMessage}</span>
          ) : (
            <span className="text-sm text-slate-400 font-medium">{t('settings.dontForget')}</span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer ${
              isSaving 
                ? 'bg-slate-100 text-slate-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? t('settings.saving') : t('settings.saveBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
