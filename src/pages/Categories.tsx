"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, TrendingUp, Activity } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { categoriesAPI } from "../services/api";
import { Category } from "../types";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

// --- Hook Dark Mode ---
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  useState(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  });
  useState(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  });
  return isDark;
};

// --- Couleurs preset ---
const PRESET_COLORS = [
  "#17B169", "#4A90E2", "#E84855", "#F4C430",
  "#9B59B6", "#E67E22", "#1ABC9C", "#34495E",
  "#FF6B6B", "#95E1D3",
];

// --- Fonctions utilitaires ---
const adjustColorForDarkMode = (color: string, darkMode: boolean) => {
  if (!darkMode) return color;
  const amount = -80; // assombrir
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesAPI.getAll,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setIsModalOpen(false);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      categoriesAPI.update(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => categoriesAPI.delete(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setValue("name", category.name);
      setValue("budget", category.budget);
      setSelectedColor(category.color);
    } else {
      setEditingCategory(null);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    const payload = {
      name: data.name,
      color: selectedColor,
      budget: parseFloat(data.budget) || 0,
    };
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure? All associated transactions will need reassignment.")) {
      deleteMutation.mutate(id);
    }
  };

  // Stats cards
  const stats = useMemo(() => {
    if (!categories.length) return [];
    const totalSpent = categories.reduce((sum, cat) => sum + (cat.spent || 0), 0);
    const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
    const highestCategory = categories.reduce(
      (prev, curr) => (curr.spent > (prev.spent || 0) ? curr : prev),
      {} as Category
    );
    return [
      { title: "Categories", value: categories.length },
      { title: "Total Spent", value: `€${totalSpent.toFixed(2)}` },
      { title: "Highest Spent", value: highestCategory.name || "N/A" },
    ];
  }, [categories]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-primary-dark"}`}>
          Categories
        </h1>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          className="hidden lg:flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Category
        </Button>
      </div>

      {/* Stats */}
      {categories.length > 0 && (
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
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${categories.length === 0 ? 'pt-8' : ''}`}>
        {categories.map((category) => {
          const spent = category.spent || 0;
          const budget = category.budget || 0;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const remaining = Math.max(0, budget - spent);
          const isOverBudget = spent > budget;

          return (
            <Card
              key={category.id}
              hover
              className="rounded-2xl overflow-hidden shadow-md border-none transition-all transform hover:scale-105"
              style={{ backgroundColor: adjustColorForDarkMode(category.color, isDark) }}
            >
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-white/90">€{budget.toFixed(2)} Budget</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="p-2 bg-white/20 border border-white/50 rounded-lg hover:bg-white/30 transition-colors"
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Spent</span>
                    <span className="font-semibold">€{spent.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Remaining</span>
                    <span className="font-semibold">€{remaining.toFixed(2)}</span>
                  </div>

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
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty Placeholder */}
      {categories.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12 gap-4">
          <Activity className="w-12 h-12 text-gray-300 dark:text-gray-500 animate-pulse" />
          <p className="text-gray-400 dark:text-gray-500 text-center">
            Your budget is empty! Create your first category to start organizing your finances in style.
          </p>
        </Card>
      )}

      <FloatingActionButton onClick={() => handleOpenModal()} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          reset();
          setSelectedColor(PRESET_COLORS[0]);
        }}
        title={editingCategory ? "Edit Category" : "New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
<Input
  label="Category Name"
  placeholder="Food & Dining"
  {...register("name", { required: "Category name is required" })}
  error={errors.name?.message as string}
  className="bg-secondary dark:bg-secondary-dark-lighter text-black"
  placeholderClassName="text-gray-500 dark:text-gray-300"
  labelClassName="text-primary-dark dark:text-white" // ← ici on change le label
/>

<Input
  label="Monthly Budget"
  type="number"
  step="0.01"
  placeholder="0.00"
  {...register("budget", { required: "Budget is required", min: { value: 0, message: "Budget must be positive" } })}
  error={errors.budget?.message as string}
  className="bg-secondary dark:bg-secondary-dark-lighter text-black"
  placeholderClassName="text-gray-500 dark:text-gray-300"
  labelClassName="text-primary-dark dark:text-white" // ← label en blanc en dark
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
              {editingCategory ? "Update" : "Create"} Category
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
