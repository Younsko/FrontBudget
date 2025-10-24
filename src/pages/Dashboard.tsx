import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { TrendingUp, DollarSign, Activity, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { transactionsAPI, categoriesAPI, userAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

export const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const { currency, formatAmount, convertAmount } = useCurrency();

  // Récupérer les stats pour le mois sélectionné (budget, dépenses totales)
  const { data: stats } = useQuery({
    queryKey: ['stats', selectedDate.getFullYear(), selectedDate.getMonth() + 1],
    queryFn: () => userAPI.getStats(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
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

  // Filtrer les transactions par mois sélectionné
  const filteredTransactions = allTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date || transaction.transactionDate); 
    return transactionDate.getMonth() === selectedDate.getMonth() && 
           transactionDate.getFullYear() === selectedDate.getFullYear();
  });

  // Calculs
  const totalSpent = filteredTransactions.reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);
  const totalBudget = stats?.budget_total || 0; // ← budget réel du mois
  const budgetRemaining = Math.max(0, totalBudget - totalSpent);
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const currentMonth = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstName = user?.name.split(' ')[0] || 'User';

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(newDate);
  };

  // Données pour le camembert
  const categoryData = categories
    .map(cat => {
      const spent = filteredTransactions
        .filter(t => t.category_id === cat.id)
        .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);
      return { name: cat.name, value: spent, color: cat.color };
    })
    .filter(cat => cat.value > 0);

  // Transactions non catégorisées
  const uncategorizedSpent = filteredTransactions
    .filter(t => !t.category_id)
    .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);

  if (uncategorizedSpent > 0) {
    categoryData.push({ name: 'Uncategorized', value: uncategorizedSpent, color: '#9CA3AF' });
  }

  // Données pour les 7 derniers jours
  const dailyData = filteredTransactions
    .slice(-7)
    .map(t => ({
      date: new Date(t.date || t.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: convertAmount(t.amount || 0, t.currency),
    }));

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-1">
            Hello {firstName} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome to your dashboard</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-secondary-dark rounded-lg p-2 shadow-soft dark:shadow-soft-dark">
          <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-secondary dark:hover:bg-secondary-dark-lighter rounded-lg" title="Previous month">
            <ChevronLeft className="w-5 h-5 text-primary-dark dark:text-primary-light" />
          </button>
          <span className="font-semibold text-primary-dark dark:text-white min-w-[140px] text-center">
            {currentMonth}
          </span>
          <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-secondary dark:hover:bg-secondary-dark-lighter rounded-lg" title="Next month">
            <ChevronRight className="w-5 h-5 text-primary-dark dark:text-primary-light" />
          </button>
        </div>
      </div>

      {/* Carte principale - budget */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary-dark dark:from-primary-light dark:via-primary dark:to-primary-dark opacity-90"></div>
        <div className="relative z-10 space-y-4 text-white dark:text-primary-dark">
          <div>
            <p className="text-white/80 dark:text-primary-dark/80 text-sm mb-1">Total Spent in {currentMonth}</p>
            <p className="text-4xl font-bold">{formatAmount(totalSpent)}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/80 dark:text-primary-dark/80">
              of {formatAmount(totalBudget)} budget
            </span>
            <div className="flex-1 h-2 bg-white/20 dark:bg-primary-dark/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white dark:bg-primary-dark rounded-full transition-all duration-500"
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
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white mb-4">Spending by Category - {currentMonth}</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [formatAmount(value), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No spending data for {currentMonth}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white mb-4">Recent Spending - {currentMonth}</h2>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAmount} />
                <Tooltip formatter={(value: number) => [formatAmount(value), 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#17B169" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No transaction data for {currentMonth}
            </div>
          )}
        </Card>
      </div>

      {/* Transactions récentes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white">Recent Transactions - {currentMonth}</h2>
          <Link to="/transactions">
            <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category?.name || 'Uncategorized'} • {new Date(transaction.date || transaction.transactionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-expense dark:text-expense-dark">-{formatAmount(transaction.amount || 0, transaction.currency)}</p>
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
