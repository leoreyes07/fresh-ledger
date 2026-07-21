import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

type CurrencyType = 'USD' | 'NIO';

interface CurrencyContextType {
  baseCurrency: CurrencyType;
  displayCurrency: CurrencyType;
  exchangeRate: number;
  setDisplayCurrency: (currency: CurrencyType) => void;
  toggleDisplayCurrency: () => void;
  convert: (amount: number) => number;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  
  // Read from settings, fallback to defaults
  const baseCurrency = (settings?.currency?.base_currency as CurrencyType) || 'NIO';
  const exchangeRate = settings?.currency?.exchange_rate || 36.62;

  // Local state for toggling view
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyType>(baseCurrency);

  const toggleDisplayCurrency = () => {
    setDisplayCurrency(prev => prev === 'USD' ? 'NIO' : 'USD');
  };

  const convert = (amount: number): number => {
    if (baseCurrency === displayCurrency) return amount;
    
    // If base is USD and we want to view NIO
    if (baseCurrency === 'USD' && displayCurrency === 'NIO') {
      return amount * exchangeRate;
    }
    
    // If base is NIO and we want to view USD
    if (baseCurrency === 'NIO' && displayCurrency === 'USD') {
      return amount / exchangeRate;
    }

    return amount;
  };

  const format = (amount: number, decimals: number = 2): string => {
    const converted = convert(amount);
    const symbol = displayCurrency === 'USD' ? '$' : 'C$';
    
    return `${symbol}${converted.toFixed(decimals)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      baseCurrency,
      displayCurrency,
      exchangeRate,
      setDisplayCurrency,
      toggleDisplayCurrency,
      convert,
      format
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
