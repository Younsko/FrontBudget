import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api';
import React from 'react';

interface CurrencyState {
  currency: string;
  setCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency: string) => number;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'EUR',
  setCurrency: (currency) => {
    set({ currency });
    localStorage.setItem('preferredCurrency', currency);
  },
  convertAmount: (amount: number, fromCurrency: string) => {
    const { currency: toCurrency } = get();
    if (fromCurrency === toCurrency) return amount;
    
    const rates: { [key: string]: number } = {
      EUR: 1,
      USD: 1.08,
      GBP: 0.85,
      CAD: 1.46,
      PHP: 61.5,
      CHF: 0.95,
      JPY: 161.5,
      AUD: 1.65
    };
    
    const rate = rates[toCurrency] / rates[fromCurrency];
    return amount * rate;
  }
}));

export const useCurrency = () => {
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const { currency, setCurrency, convertAmount } = useCurrencyStore();

  React.useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
    }
  }, [user?.currency, setCurrency]);

  return {
    currency,
    setCurrency,
    convertAmount,
    formatAmount: (amount: number, originalCurrency?: string) => {
      const finalAmount = originalCurrency ? convertAmount(amount, originalCurrency) : amount;
      const symbol = getCurrencySymbol(currency);
      return `${symbol} ${finalAmount.toFixed(2)}`;
    }
  };
};

const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CAD: 'C$',
    PHP: '₱',
    CHF: 'CHF',
    JPY: '¥',
    AUD: 'A$'
  };
  return symbols[currency] || currency;
};