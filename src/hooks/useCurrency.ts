import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api';
import React from 'react';

interface CurrencyState {
  currency: string;
  setCurrency: (currency: string) => void;
}

interface ExchangeRates {
  [key: string]: number;
}

interface ExchangeRateApiResponse {
  rates: ExchangeRates;
}

const SUPPORTED_CURRENCIES = ['PHP', 'EUR', 'USD', 'GBP', 'CAD', 'CHF', 'JPY', 'AUD'] as const;

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: 'PHP',
  
  setCurrency: (currency: string) => {
    set({ currency });
    localStorage.setItem('preferredCurrency', currency);
  },
}));

// API uniquement - PLUS DE FALLBACK
const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  const response = await fetch('https://api.frankfurter.app/latest?from=PHP');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();  
  return {
    PHP: 1,
    ...data.rates
  };
};

export const useCurrency = () => {
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const { currency: storeCurrency, setCurrency } = useCurrencyStore();

  // Récupérer les taux RÉELS uniquement
  const { data: exchangeRates, error, isLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 60, // 1 heure
    retry: 2, // 2 tentatives max
  });

  // Devise active
  const activeCurrency = user?.currency || storeCurrency; 

  React.useEffect(() => {
    if (user?.currency && storeCurrency !== user.currency) {
      setCurrency(user.currency);
    }
  }, [user?.currency, setCurrency, storeCurrency]);
  
  // CONVERSION - ERREUR SI PAS DE TAUX
  const convertAmount = React.useCallback((amount: number, fromCurrency: string): number => {
    if (fromCurrency === activeCurrency) return amount;
    
    if (!exchangeRates) {
      return amount; // Retourne le montant original en attendant
    }
    
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[activeCurrency];
    
    if (!fromRate || !toRate) {
      console.error(`Missing rate for ${fromCurrency} to ${activeCurrency}`);
      return amount;
    }
    
    const rate = toRate / fromRate;
    const converted = amount * rate;
    
    return converted;
  }, [activeCurrency, exchangeRates]);

  // FORMATAGE
  const formatAmount = React.useCallback((amount: number, originalCurrency?: string): string => {
    const finalAmount = originalCurrency ? convertAmount(amount, originalCurrency) : amount;
    const symbol = getCurrencySymbol(activeCurrency);
    return `${symbol} ${finalAmount.toFixed(2)}`;
  }, [activeCurrency, convertAmount]);
  
  const formatAmountWithOriginal = React.useCallback((originalAmount: number, originalCurrency: string): string => {
    const symbol = getCurrencySymbol(activeCurrency);
    const converted = convertAmount(originalAmount, originalCurrency);
    
    if (originalCurrency === activeCurrency) {
      return `${symbol} ${originalAmount.toFixed(2)}`;
    }
    
    const originalSymbol = getCurrencySymbol(originalCurrency);
    return `${symbol} ${converted.toFixed(2)} (${originalSymbol} ${originalAmount.toFixed(2)})`;
  }, [activeCurrency, convertAmount]);

  return {
    currency: activeCurrency,
    setCurrency,
    convertAmount,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    formatAmount,
    formatAmountWithOriginal,
    exchangeRates,
    ratesError: error,
    ratesLoading: isLoading
  };
};

const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    PHP: '₱', 
    EUR: '€', 
    USD: '$', 
    GBP: '£', 
    CAD: 'C$', 
    CHF: 'CHF', 
    JPY: '¥',
    AUD: 'A$'
  };
  return symbols[currency] || currency;
};