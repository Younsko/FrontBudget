import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Filter, DollarSign, Camera, Scan } from 'lucide-react';
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
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsAPI.getAll(),
  });

  const transactions = transactionsResponse || [];

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
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
      setImageUrl('');
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
      setImageUrl('');
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

const handleOcrFromUrl = async () => {
  let validatedUrl = imageUrl;
  
  // Validation de l'URL
  try {
    validatedUrl = imageUrl.startsWith('http') ? imageUrl : 'https://' + imageUrl;
    new URL(validatedUrl);
  } catch {
    alert('Please enter a valid URL (include http:// or https://)');
    return;
  }

  setIsOcrLoading(true);
  
  try {
    console.log('Sending OCR request for URL:', validatedUrl);

    const ocrResult = await transactionsAPI.ocrPreview(validatedUrl);
    
    console.log('OCR Response:', ocrResult);

    if (ocrResult?.amount !== null && ocrResult?.amount !== undefined) {
      setValue('amount', parseFloat(ocrResult.amount.toString()));
    } else {
      setValue('amount', '');
    }

    if (ocrResult?.currency) {
      setValue('currency', ocrResult.currency);
    } else {
      setValue('currency', 'EUR');
    }

    if (ocrResult?.description) {
      setValue('description', ocrResult.description);
    }

    if (ocrResult?.date) {
      try {
        const dateParts = ocrResult.date.split('-');
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          setValue('day', parseInt(day, 10));
          setValue('month', parseInt(month, 10));
          setValue('year', parseInt(year, 10));
        }
      } catch (dateError) {
        console.error('Error parsing OCR date:', dateError);
      }
    }

    if (ocrResult?.categoryName) {
      const matchingCategory = categories.find(
        cat => cat.name === ocrResult.categoryName
      );
      
      if (matchingCategory) {
        setValue('category_id', matchingCategory.id);
        console.log(`✅ Auto-selected category: ${matchingCategory.name} (ID: ${matchingCategory.id})`);
      } else {
        console.log(`⚠️ Category "${ocrResult.categoryName}" not found in user's categories`);
      }
    }
    
    if (ocrResult?.amount || ocrResult?.description) {
      console.log('OCR data successfully applied to form');
    } else {
      console.log('No data detected from OCR');
    }
    
    setImageUrl('');
    
  } catch (error) {
    console.error('OCR processing error:', error);
    alert('Failed to process receipt image. Please check the URL and try again.\n\nMake sure:\n- The URL is publicly accessible\n- The image is clear and readable\n- The image format is supported (JPG, PNG, etc.)');
  } finally {
    setIsOcrLoading(false);
  }
};

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setValue('amount', transaction.amount);
      setValue('currency', transaction.currency);
      setValue('description', transaction.description);
      
      const dateParts = transaction.transactionDate.split('-');
      if (dateParts.length === 3) {
        setValue('day', parseInt(dateParts[2], 10));
        setValue('month', parseInt(dateParts[1], 10));
        setValue('year', parseInt(dateParts[0], 10)); 
      }
      
      setValue('category_id', transaction.category_id || '');
    } else {
      setEditingTransaction(null);
      const today = new Date();
      reset({
        amount: '',
        currency: 'EUR',
        description: '',
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        category_id: '',
      });
      setImageUrl('');
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    const formattedDate = `${String(data.day).padStart(2, '0')}-${String(data.month).padStart(2, '0')}-${data.year}`;
    
    const payload = {
      amount: parseFloat(data.amount),
      currency: data.currency,
      description: data.description,
      categoryId: data.category_id ? parseInt(data.category_id) : null,
      date: formattedDate,
    };

    console.log('Submitting transaction:', payload);

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string | number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

const filteredTransactions = transactions.filter(t => {
  if (!filterCategory) return true;
  return String(t.category_id || '') === String(filterCategory);
});


  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                      {transaction.transactionDate
                        ? new Date(transaction.transactionDate.split('T')[0]).toLocaleDateString()
                        : 'No date'}
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
                        <span
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        >
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                          Uncategorized
                        </span>
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

        {/* Mobile view */}
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
                      <span>
                        {transaction.transactionDate
                          ? new Date(transaction.transactionDate.split('T')[0]).toLocaleDateString()
                          : 'No date'}
                      </span>
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
            {transactions.length === 0 ? 'No transactions found. Add your first transaction to get started!' : 'No transactions match the selected filter.'}
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
          setImageUrl('');
        }}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Scan Receipt from URL
            </h3>
            
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/receipt.jpg"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-900/30
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-primary-dark dark:text-white placeholder-blue-400 dark:placeholder-blue-300"
                />
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleOcrFromUrl}
                disabled={isOcrLoading || !imageUrl.trim()}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {isOcrLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Scan className="w-4 h-4" />
                )}
                Scan
              </Button>
            </div>
            
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 Enter a public image URL to automatically extract transaction details
            </p>
          </div>

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
              <option value="PHP">PHP (Philippine Peso)</option>
              <option value="JPY">JPY (Japanese Yen)</option>
              <option value="AUD">AUD (Australian Dollar)</option>
              <option value="CHF">CHF (Swiss Franc)</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-expense dark:text-expense-dark">{errors.currency.message as string}</p>
            )}
          </div>

          <Input
            label="Description"
            placeholder="Coffee at Starbucks"
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message as string}
          />

          <div>
            <label className="block text-sm font-medium text-primary-dark dark:text-primary-light mb-2">
              Date
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Day</label>
                <select
                  {...register('day', { 
                    required: 'Day is required',
                    min: { value: 1, message: 'Invalid day' },
                    max: { value: 31, message: 'Invalid day' }
                  })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark
                    focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent
                    text-primary-dark dark:text-white"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                {errors.day && (
                  <p className="mt-1 text-xs text-expense dark:text-expense-dark">{errors.day.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Month</label>
                <select
                  {...register('month', { 
                    required: 'Month is required',
                    min: { value: 1, message: 'Invalid month' },
                    max: { value: 12, message: 'Invalid month' }
                  })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark
                    focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent
                    text-primary-dark dark:text-white"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {errors.month && (
                  <p className="mt-1 text-xs text-expense dark:text-expense-dark">{errors.month.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Year</label>
                <select
                  {...register('year', { 
                    required: 'Year is required',
                    min: { value: 2000, message: 'Year must be after 2000' },
                    max: { value: 2100, message: 'Year must be before 2100' }
                  })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark
                    focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent
                    text-primary-dark dark:text-white"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-xs text-expense dark:text-expense-dark">{errors.year.message as string}</p>
                )}
              </div>
            </div>
          </div>

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
                setImageUrl('');
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