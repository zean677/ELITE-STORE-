import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'USD' | 'SYP' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceUsd: number) => string;
  rates: Record<Currency, number>;
}

const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  SYP: 13000,
  EUR: 0.92,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);

  useEffect(() => {
    const saved = localStorage.getItem('elite_currency') as Currency;
    if (saved && (saved === 'USD' || saved === 'SYP' || saved === 'EUR')) {
      setCurrencyState(saved);
    }
    // Fetch dynamic rates from the API
    fetch(`${BASE}/api/settings`)
      .then(r => r.json())
      .then(data => {
        setRates({
          USD: 1,
          SYP: parseFloat(data.syp_rate) || DEFAULT_RATES.SYP,
          EUR: parseFloat(data.eur_rate) || DEFAULT_RATES.EUR,
        });
      })
      .catch(() => {});
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('elite_currency', newCurrency);
  };

  const formatPrice = (priceUsd: number) => {
    const converted = priceUsd * rates[currency];

    if (currency === 'SYP') {
      return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', maximumFractionDigits: 0 }).format(converted);
    } else if (currency === 'EUR') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(converted);
    } else {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rates }}>
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
