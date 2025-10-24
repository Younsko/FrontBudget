export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  currency: string;
  avatar?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  merchant?: string;
  transactionDate: string;
  category_id: string | null;
  user_id: string;
  receipt_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budget: number;
  user_id: string;
  spent?: number;
}

export interface Stats {
  total_spent: number;
  budget_total: number;
  transaction_count: number;
  budget_remaining: number;
  percentage_used: number;
}