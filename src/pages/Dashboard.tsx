import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, ArrowRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { transactionsAPI, categoriesAPI, userAPI, monthlyBudgetsAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const { currency, formatAmount, convertAmount } = useCurrency();

  // ✅ NOUVEAU: Récupérer les budgets mensuels au lieu de stats
  const { data: monthlyBudgets = [] } = useQuery({
    queryKey: ['monthlyBudgets', selectedDate.getFullYear(), selectedDate.getMonth() + 1],
    queryFn: () => monthlyBudgetsAPI.getMonthlyBudgets(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1
    ),
  });

  // Récupérer toutes les transactions
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsAPI.getAll,
  });

  // Récupérer les catégories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
  });

  // ✅ NOUVEAU: Mutation pour initialiser le mois
  const initMonthMutation = useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      monthlyBudgetsAPI.initializeMonth(year, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyBudgets'] });
    },
  });

  // ✅ NOUVEAU: Initialiser automatiquement le mois actuel si nécessaire
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Initialiser uniquement pour le mois actuel et si les budgets sont vides
    if (monthlyBudgets.length === 0 && 
        selectedDate.getFullYear() === currentYear && 
        selectedDate.getMonth() + 1 === currentMonth) {
      initMonthMutation.mutate({ year: currentYear, month: currentMonth });
    }
  }, [monthlyBudgets.length, selectedDate, initMonthMutation]);

  // Filtrer les transactions par mois sélectionné
  const filteredTransactions = allTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionDate); 
    return transactionDate.getMonth() === selectedDate.getMonth() && 
           transactionDate.getFullYear() === selectedDate.getFullYear();
  });

  // ✅ NOUVEAU: Calcul du total budget depuis monthlyBudgets avec conversion
  const totalBudget = monthlyBudgets.reduce((sum, b) => {
    // Convertir chaque budget dans la devise préférée de l'utilisateur
    const converted = convertAmount(b.budgetAmount, b.currency);
    return sum + converted;
  }, 0);

  // ✅ NOUVEAU: Calcul des dépenses avec amountPHP converti
  const totalSpent = filteredTransactions.reduce((sum, t) => {
    // Convertir depuis PHP (base de stockage) vers la devise préférée
    const converted = convertAmount(t.amountPHP || t.amount, 'PHP');
    return sum + converted;
  }, 0);

  const budgetRemaining = Math.max(0, totalBudget - totalSpent);
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const currentMonth = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstName = user?.name.split(' ')[0] || 'User';

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(newDate);
  };

  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() &&
                          selectedDate.getFullYear() === new Date().getFullYear();
  const isHistoricalMonth = selectedDate < new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  // Données pour le camembert
  const categoryData = categories
    .map(cat => {
      const spent = filteredTransactions
        .filter(t => t.category_id === cat.id)
        .reduce((sum, t) => sum + convertAmount(t.amountPHP || t.amount, 'PHP'), 0);
      return { name: cat.name, value: spent, color: cat.color };
    })
    .filter(cat => cat.value > 0);

  // Transactions non catégorisées
  const uncategorizedSpent = filteredTransactions
    .filter(t => !t.category_id)
    .reduce((sum, t) => sum + convertAmount(t.amountPHP || t.amount, 'PHP'), 0);

  if (uncategorizedSpent > 0) {
    categoryData.push({ name: 'Uncategorized', value: uncategorizedSpent, color: '#9CA3AF' });
  }

  // Données pour les dépenses quotidiennes du mois
  const dailySpendingMap = new Map<string, number>();
  filteredTransactions.forEach(t => {
    const date = new Date(t.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const current = dailySpendingMap.get(date) || 0;
    dailySpendingMap.set(date, current + convertAmount(t.amountPHP || t.amount, 'PHP'));
  });

  const dailyData = Array.from(dailySpendingMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => {
      const dateA = new Date(a.date + ', ' + selectedDate.getFullYear());
      const dateB = new Date(b.date + ', ' + selectedDate.getFullYear());
      return dateA.getTime() - dateB.getTime();
    });

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-1">
            Hello {firstName} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isHistoricalMonth ? 'Viewing historical data' : 'Welcome to your dashboard'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isHistoricalMonth && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-info/10 dark:bg-info-dark/10 border border-info/20 dark:border-info-dark/20 rounded-lg">
              <Calendar className="w-4 h-4 text-info dark:text-info-dark" />
              <span className="text-sm text-info dark:text-info-dark font-medium">Historical View</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white dark:bg-secondary-dark rounded-lg p-2 shadow-soft dark:shadow-soft-dark">
            <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-secondary dark:hover:bg-secondary-dark-lighter rounded-lg" title="Previous month">
              <ChevronLeft className="w-5 h-5 text-primary-dark dark:text-primary-light" />
            </button>
            <span className="font-semibold text-primary-dark dark:text-white min-w-[140px] text-center">
              {currentMonth}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-secondary dark:hover:bg-secondary-dark-lighter rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5 text-primary-dark dark:text-primary-light" />
            </button>
          </div>
        </div>
      </div>

      {/* Carte principale - budget */}
      <Card isDashboard={true} className="relative overflow-hidden rounded-lg">
        <div className="relative z-10 space-y-4 p-4">
          <div>
            <p className="text-white text-sm mb-1">Total Spent in {currentMonth}</p>
            <p className="text-4xl font-bold text-white">{formatAmount(totalSpent)}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white">
              of {formatAmount(totalBudget)} budget
            </span>
            <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/10 dark:bg-primary-light/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 dark:bg-primary-light/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary dark:text-primary-light" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Remaining</p>
              <p className="text-2xl font-bold text-primary-dark dark:text-primary-light">{formatAmount(budgetRemaining)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-warning/10 dark:bg-warning-dark/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/20 dark:bg-warning-dark/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning dark:text-warning-dark" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Used</p>
              <p className="text-2xl font-bold text-primary-dark dark:text-white">{budgetPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-info/10 dark:bg-info-dark/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-info/20 dark:bg-info-dark/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-info dark:text-info-dark" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-primary-dark dark:text-white">{filteredTransactions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-secondary-dark p-3 rounded-lg shadow-card dark:shadow-card-dark border border-gray-200 dark:border-gray-700">
                          <p className="font-medium text-primary-dark dark:text-white">{payload[0].name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{formatAmount(payload[0].value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
              No spending data for {currentMonth}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white mb-4">Daily Spending Trend</h2>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-secondary-dark p-3 rounded-lg shadow-card dark:shadow-card-dark border border-gray-200 dark:border-gray-700">
                          <p className="font-medium text-primary-dark dark:text-white">{payload[0].payload.date}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{formatAmount(payload[0].value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" fill="#17B169" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
              No transaction data for {currentMonth}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white">Recent Transactions - {currentMonth}</h2>
          <Link to="/transactions">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 dark:text-green-400 hover:bg-green-500/10 dark:hover:bg-green-500/20"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map(transaction => {
              const category = transaction.category_id ? categories.find(c => String(c.id) === String(transaction.category_id)) : null;
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary dark:hover:bg-secondary-dark-lighter transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: category?.color ? category.color + '20' : '#E5E7EB' }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color || '#9CA3AF' }} />
                    </div>
                    <div>
                      <p className="font-medium text-primary-dark dark:text-white">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category?.name || 'Uncategorized'} • {new Date(transaction.transactionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-expense dark:text-expense-dark">
                      -{formatAmount(convertAmount(transaction.amountPHP || transaction.amount, 'PHP'))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            No transactions for {currentMonth}. Start by adding your first transaction!
          </div>
        )}
      </Card>

    </motion.div>
  );
};