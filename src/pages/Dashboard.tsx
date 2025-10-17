import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { transactionsAPI, categoriesAPI, userAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: userAPI.getStats,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsAPI.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
  });

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstName = user?.name.split(' ')[0] || 'User';

  const categoryData = categories
    .filter(cat => (cat.spent || 0) > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.spent || 0,
      color: cat.color,
    }));

  const dailyData = Array.isArray(transactions) 
    ? transactions
        .slice(0, 7)
        .reverse()
        .map(t => ({
          date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: t.amount,
        }))
    : [];

  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];

  const budgetPercentage = stats && stats.budget_total > 0 
    ? (stats.total_spent / stats.budget_total) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-1">
          Hello {firstName} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{currentMonth}</p>
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary-dark dark:from-primary-light dark:via-primary dark:to-primary-dark opacity-90"></div>
        <div className="relative z-10 space-y-4 text-white dark:text-primary-dark">
          <div>
            <p className="text-white/80 dark:text-primary-dark/80 text-sm mb-1">Total Spent</p>
            <p className="text-4xl font-bold">
              €{(stats?.total_spent || 0).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/80 dark:text-primary-dark/80">
              of €{(stats?.budget_total || 0).toFixed(2)} budget
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/10 dark:bg-primary-light/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 dark:bg-primary-light/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary dark:text-primary-light" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Remaining</p>
              <p className="text-2xl font-bold text-primary-dark dark:text-primary-light">
                €{(stats?.budget_remaining || 0).toFixed(2)}
              </p>
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
              <p className="text-2xl font-bold text-primary-dark dark:text-white">
                {(stats?.percentage_used || 0).toFixed(1)}%
              </p>
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
              <p className="text-2xl font-bold text-primary-dark dark:text-white">
                {stats?.transaction_count || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No spending data yet
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white mb-4">Daily Spending</h2>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#17B169" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No transaction data yet
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-dark dark:text-white">Recent Transactions</h2>
          <Link to="/transactions">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const category = transaction.category_id 
                ? categories.find(c => String(c.id) === String(transaction.category_id))
                : null;
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary dark:hover:bg-secondary-dark-lighter transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category?.color ? category.color + '20' : '#E5E7EB' }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color || '#9CA3AF' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary-dark dark:text-white">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category?.name || 'Uncategorized'} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-expense dark:text-expense-dark">
                      -{transaction.currency} {(transaction.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            No transactions yet. Start by adding your first transaction!
          </div>
        )}
      </Card>
    </motion.div>
  );
};