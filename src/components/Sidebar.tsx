import React from 'react';
import { LayoutDashboard, ClipboardList, Utensils, Settings, HelpCircle, Plus, Receipt } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

interface SidebarProps {
  onOpenNewEntry: (type?: 'sale' | 'ingredient' | 'recipe') => void;
}

export default function Sidebar({ onOpenNewEntry }: SidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'inventory', to: '/inventory', label: t('nav.inventory'), icon: ClipboardList },
    { id: 'recipes', to: '/recipes', label: t('nav.recipes'), icon: Utensils },
    { id: 'sales', to: '/sales', label: t('nav.sales'), icon: Receipt },
  ];

  return (
    <>
      {/* Sidebar Nav - Desktop */}
      <nav id="desktop-sidebar" className="hidden lg:flex flex-col w-[240px] p-4 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-xl fixed left-0 top-0 bottom-0 z-40 transition-all duration-200 ease-in-out">
        {/* Header */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl font-display">F</div>
            <div>
              <h1 className="text-md font-bold text-white tracking-tight font-display">{t('brand.name')}</h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{t('brand.sub')}</p>
            </div>
          </div>
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50 cursor-pointer"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span>{language === 'es' ? 'ES' : 'EN'}</span>
          </button>
        </div>

        {/* CTA Button */}
        <div className="px-2 mb-6">
          <button 
            onClick={() => onOpenNewEntry()}
            className="w-full bg-emerald-600 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-emerald-500 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Plus size={18} />
            {t('nav.addEntry')}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-1.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800/80 px-2 space-y-1.5">
          <a
            href="#settings"
            onClick={(e) => { e.preventDefault(); }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all rounded-xl"
          >
            <Settings size={18} className="text-slate-500" />
            <span>{t('nav.settings')}</span>
          </a>
          <a
            href="#support"
            onClick={(e) => { e.preventDefault(); }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all rounded-xl"
          >
            <HelpCircle size={18} className="text-slate-500" />
            <span>{t('nav.support')}</span>
          </a>

          {/* Chef Julien Profile Card */}
          <div className="p-3 mt-2 bg-slate-800/40 rounded-2xl border border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white font-display">JD</div>
            <div className="text-xs">
              <p className="text-white font-semibold">{t('chef.name')}</p>
              <p className="text-slate-500">{t('chef.role')}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header and Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 px-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg font-display">F</div>
          <span className="text-md font-bold text-white tracking-tight font-display">{t('brand.name')}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="mr-2 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white transition-all border border-slate-700/50 cursor-pointer"
          >
            <span>{language === 'es' ? 'ES' : 'EN'}</span>
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.id}
                to={item.to}
                title={item.label}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
}
