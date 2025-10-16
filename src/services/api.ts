import axios from 'axios';
import { User, Transaction, Category, Stats } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

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
    return data;
  },
  register: async (userData: { name: string; username: string; email: string; password: string; currency: string }) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  validate: async () => {
    const { data } = await api.get('/auth/validate');
    return data;
  },
};

export const transactionsAPI = {
  getAll: async (): Promise<Transaction[]> => {
    const { data } = await api.get('/transactions');
    return Array.isArray(data) ? data : [];
  },
  create: async (transaction: Partial<Transaction>) => {
    const { data } = await api.post('/transactions', transaction);
    return data;
  },
  update: async (id: string, transaction: Partial<Transaction>) => {
    const { data } = await api.put(`/transactions/${id}`, transaction);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },
};

export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return Array.isArray(data) ? data : [];
  },
  create: async (category: Partial<Category>) => {
    const { data } = await api.post('/categories', category);
    return data;
  },
  update: async (id: string, category: Partial<Category>) => {
    const { data } = await api.put(`/categories/${id}`, category);
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
    return data;
  },
  updateProfile: async (userData: Partial<User>) => {
    const { data } = await api.put('/user/profile', userData);
    return data;
  },
  getStats: async (): Promise<Stats> => {
    const { data } = await api.get('/user/stats');
    return data;
  },
};

export default api;