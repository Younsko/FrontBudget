export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  currency: string;
  avatar?: string;
  created_at: string;
  profilePhotoUrl?: string;
  preferredCurrency?: string;
  totalCategories?: number;
  totalTransactions?: number;
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
  receiptImageUrl?: string;
  created_at: string;
  categoryName?: string;
  categoryColor?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budget: number;
  user_id: string;
  spent?: number;
  monthlyBudget?: number;
  spentThisMonth?: number;
  remainingBudget?: number;
  transactionCount?: number;
}

export interface Stats {
  total_spent: number;
  budget_total: number;
  transaction_count: number;
  budget_remaining: number;
  percentage_used: number;
  totalSpentThisMonth?: number;
  totalBudgetThisMonth?: number;
  totalTransactions?: number;
  byCategory?: Array<{
    categoryName: string;
    color: string;
    spent: number;
    budget: number;
    percentage: number;
    transactionCount: number;
  }>;
  byCurrency?: Array<{
    currency: string;
    amount: number;
    convertedToPreferred: number;
  }>;
  dailySpending?: Array<{
    date: string;
    amount: number;
    transactionCount: number;
  }>;
}

// Nouveau type pour la réponse OCR
export interface OcrResponse {
  amount?: number;
  amountRaw?: string;
  description?: string;
  currency?: string;
  date?: string;
  rawText?: string;
  receiptImageUrl?: string;
  categoryName?: string; 
}