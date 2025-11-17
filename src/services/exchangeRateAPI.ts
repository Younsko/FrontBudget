// services/exchangeRateAPI.js
export const exchangeRateAPI = {
  getRates: async (baseCurrency = 'PHP') => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback vers des taux fixes
      return getFallbackRates();
    }
  }
};

const getFallbackRates = () => ({
  PHP: 1,
  EUR: 0.016,
  USD: 0.018,
  GBP: 0.0129,  // Taux réel actuel
  CAD: 0.024,
  CHF: 0.016,
  JPY: 2.6,
  AUD: 0.027
});