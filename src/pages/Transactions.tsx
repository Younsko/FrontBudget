import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Filter, Calendar, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { transactionsAPI, categoriesAPI } from '../services/api';
import { Transaction } from '../types';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

export const Transactions = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsAPI.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: transactionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      transactionsAPI.update(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setEditingTransaction(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => transactionsAPI.delete(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

const handleOpenModal = (transaction?: Transaction) => {
  if (transaction) {
    setEditingTransaction(transaction);
    setValue('amount', transaction.amount);
    setValue('currency', transaction.currency);
    setValue('description', transaction.description);
    
   const transactionDate = new Date(transaction.transactionDate);
  const formattedDate = transactionDate.toISOString().split('T')[0];
  setValue('date', formattedDate);  

    
    setValue('category_id', transaction.category_id || '');
  } else {
    setEditingTransaction(null);
    const today = new Date().toISOString().split('T')[0];
    reset({
      currency: 'EUR',
      date: today,
      category_id: '',
      amount: '',
      description: ''
    });
  }
  setIsModalOpen(true);
};

const onSubmit = async (data: any) => {
  try {
    const transactionData = {
  ...data,
  transactionDate: data.date instanceof Date
    ? data.date.toISOString()
    : new Date(data.date).toISOString(),
  amount: parseFloat(data.amount),
  categoryId: data.category_id ? parseInt(data.category_id) : null,
};

    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, data: transactionData });
    } else {
      await createMutation.mutateAsync(transactionData);
    }
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
};


  const handleDelete = (id: string | number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTransactions = filterCategory
    ? transactions.filter(t => String(t.category_id) === String(filterCategory))
    : transactions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">Transactions</h1>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          className="hidden lg:flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Transaction
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark
                  focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent
                  text-primary-dark dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-primary-dark dark:text-white">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-primary-dark dark:text-white">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-primary-dark dark:text-white">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-primary-dark dark:text-white">Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-primary-dark dark:text-white">Currency</th>
                <th className="text-right py-3 px-4 font-semibold text-primary-dark dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const category = transaction.category_id 
                  ? categories.find(c => String(c.id) === String(transaction.category_id))
                  : null;
                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-50 dark:border-gray-700 hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-medium text-primary-dark dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="py-4 px-4">
                      {category ? (
                        <span
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">Uncategorized</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-expense dark:text-expense-dark">
                      {(transaction.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                      {transaction.currency}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(transaction)}
                          className="p-2 hover:bg-info/10 dark:hover:bg-info-dark/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-info dark:text-info-dark" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 hover:bg-expense/10 dark:hover:bg-expense-dark/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-expense dark:text-expense-dark" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-3">
          {filteredTransactions.map((transaction) => {
            const category = transaction.category_id
              ? categories.find(c => String(c.id) === String(transaction.category_id))
              : null;
            return (
              <div
                key={transaction.id}
                className="p-4 rounded-lg bg-secondary dark:bg-secondary-dark hover:shadow-card dark:hover:shadow-card-dark transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-primary-dark dark:text-white mb-1">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      <span>•</span>
                      {category ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">Uncategorized</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-expense dark:text-expense-dark">
                      {transaction.currency} {(transaction.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleOpenModal(transaction)}
                    className="flex-1 py-2 text-sm text-info dark:text-info-dark hover:bg-info/10 dark:hover:bg-info-dark/20 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="flex-1 py-2 text-sm text-expense dark:text-expense-dark hover:bg-expense/10 dark:hover:bg-expense-dark/20 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            No transactions found. Add your first transaction to get started!
          </div>
        )}
      </Card>

      <FloatingActionButton onClick={() => handleOpenModal()} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
          reset();
        }}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            icon={<DollarSign className="w-5 h-5" />}
            placeholder="0.00"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' }
            })}
            error={errors.amount?.message as string}
          />

          <div>
            <label className="block text-sm font-medium text-primary-dark dark:text-primary-light mb-2">
              Currency
            </label>
            <select
              {...register('currency', { required: 'Currency is required' })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark
                focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent
                text-primary-dark dark:text-white"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-expense dark:text-expense-dark">{errors.currency.message as string}</p>
            )}
          </div>

          <Input
    label="Date"
    type="date"
    {...register("date", { 
      required: "Date is required",
      valueAsDate: true 
    })}
    error={errors.date?.message}
    icon={<Calendar className="w-4 h-4" />}
  />

          <Input
            label="Description"
            placeholder="Coffee at Starbucks"
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message as string}
          />

          <div>
            <label className="block text-sm font-medium text-primary-dark dark:text-primary-light mb-2">
              Category
            </label>
            <select
              {...register('category_id')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark
                focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent
                text-primary-dark dark:text-white"
            >
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsModalOpen(false);
                setEditingTransaction(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};