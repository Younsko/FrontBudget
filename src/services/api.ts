import axios from 'axios';
import { User, Transaction, Category, Stats, MonthlyBudget } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } 
  return config;
});

export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const { data } = await api.post('/auth/login', credentials);
    return {
      user: {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        currency: data.preferredCurrency || 'EUR',
        avatar: data.profilePhotoUrl,
        created_at: new Date().toISOString(),
      },
      token: data.token,
    };
  },
  register: async (userData: { name: string; username: string; email: string; password: string; currency: string }) => {
    const { data } = await api.post('/auth/register', userData);
    return {
      user: {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        currency: userData.currency,
        avatar: data.profilePhotoUrl,
        created_at: new Date().toISOString(),
      },
      token: data.token,
    };
  },
};

export const transactionsAPI = {
  getAll: async (): Promise<Transaction[]> => {
    const { data } = await api.get('/transactions');
    const transactions = Array.isArray(data) ? data : (data.data || []);

    return transactions.map((t: any) => {
      let formattedDate = t.transactionDate;
      
      if (t.transactionDate && t.transactionDate.includes('-')) {
        const parts = t.transactionDate.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          const [day, month, year] = parts;
          formattedDate = `${year}-${month}-${day}`;
        }
      }

      return {
        id: t.id,
        originalAmount: t.originalAmount || t.amount,
        originalCurrency: t.originalCurrency || t.currency,
        amountPHP: t.amountPHP || t.amount,
        amount: t.amount,
        currency: t.currency,
        description: t.description,
        transactionDate: formattedDate,
        category_id: t.categoryId ?? null,
        user_id: t.userId ?? '',
        receipt_url: t.receiptImageUrl ?? '',
        created_at: t.createdAt ?? new Date().toISOString(),
      };
    });
  },

  create: async (transaction: any) => {
    const payload = { 
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      categoryId: transaction.categoryId,
      date: transaction.date 
    };
    
    console.log('FRONTEND - Payload final:', payload);
    
    const { data } = await api.post('/transactions', payload);
    return data;
  },

  update: async (id: string, transaction: any) => {
    const payload = { 
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      categoryId: transaction.categoryId,
      date: transaction.date
    };
    
    const { data } = await api.put(`/transactions/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },
  
  ocrPreview: async (imageUrl: string): Promise<any> => {
    const response = await api.post('/transactions/ocr-preview', { imageUrl });
    return response.data;
  },
  
  ocrPreviewFile: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/transactions/ocr-preview-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  },
};

export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    const categories = Array.isArray(data) ? data : (data.data || []);
    return categories.map((c: any) => ({
      id: c.id,
      name: c.name || c.Name,
      color: c.color || c.Color || '#17B169',
      user_id: c.userId || c.UserId || '',
      spent: c.spentThisMonth || c.SpentThisMonth || 0,
      currentMonthBudget: c.currentMonthBudget || 0, 
      transactionCount: c.transactionCount || 0,
    }));
  },

  create: async (category: { name: string; color: string }) => {
    console.log('Sending category data:', {
      name: category.name,
      color: category.color,
    });
    const { data } = await api.post('/categories', {
      name: category.name,
      color: category.color,
    });
    return data;
  },

  update: async (id: string, category: { name?: string; color?: string }) => {
    const { data } = await api.put(`/categories/${id}`, {
      name: category.name,
      color: category.color,
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};

export const userAPI = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/user/profile');
    return {
      id: data.id || '',
      name: data.name || '',
      username: data.username || '',
      email: data.email || '',
      currency: data.preferredCurrency || 'PHP',
      avatar: data.profilePhotoUrl,
      created_at: data.createdAt || new Date().toISOString(),
    };
  },

  updateProfile: async (userData: { name?: string; password?: string; profilePhotoUrl?: string; preferredCurrency?: string }) => {
    const payload: any = {};
    if (userData.name) payload.name = userData.name;
    if (userData.password) payload.password = userData.password;
    if (userData.profilePhotoUrl !== undefined) payload.profilePhotoUrl = userData.profilePhotoUrl;
    if (userData.preferredCurrency) payload.preferredCurrency = userData.preferredCurrency;
    
    const { data } = await api.put('/user/profile', payload);
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const payload = {
      currentPassword,
      newPassword
    };
    
    const { data } = await api.put('/user/password', payload);
    return data;
  },

  updateSettings: async (settings: { preferredCurrency?: string }) => {
    const payload: any = {};
    if (settings.preferredCurrency && settings.preferredCurrency.trim() !== '') {
      payload.preferredCurrency = settings.preferredCurrency.toUpperCase();
    } else {
      throw new Error("Preferred currency is required");
    }

    const { data } = await api.put('/user/settings', payload);
    return data;
  },

  deleteAccount: async (password: string, confirmation: string) => {
    if (!password || password.trim() === '') {
      throw new Error("Password is required");
    }
    if (confirmation !== "DELETE_ZONE1") {
      throw new Error('Confirmation phrase must be "DELETE_ZONE1"');
    }
    
    const payload = {
      password: password,
      confirmation: confirmation,
    };

    const { data } = await api.delete('/user/profile', { data: payload });
    return data;
  },

  getStats: async (year?: number, month?: number): Promise<Stats> => {
    const params: any = {};
    if (year && month) {
      params.year = year;
      params.month = month;
    }
    const { data } = await api.get('/user/stats', { params });
    return {
      total_spent: data.totalSpentThisMonth || 0,
      budget_total: data.totalBudgetThisMonth || 0,
      transaction_count: data.totalTransactions || 0,
      budget_remaining: data.remainingBudget || 0,
      percentage_used: data.budgetUsagePercentage || 0,
    };
  },
};

// ✅ CORRIGÉ : monthlyBudgetsAPI avec isEditable
export const monthlyBudgetsAPI = {
  getMonthlyBudgets: async (year: number, month: number): Promise<MonthlyBudget[]> => {
    const { data } = await api.get(`/budgets/monthly/${year}/${month}`);
    return data.map((b: any) => ({
      categoryId: b.categoryId,
      categoryName: b.categoryName,
      categoryColor: b.categoryColor,
      budgetAmount: b.budgetAmount,
      currency: b.currency,
      year: b.year,
      month: b.month,
      spentThisMonth: b.spentThisMonth || 0,
      remainingBudget: b.remainingBudget || 0,
      isEditable: b.isEditable ?? true, // ✅ NOUVEAU : flag éditable
    }));
  },

  
  updateBudget: async (categoryId: string, budgetAmount: number) => {
    const { data } = await api.put(`/budgets/monthly/${categoryId}`, { 
      budgetAmount 
    });
    return data;
  },

  updateSpecificMonthBudget: async (categoryId: string, year: number, month: number, budgetAmount: number) => {
    const { data } = await api.put(`/budgets/monthly/${categoryId}/${year}/${month}`, { 
      budgetAmount 
    });
    return data;
  },
};

export default api;