export interface User {
  id: string
  email: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  vendor: string
  category: string
  timestamp: string
  raw_text: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  monthly_limit: number
}

export interface UserPreferences {
  user_id: string
  currency: string
  default_input_method: 'voice' | 'manual'
}

export interface VoiceRecordingState {
  isRecording: boolean
  isProcessing: boolean
  audioBlob: Blob | null
  transcript: string | null
  error: string | null
}

export interface ParsedTransaction {
  amount: number
  category: string
  vendor: string
  confidence: number
}