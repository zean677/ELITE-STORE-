import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'USD' | 'SYP' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceUsd: number) => string;
  rates: Record<Currency, number>;
}

const RATES: Record<Currency, number> = {
  USD: 1,
  SYP: 13000,
  EUR: 0.92,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('elite_currency') as Currency;
    if (saved && (saved === 'USD' || saved === 'SYP' || saved === 'EUR')) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('elite_currency', newCurrency);
  };

  const formatPrice = (priceUsd: number) => {
    const converted = priceUsd * RATES[currency];
    
    if (currency === 'SYP') {
      return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', maximumFractionDigits: 0 }).format(converted);
    } else if (currency === 'EUR') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(converted);
    } else {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rates: RATES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
