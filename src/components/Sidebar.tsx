import React from 'react';
import { LayoutDashboard, ClipboardList, Utensils, Settings, HelpCircle, Plus, Receipt, LogOut, Leaf, Moon, Sun } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { useSettings } from '../lib/SettingsContext';
import { useCurrency } from '../lib/CurrencyContext';
import { useTheme } from '../lib/ThemeContext';

interface SidebarProps {
  onOpenNewEntry: (type?: 'sale' | 'ingredient' | 'recipe') => void;
}

export default function Sidebar({ onOpenNewEntry }: SidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { settings } = useSettings();
  const { displayCurrency, toggleDisplayCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const businessName = settings?.ui?.business_name || 'Mi negocio';
  const initial = businessName.charAt(0).toUpperCase();

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
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/50 mb-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-bold shadow-inner">
            <Leaf size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold text-white tracking-tight font-display truncate">{businessName}</h1>
            <p className="text-[10px] text-subtle font-semibold uppercase tracking-wider truncate">{t('brand.sub')}</p>
          </div>
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
                    : 'text-subtle hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-subtle'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800/80 px-2 space-y-1.5">
          {/* Utility Buttons */}
          <div className="flex gap-2 px-2 mb-3">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center py-2 rounded-lg bg-emerald-900/30 text-emerald-400 text-[11px] font-bold hover:text-white hover:bg-emerald-800 transition-all border border-emerald-800/30 cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={toggleDisplayCurrency}
              className="flex-1 flex items-center justify-center py-2 rounded-lg bg-emerald-900/30 text-emerald-400 text-[11px] font-bold hover:text-white hover:bg-emerald-800 transition-all border border-emerald-800/30 cursor-pointer"
            >
              {displayCurrency}
            </button>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex-1 flex items-center justify-center py-2 rounded-lg bg-emerald-900/30 text-emerald-400 text-[11px] font-bold hover:text-white hover:bg-emerald-800 transition-all border border-emerald-800/30 cursor-pointer"
            >
              {language === 'es' ? 'ES' : 'EN'}
            </button>
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-all rounded-xl ${
                isActive ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-subtle hover:text-white hover:bg-slate-800/80'
              }`
            }
          >
            <Settings size={18} className="text-subtle" />
            <span>{t('nav.settings')}</span>
          </NavLink>
          <a
            href="#support"
            onClick={(e) => { e.preventDefault(); }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-subtle hover:text-white hover:bg-slate-800/80 transition-all rounded-xl"
          >
            <HelpCircle size={18} className="text-subtle" />
            <span>{t('nav.support')}</span>
          </a>

          {/* User Profile Card */}
          <div className="p-3 mt-2 bg-slate-800/40 rounded-2xl border border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white font-display">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="text-xs flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{user?.email ?? 'Admin'}</p>
              <p className="text-subtle">{t('chef.role')}</p>
            </div>
            <button
              id="sidebar-signout"
              onClick={signOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-subtle hover:text-red-400 hover:bg-slate-700 transition-all"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 px-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 shrink-0 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 font-bold">
            <Leaf size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-white tracking-tight font-display truncate">{businessName}</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-900/50 text-emerald-400 text-[10px] font-bold hover:text-white transition-all border border-emerald-800/50 cursor-pointer flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={toggleDisplayCurrency}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-900/50 text-emerald-400 text-[10px] font-bold hover:text-white transition-all border border-emerald-800/50 cursor-pointer"
          >
            {displayCurrency}
          </button>
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-900/50 text-emerald-400 text-[10px] font-bold hover:text-white transition-all border border-emerald-800/50 cursor-pointer"
          >
            {language === 'es' ? 'ES' : 'EN'}
          </button>
          <button
            id="mobile-signout"
            onClick={signOut}
            className="p-1.5 rounded-xl text-subtle hover:text-red-400 hover:bg-slate-800 transition-all ml-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 z-40 px-6 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400'
                  : 'text-subtle hover:text-slate-300'
              }`}
            >
              <Icon size={20} className={isActive ? 'mb-1' : ''} />
              {isActive && <div className="w-1 h-1 rounded-full bg-emerald-400"></div>}
            </NavLink>
          );
        })}
      </div>
    </>
  );
}
