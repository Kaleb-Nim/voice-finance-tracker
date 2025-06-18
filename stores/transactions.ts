import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: string
  amount: number
  vendor: string
  category: string
  timestamp: string
  rawText: string
  confidence?: number
}

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  removeTransaction: (id: string) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  clearTransactions: () => void
  getTotalSpent: () => number
  getSpentByCategory: () => Record<string, number>
  getSpentThisMonth: () => number
  getSpentThisWeek: () => number
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          timestamp: new Date().toISOString()
        }
        set((state) => ({
          transactions: [newTransaction, ...state.transactions]
        }))
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(t => t.id !== id)
        }))
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        }))
      },

      clearTransactions: () => {
        set({ transactions: [] })
      },

      getTotalSpent: () => {
        return get().transactions.reduce((total, t) => total + t.amount, 0)
      },

      getSpentByCategory: () => {
        const transactions = get().transactions
        return transactions.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        }, {} as Record<string, number>)
      },

      getSpentThisMonth: () => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        return get().transactions
          .filter(t => new Date(t.timestamp) >= startOfMonth)
          .reduce((total, t) => total + t.amount, 0)
      },

      getSpentThisWeek: () => {
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        
        return get().transactions
          .filter(t => new Date(t.timestamp) >= startOfWeek)
          .reduce((total, t) => total + t.amount, 0)
      }
    }),
    {
      name: 'voice-finance-transactions'
    }
  )
)

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}