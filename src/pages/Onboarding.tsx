import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, X, SkipForward } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { categoriesAPI, monthlyBudgetsAPI } from '../services/api';
import { useCurrency } from '../hooks/useCurrency';
import { useAuthStore } from '../hooks/useAuth';

export const Onboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { currency, formatAmount } = useCurrency();
  
  const { data: backendCategories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
    enabled: isAuthenticated,
  });

  const now = new Date();
  const { data: monthlyBudgets } = useQuery({
    queryKey: ['monthlyBudgets', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => monthlyBudgetsAPI.getMonthlyBudgets(now.getFullYear(), now.getMonth() + 1),
    enabled: isAuthenticated && !!backendCategories,
  });

  const [budgets, setBudgets] = useState<Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    budget: number;
    enabled: boolean;
  }>>([]);

  useEffect(() => {
    if (backendCategories && monthlyBudgets) {
      const initialBudgets = backendCategories.map(cat => {
        const existingBudget = monthlyBudgets.find(b => b.categoryId === cat.id);
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryColor: cat.color,
          budget: existingBudget?.budgetAmount || 0,
          enabled: true,
        };
      });
      setBudgets(initialBudgets);
    }
  }, [backendCategories, monthlyBudgets]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const updateBudgetMutation = useMutation({
    mutationFn: ({ categoryId, budgetAmount }: { categoryId: string; budgetAmount: number }) =>
      monthlyBudgetsAPI.updateBudget(categoryId, budgetAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyBudgets'] });
    },
  });

  const handleBudgetChange = (categoryId: string, budget: number) => {
    const newBudgets = budgets.map(b => 
      b.categoryId === categoryId ? { ...b, budget } : b
    );
    setBudgets(newBudgets);
  };

  const toggleCategory = (categoryId: string) => {
    const newBudgets = budgets.map(b => 
      b.categoryId === categoryId ? { ...b, enabled: !b.enabled } : b
    );
    setBudgets(newBudgets);
  };

  const handleComplete = async () => {
    try {
      const updates = budgets
        .filter(b => b.enabled)
        .map(b => {
          return updateBudgetMutation.mutateAsync({
            categoryId: b.categoryId,
            budgetAmount: b.budget
          });
        });

      await Promise.all(updates);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating budgets:', error);
      alert('Failed to save budgets. Please try again.');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (isLoading || budgets.length === 0) {
    return (
      <div className="min-h-screen bg-chalk dark:bg-chalk-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const enabledBudgets = budgets.filter(b => b.enabled);
  const totalBudget = enabledBudgets.reduce((sum, b) => sum + b.budget, 0);

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
              Customize your budget categories for {now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}. Disable categories you don't need or set budgets to 0 to skip them.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => (
                <Card key={budget.categoryId} className={`p-4 relative transition-all duration-200 ${
                  !budget.enabled ? 'opacity-50 bg-gray-50 dark:bg-gray-800' : ''
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: budget.categoryColor }}
                      />
                      <span className="font-medium text-primary-dark dark:text-white">
                        {budget.categoryName}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleCategory(budget.categoryId)}
                      className={`p-1 rounded-lg transition-colors ${
                        budget.enabled 
                          ? 'text-expense hover:bg-expense/10' 
                          : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title={budget.enabled ? 'Disable category' : 'Enable category'}
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
                      value={budget.enabled && budget.budget > 0 ? budget.budget : ''}
                      onChange={(e) => handleBudgetChange(budget.categoryId, parseFloat(e.target.value) || 0)}
                      className="pl-8"
                      disabled={!budget.enabled}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {enabledBudgets.length > 0 && totalBudget > 0 && (
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
              disabled={updateBudgetMutation.isPending}
            >
              {updateBudgetMutation.isPending ? 'Saving...' : 'Complete Setup'}
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