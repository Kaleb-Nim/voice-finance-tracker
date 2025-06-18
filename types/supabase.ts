export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          vendor: string
          category: string
          timestamp: string
          raw_text: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          vendor: string
          category: string
          timestamp?: string
          raw_text: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          vendor?: string
          category?: string
          timestamp?: string
          raw_text?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          monthly_limit: number
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          monthly_limit: number
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          monthly_limit?: number
        }
      }
      preferences: {
        Row: {
          user_id: string
          currency: string
          default_input_method: string
        }
        Insert: {
          user_id: string
          currency?: string
          default_input_method?: string
        }
        Update: {
          user_id?: string
          currency?: string
          default_input_method?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}