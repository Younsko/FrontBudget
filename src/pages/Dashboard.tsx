import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { transactionsAPI, categoriesAPI, userAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
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
  const userName = 'User';

  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: cat.spent || 0,
    color: cat.color,
  }));

  const dailyData = transactions
    .slice(0, 7)
    .reverse()
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: t.amount,
    }));

  const recentTransactions = transactions.slice(0, 5);

  const budgetPercentage = stats ? (stats.total_spent / stats.budget_total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-primary-dark mb-1">
          Hello, {userName} 👋
        </h1>
        <p className="text-gray-600">{currentMonth}</p>
      </div>

      <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="space-y-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Total Spent</p>
            <p className="text-4xl font-bold">
              {stats ? `€${stats.total_spent.toFixed(2)}` : '€0.00'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/80">of €{stats?.budget_total.toFixed(2)} budget</span>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glass>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget Remaining</p>
              <p className="text-2xl font-bold text-primary-dark">
                €{stats?.budget_remaining.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </Card>

        <Card glass>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget Used</p>
              <p className="text-2xl font-bold text-primary-dark">
                {stats?.percentage_used.toFixed(1) || '0'}%
              </p>
            </div>
          </div>
        </Card>

        <Card glass>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-primary-dark">
                {stats?.transaction_count || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-primary-dark mb-4">Spending by Category</h2>
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
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No spending data yet
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary-dark mb-4">Daily Spending</h2>
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
            <div className="h-64 flex items-center justify-center text-gray-400">
              No transaction data yet
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-dark">Recent Transactions</h2>
          <Link to="/transactions">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.category_id);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category?.color + '20' }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary-dark">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {category?.name} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-expense">
                      -{transaction.currency} {transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            No transactions yet. Start by adding your first transaction!
          </div>
        )}
      </Card>
    </motion.div>
  );
};
