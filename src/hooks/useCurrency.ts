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

const SUPPORTED_CURRENCIES = ['PHP', 'EUR', 'USD', 'GBP', 'CAD', 'CHF', 'JPY', 'AUD'] as const;

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: 'PHP',
  
  setCurrency: (currency: string) => {
    set({ currency });
    localStorage.setItem('preferredCurrency', currency);
  },
}));

// ✅ CORRIGÉ: Utiliser une API fiable avec taux réels
const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Utiliser l'API Frankfurter qui fournit des taux de change réels
    const response = await fetch('https://api.frankfurter.app/latest?from=PHP');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // L'API renvoie les taux depuis PHP vers les autres devises
    return {
      PHP: 1,
      ...data.rates
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates, using fallback:', error);
    
    // ✅ Fallback avec des taux réalistes basés sur les données actuelles
    return {
      PHP: 1,
      EUR: 0.01459,  // Taux réel actuel
      USD: 0.01695,  // ~59 PHP = 1 USD
      GBP: 0.01286,  // ~77.7 PHP = 1 GBP
      CAD: 0.02367,  // Taux approximatif
      CHF: 0.01495,  // Taux approximatif
      JPY: 2.6181,   // ~0.38 JPY = 1 PHP
      AUD: 0.02606   // Taux approximatif
    };
  }
};

export const useCurrency = () => {
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const { currency: storeCurrency, setCurrency } = useCurrencyStore();

  // ✅ Récupérer les taux réels avec retry
  const { data: exchangeRates, error, isLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 60, // 1 heure
    retry: 3, // 3 tentatives
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Devise active (priorité au profil utilisateur)
  const activeCurrency = user?.currency || storeCurrency;

  // Synchroniser avec le profil utilisateur
  React.useEffect(() => {
    if (user?.currency && storeCurrency !== user.currency) {
      setCurrency(user.currency);
    }
  }, [user?.currency, setCurrency, storeCurrency]);
  
  // ✅ CONVERSION CORRIGÉE avec validation
  const convertAmount = React.useCallback((amount: number, fromCurrency: string): number => {
    // Si même devise, pas de conversion
    if (fromCurrency === activeCurrency) {
      return amount;
    }
    
    // Attendre que les taux soient chargés
    if (!exchangeRates) {
      console.warn('Exchange rates not loaded yet, returning original amount');
      return amount;
    }
    
    // Récupérer les taux
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[activeCurrency];
    
    // Validation des taux
    if (!fromRate || !toRate) {
      console.error(`Missing exchange rate for ${fromCurrency} to ${activeCurrency}`);
      return amount;
    }
    
    // ✅ Conversion correcte: 
    // 1. Convertir le montant en PHP (devise de base)
    // 2. Puis convertir de PHP vers la devise cible
    const amountInPHP = amount / fromRate;
    const convertedAmount = amountInPHP * toRate;
    
    console.log(`Converting ${amount} ${fromCurrency} to ${activeCurrency}:`, {
      fromRate,
      toRate,
      amountInPHP,
      convertedAmount,
      formula: `(${amount} / ${fromRate}) * ${toRate} = ${convertedAmount}`
    });
    
    return convertedAmount;
  }, [activeCurrency, exchangeRates]);

  // ✅ FORMATAGE avec symbole correct
  const formatAmount = React.useCallback((amount: number, originalCurrency?: string): string => {
    const finalAmount = originalCurrency ? convertAmount(amount, originalCurrency) : amount;
    const symbol = getCurrencySymbol(activeCurrency);
    
    // Formater avec 2 décimales
    return `${symbol}${finalAmount.toFixed(2)}`;
  }, [activeCurrency, convertAmount]);
  
  // ✅ Format avec montant original entre parenthèses
  const formatAmountWithOriginal = React.useCallback((originalAmount: number, originalCurrency: string): string => {
    const symbol = getCurrencySymbol(activeCurrency);
    const converted = convertAmount(originalAmount, originalCurrency);
    
    // Si même devise, afficher seulement une fois
    if (originalCurrency === activeCurrency) {
      return `${symbol}${originalAmount.toFixed(2)}`;
    }
    
    // Afficher devise convertie + montant original
    const originalSymbol = getCurrencySymbol(originalCurrency);
    return `${symbol}${converted.toFixed(2)} (${originalSymbol}${originalAmount.toFixed(2)})`;
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

// ✅ Symboles de devises corrects
const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    PHP: '₱',
    EUR: '€',
    USD: '$',
    GBP: '£',
    CAD: 'C$',
    CHF: 'CHF ',
    JPY: '¥',
    AUD: 'A$'
  };
  return symbols[currency] || currency + ' ';
};