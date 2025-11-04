import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, X, SkipForward } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { categoriesAPI } from '../services/api';
import { useCurrency } from '../hooks/useCurrency';
import { useAuthStore } from '../hooks/useAuth';

export const Onboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { currency, formatAmount } = useCurrency();
  
  // ✅ CHANGEMENT 1 : Récupérer les vraies catégories du backend
  const { data: backendCategories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
    enabled: isAuthenticated,
  });

  // ✅ CHANGEMENT 2 : État local avec les vraies catégories
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    color: string;
    budget: number;
    enabled: boolean;
  }>>([]);

  // ✅ CHANGEMENT 3 : Initialiser les catégories avec les données du backend
  useEffect(() => {
    if (backendCategories && backendCategories.length > 0) {
      const initialCategories = backendCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        budget: cat.budget || 0,
        enabled: true,
      }));
      setCategories(initialCategories);
    }
  }, [backendCategories]);

  // Rediriger si pas authentifié
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      categoriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleBudgetChange = (id: string, budget: number) => {
    const newCategories = categories.map(cat => 
      cat.id === id ? { ...cat, budget } : cat
    );
    setCategories(newCategories);
  };

  const toggleCategory = (id: string) => {
    const newCategories = categories.map(cat => 
      cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
    );
    setCategories(newCategories);
  };

  const handleComplete = async () => {
    try {
      // ✅ CHANGEMENT 4 : Mettre à jour TOUTES les catégories activées (même budget 0)
      const updates = categories
        .filter(cat => cat.enabled)
        .map(cat => {
          return updateCategoryMutation.mutateAsync({
            id: cat.id,
            data: { 
              name: cat.name,
              color: cat.color,
              budget: cat.budget 
            }
          });
        });

      await Promise.all(updates);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating categories:', error);
      alert('Failed to save budgets. Please try again.');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  // ✅ Afficher un loader pendant le chargement des catégories
  if (isLoading || categories.length === 0) {
    return (
      <div className="min-h-screen bg-chalk dark:bg-chalk-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const enabledCategories = categories.filter(cat => cat.enabled);
  const totalBudget = enabledCategories.reduce((sum, cat) => sum + cat.budget, 0);

  return (
    <div className="min-h-screen bg-chalk dark:bg-chalk-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-2">
              Set Your Monthly Budgets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your budget categories. Disable categories you don't need or set budgets to 0 to skip them.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className={`p-4 relative transition-all duration-200 ${
                  !category.enabled ? 'opacity-50 bg-gray-50 dark:bg-gray-800' : ''
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-primary-dark dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        category.enabled 
                          ? 'text-expense hover:bg-expense/10' 
                          : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title={category.enabled ? 'Disable category' : 'Enable category'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {getCurrencySymbol(currency)}
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={category.enabled && category.budget > 0 ? category.budget : ''}
                      onChange={(e) => handleBudgetChange(category.id, parseFloat(e.target.value) || 0)}
                      className="pl-8"
                      disabled={!category.enabled}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {enabledCategories.length > 0 && totalBudget > 0 && (
              <Card className="bg-primary/5 dark:bg-primary/10 p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-primary-dark dark:text-white">Total Monthly Budget:</span>
                  <span className="text-xl font-bold text-primary dark:text-primary-light">
                    {formatAmount(totalBudget)}
                  </span>
                </div>
              </Card>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Set budgets to 0 or disable categories you don't use. 
                You can always modify these later in the Categories section.
              </p>
            </div>
          </div>

<div className="flex justify-between items-center mt-8">
  <Button
    onClick={handleSkip}
    variant="ghost"
    className="flex items-center gap-2 group
               text-primary DEFAULT dark:text-white
               hover:text-primary-light dark:hover:text-primary"
  >
    <SkipForward className="w-4 h-4 group-hover:text-primary-light dark:group-hover:text-primary" />
    Skip Setup
  </Button>
            
            <Button
              onClick={handleComplete}
              variant="primary"
              className="flex items-center gap-2"
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? 'Saving...' : 'Complete Setup'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CAD: 'C$',
    PHP: '₱',
    JPY: '¥',
    AUD: 'A$',
    CHF: 'CHF',
  };
  return symbols[currency] || currency;
};