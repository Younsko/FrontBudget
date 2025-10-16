import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { categoriesAPI } from '../services/api';
import { Category } from '../types';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const PRESET_COLORS = [
  '#17B169', '#4A90E2', '#E84855', '#F4C430', '#9B59B6',
  '#E67E22', '#1ABC9C', '#34495E', '#FF6B6B', '#95E1D3'
];

export const Categories = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setValue('name', category.name);
      setValue('budget', category.budget);
      setSelectedColor(category.color);
    } else {
      setEditingCategory(null);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    const payload = { ...data, color: selectedColor };
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category? All associated transactions will need to be reassigned.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-dark">Categories</h1>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          className="hidden lg:flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const spent = category.spent || 0;
          const budget = category.budget;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const remaining = Math.max(0, budget - spent);
          const isOverBudget = spent > budget;

          return (
            <Card key={category.id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-dark">{category.name}</h3>
                      <p className="text-sm text-gray-600">€{budget.toFixed(2)} Budget</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="p-2 hover:bg-info/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-info" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-expense/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-expense" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-expense' : 'text-primary-dark'}`}>
                      €{spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-expense' : 'text-primary'}`}>
                      €{remaining.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? '#E84855' : category.color
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isOverBudget ? 'text-expense' : 'text-gray-600'}`}>
                      {percentage.toFixed(0)}% used
                    </span>
                    {isOverBudget && (
                      <span className="flex items-center gap-1 text-expense">
                        <TrendingUp className="w-3 h-3" />
                        Over budget
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <div className="py-12 text-center text-gray-400">
            No categories yet. Create your first category to start organizing your budget!
          </div>
        </Card>
      )}

      <FloatingActionButton onClick={() => handleOpenModal()} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          reset();
          setSelectedColor(PRESET_COLORS[0]);
        }}
        title={editingCategory ? 'Edit Category' : 'New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="Food & Dining"
            {...register('name', { required: 'Category name is required' })}
            error={errors.name?.message as string}
          />

          <Input
            label="Monthly Budget"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('budget', {
              required: 'Budget is required',
              min: { value: 0, message: 'Budget must be positive' }
            })}
            error={errors.budget?.message as string}
          />

          <div>
            <label className="block text-sm font-medium text-primary-dark mb-3">
              Category Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-lg transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsModalOpen(false);
                setEditingCategory(null);
                reset();
                setSelectedColor(PRESET_COLORS[0]);
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
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
