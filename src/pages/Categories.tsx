"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, TrendingUp, Activity, Lock } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { categoriesAPI, monthlyBudgetsAPI, transactionsAPI } from "../services/api";
import { Category, MonthlyBudget } from "../types";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useCurrency } from '../hooks/useCurrency';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  
  return isDark;
};

const PRESET_COLORS = [
  "#17B169", "#4A90E2", "#E84855", "#F4C430",
  "#9B59B6", "#E67E22", "#1ABC9C", "#34495E",
  "#FF6B6B", "#95E1D3",
];

const adjustColorForDarkMode = (color: string, darkMode: boolean) => {
  if (!darkMode) return color;
  const amount = -80;
  return color.replace(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, (_, r, g, b) => {
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const newR = clamp(parseInt(r, 16) + amount).toString(16).padStart(2, "0");
    const newG = clamp(parseInt(g, 16) + amount).toString(16).padStart(2, "0");
    const newB = clamp(parseInt(b, 16) + amount).toString(16).padStart(2, "0");
    return `#${newR}${newG}${newB}`;
  });
};

export const Categories = () => {
  const queryClient = useQueryClient();
  const isDark = useDarkMode();
  const { currency, formatAmount, convertAmount } = useCurrency();
  const [selectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<MonthlyBudget | null>(null);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // ✅ Récupérer les budgets mensuels (initialisés automatiquement côté backend)
  const { 
    data: monthlyBudgets = [], 
    isLoading: isBudgetsLoading,
    refetch: refetchBudgets 
  } = useQuery<MonthlyBudget[]>({
    queryKey: ['monthlyBudgets', selectedDate.getFullYear(), selectedDate.getMonth() + 1],
    queryFn: () => monthlyBudgetsAPI.getMonthlyBudgets(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1
    ),
    staleTime: 0,
    cacheTime: 0,
  });

  // ✅ Récupérer les catégories (sans budget, car géré via monthlyBudgets)
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
    isError,
    error 
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
    staleTime: 0,
    cacheTime: 0,
  });

  // ✅ Récupérer toutes les transactions pour calculer les dépenses non catégorisées
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsAPI.getAll(),
  });

  // Filtrer les transactions du mois sélectionné
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate);
      return transactionDate.getMonth() === selectedDate.getMonth() && 
             transactionDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [allTransactions, selectedDate]);

  // Calculer les dépenses non catégorisées
  const uncategorizedSpent = useMemo(() => {
    return filteredTransactions
      .filter(t => !t.category_id)
      .reduce((sum, t) => sum + convertAmount(t.amountPHP || t.amount, 'PHP'), 0);
  }, [filteredTransactions, convertAmount]);

  useEffect(() => {
    refetchCategories();
    refetchBudgets();
  }, []);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // ✅ Mutation pour créer une catégorie (sans budget initial)
  const createMutation = useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setTimeout(() => {
        refetchCategories();
        refetchBudgets();
      }, 100);
      setIsModalOpen(false);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    },
  });

  // ✅ Mutation pour mettre à jour une catégorie (nom et couleur seulement)
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Category> }) => 
      categoriesAPI.update(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setTimeout(() => {
        refetchCategories();
        refetchBudgets();
      }, 100);
    },
  });

  // ✅ Mutation pour mettre à jour le budget du mois actuel
  const updateBudgetMutation = useMutation({
    mutationFn: ({ categoryId, budgetAmount }: { categoryId: string; budgetAmount: number }) =>
      monthlyBudgetsAPI.updateBudget(categoryId, budgetAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyBudgets'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setTimeout(() => {
        refetchBudgets();
      }, 100);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => categoriesAPI.delete(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setTimeout(() => {
        refetchCategories();
        refetchBudgets();
      }, 100);
    },
  });

  useEffect(() => {
    if (isModalOpen && editingBudget) {
      const category = categories.find(c => c.id === editingBudget.categoryId);
      if (category) {
        setValue('name', category.name);
        setValue('color', category.color);
      }
      setValue('budget', editingBudget.budgetAmount || 0);
      setSelectedColor(category?.color || PRESET_COLORS[0]);
    } else if (isModalOpen) {
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    }
  }, [isModalOpen, editingBudget, categories, monthlyBudgets, setValue, reset]);

  const handleOpenModal = (budget?: MonthlyBudget) => {
    if (budget) {
      setEditingBudget(budget);
    } else {
      setEditingBudget(null);
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    if (editingBudget) {
      const category = categories.find(c => c.id === editingBudget.categoryId);

      // Vérifier si le mois est éditable
      if (!editingBudget.isEditable) {
        alert("Cannot modify budgets for past months");
        return;
      }

      // Étape 1 : Mettre à jour le budget
      updateBudgetMutation.mutate(
        {
          categoryId: String(editingBudget.categoryId),
          budgetAmount: parseFloat(data.budget) || 0,
        },
        {
          onSuccess: () => {
            // Étape 2 : Mettre à jour le nom et la couleur
            if (category) {
              updateCategoryMutation.mutate(
                { id: category.id, data: { name: data.name, color: selectedColor } },
                {
                  onSuccess: () => {
                    // Étape 3 : fermer le modal
                    setIsModalOpen(false);
                    setEditingBudget(null);
                    reset();
                    setSelectedColor(PRESET_COLORS[0]);
                  },
                }
              );
            } else {
              // Si pas de catégorie trouvée, fermer quand même le modal
              setIsModalOpen(false);
              setEditingBudget(null);
              reset();
              setSelectedColor(PRESET_COLORS[0]);
            }
          },
        }
      );
    } else {
      // Création d'une nouvelle catégorie
      const payload = { name: data.name, color: selectedColor };

      createMutation.mutate(payload, {
        onSuccess: async (newCategory) => {
          // Créer le budget initial juste après
          if (newCategory?.id) {
            await updateBudgetMutation.mutateAsync({
              categoryId: newCategory.id,
              budgetAmount: parseFloat(data.budget) || 0,
            });
          }
        }
      });
    }
  };

  const handleDelete = (id: string | number) => {
    if (id === 'uncategorized') {
      alert("Cannot delete the Uncategorized category. Assign categories to your transactions instead.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this category? All associated transactions will be uncategorized.")) {
      deleteMutation.mutate(id);
    }
  };

  const stats = useMemo(() => {
    if (!monthlyBudgets.length && uncategorizedSpent === 0) return [];
    
    const totalSpent = monthlyBudgets.reduce((sum, budget) => {
      const convertedSpent = convertAmount(budget.spentThisMonth || 0, 'PHP');
      return sum + convertedSpent;
    }, 0) + uncategorizedSpent; // ✅ Ajouter les dépenses non catégorisées
    
    const totalBudget = monthlyBudgets.reduce((sum, budget) => {
      const convertedBudget = convertAmount(budget.budgetAmount || 0, 'PHP');
      return sum + convertedBudget;
    }, 0);
    
    const highestBudget = monthlyBudgets.reduce(
      (prev, curr) => {
        const prevSpent = convertAmount(prev.spentThisMonth || 0, 'PHP');
        const currSpent = convertAmount(curr.spentThisMonth || 0, 'PHP');
        return currSpent > prevSpent ? curr : prev;
      },
      {} as MonthlyBudget
    );
    const highestCategory = categories.find(c => c.id === highestBudget.categoryId);

    return [
      { title: "Categories", value: categories.length + (uncategorizedSpent > 0 ? 1 : 0) }, // ✅ +1 si uncategorized
      { title: "Total Spent", value: formatAmount(totalSpent) },
      { title: "Highest Spent", value: uncategorizedSpent > (convertAmount(highestBudget?.spentThisMonth || 0, 'PHP')) ? "Uncategorized" : (highestCategory?.name || "N/A") },
    ];
  }, [monthlyBudgets, categories, formatAmount, convertAmount, uncategorizedSpent]);

  const budgetCategories = useMemo(() => {
    const categoriesWithBudgets = categories.map(category => {
      const budget = monthlyBudgets.find(b => b.categoryId === category.id);

      const convertedBudget = convertAmount(budget?.budgetAmount || 0, 'PHP');
      const convertedSpent = convertAmount(budget?.spentThisMonth || 0, 'PHP');

      return {
        category,
        budget,
        convertedBudget,
        convertedSpent,
        isEditable: budget?.isEditable ?? false
      };
    });

    // ✅ Ajouter une catégorie "Uncategorized" si des transactions non catégorisées existent
    if (uncategorizedSpent > 0) {
      categoriesWithBudgets.push({
        category: {
          id: 'uncategorized',
          name: 'Uncategorized',
          color: '#9CA3AF',
          user_id: '',
        },
        budget: undefined,
        convertedBudget: 0,
        convertedSpent: uncategorizedSpent,
        isEditable: false
      });
    }

    return categoriesWithBudgets;
  }, [monthlyBudgets, categories, convertAmount, uncategorizedSpent]);

  if (isCategoriesLoading || isBudgetsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-xl">Error loading categories</div>
        <Button onClick={() => { refetchCategories(); refetchBudgets(); }}>
          Retry
        </Button>
        {error && <div className="text-sm text-gray-500">{error.message}</div>}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-primary-dark"}`}>
          Categories
        </h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => { refetchCategories(); refetchBudgets(); }}
            className="hidden lg:flex items-center gap-2"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
            className="hidden lg:flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Category
          </Button>
        </div>
      </div>

      {/* Stats */}
      {(categories.length > 0 || uncategorizedSpent > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              className={`p-4 ${isDark ? "bg-primary-dark/20" : "bg-primary/10"} flex flex-col items-center justify-center`}
            >
              <h3 className={`${isDark ? "text-white" : "text-primary-dark"} text-sm`}>{stat.title}</h3>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Categories Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${budgetCategories.length === 0 ? 'pt-8' : ''}`}>
        {budgetCategories.map(({ category, budget, convertedBudget, convertedSpent, isEditable }) => {
          if (!category) return null;

          const spent = convertedSpent || 0;
          const budgetAmount = convertedBudget || 0;
          const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : (category.id === 'uncategorized' ? 100 : 0);
          const remaining = Math.max(0, budgetAmount - spent);
          const isOverBudget = budgetAmount > 0 && spent > budgetAmount;
          const isUncategorized = category.id === 'uncategorized';

          return (
            <Card
              key={category.id}
              hover={!isUncategorized}
              className="rounded-2xl overflow-hidden shadow-md border-none transition-all transform hover:scale-105"
              style={{ backgroundColor: adjustColorForDarkMode(category.color, isDark) }}
            >
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-white/90">
                      {budgetAmount > 0 ? formatAmount(budgetAmount) + ' Budget' : 'No budget set'}
                    </p>
                    {/* ✅ Indicateur si mois verrouillé */}
                    {!isEditable && !isUncategorized && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-white/70">
                        <Lock className="w-3 h-3" />
                        <span>Past month (read-only)</span>
                      </div>
                    )}
                    {isUncategorized && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-white/70">
                        <Activity className="w-3 h-3" />
                        <span>Transactions without category</span>
                      </div>
                    )}
                  </div>
                  {!isUncategorized && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(budget)}
                        className="p-2 bg-white/20 border border-white/50 rounded-lg hover:bg-white/30 transition-colors"
                        title={isEditable ? "Edit category" : "View only (past month)"}
                      >
                        <Edit2 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 bg-white/20 border border-white/50 rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Spent</span>
                    <span className="font-semibold">{formatAmount(spent)}</span>
                  </div>
                  {budgetAmount > 0 && (
                    <div className="flex items-center justify-between text-sm text-white/90">
                      <span>Remaining</span>
                      <span className="font-semibold">{formatAmount(remaining)}</span>
                    </div>
                  )}

                  {budgetAmount > 0 && (
                    <>
                      <div className="w-full h-3 bg-white/25 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOverBudget ? "#E84855" : "rgba(255,255,255,0.9)",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/80">
                        <span>{percentage.toFixed(0)}% used</span>
                        {isOverBudget && (
                          <span className="flex items-center gap-1 text-white/80">
                            <TrendingUp className="w-3 h-3" />
                            Over budget
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty Placeholder */}
      {categories.length === 0 && uncategorizedSpent === 0 && (
        <Card className="flex flex-col items-center justify-center py-12 gap-4">
          <Activity className="w-12 h-12 text-gray-300 dark:text-gray-500 animate-pulse" />
          <p className="text-gray-400 dark:text-gray-500 text-center">
            Your budget is empty! Create your first category to start organizing your finances in style.
          </p>
          <Button onClick={() => handleOpenModal()} variant="primary">
            Create First Category
          </Button>
        </Card>
      )}

      <FloatingActionButton onClick={() => handleOpenModal()} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
          reset();
          setSelectedColor(PRESET_COLORS[0]);
        }}
        title={editingBudget ? (editingBudget.isEditable ? "Edit Category" : "View Category (Past Month)") : "New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ✅ Warning si mois passé */}
          {editingBudget && !editingBudget.isEditable && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  You are viewing a past month's budget. You can only edit the category name and color, not the budget amount.
                </p>
              </div>
            </div>
          )}

          <Input
            label="Category Name"
            placeholder="Food & Dining"
            {...register("name", { required: "Category name is required" })}
            error={errors.name?.message as string}
            className="bg-secondary dark:bg-secondary-dark-lighter text-black"
            placeholderClassName="text-gray-500 dark:text-gray-300"
            labelClassName="text-primary-dark dark:text-white"
            disabled={editingBudget && !editingBudget.isEditable}
          />

          {/* ✅ Budget modifiable seulement si mois actuel/futur */}
          <Input
            label="Monthly Budget"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("budget", { 
              required: editingBudget ? false : "Budget is required", 
              min: { value: 0, message: "Budget must be positive" } 
            })}
            error={errors.budget?.message as string}
            className="bg-secondary dark:bg-secondary-dark-lighter text-black"
            placeholderClassName="text-gray-500 dark:text-gray-300"
            labelClassName="text-primary-dark dark:text-white"
            disabled={editingBudget && !editingBudget.isEditable}
          />

          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? "text-white" : "text-primary-dark"}`}>
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
                      ? "ring-2 ring-offset-2 dark:ring-offset-chalk-dark ring-primary scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={editingBudget && !editingBudget.isEditable}
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
                setEditingBudget(null);
                reset();
                setSelectedColor(PRESET_COLORS[0]);
              }}
            >
              {editingBudget && !editingBudget.isEditable ? "Close" : "Cancel"}
            </Button>
            {(!editingBudget || editingBudget.isEditable) && (
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={createMutation.isPending || updateCategoryMutation.isPending || updateBudgetMutation.isPending}
              >
                {editingBudget ? "Update" : "Create"} Category
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};