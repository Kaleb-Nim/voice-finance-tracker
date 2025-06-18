# State Management and Data Flow

## Overview
Implemented a local-first state management system using Zustand with localStorage persistence, enabling offline functionality and immediate data availability for demo purposes.

## Architecture Decision: Local-First Approach

### Why Zustand + localStorage?
- **Demo-ready**: Immediate functionality without backend setup
- **Privacy-focused**: Data never leaves the user's device
- **Offline-capable**: Works without internet connectivity
- **Performance**: No network latency for data operations
- **Simplicity**: Minimal setup complexity for initial validation

### State Management Pattern
```typescript
// Zustand store with persistence
const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'voice-finance-transactions' // localStorage key
    }
  )
)
```

## Transaction Data Model

### Core Transaction Interface
```typescript
interface Transaction {
  id: string           // Unique identifier
  amount: number       // Monetary amount
  vendor: string       // Business or location
  category: string     // Expense category
  timestamp: string    // ISO date string
  rawText: string      // Original voice transcript
  confidence?: number  // Speech recognition confidence
}
```

### Data Flow Pipeline
```
Voice Input → Speech Recognition → Transaction Parsing → Store Mutation → UI Update → localStorage Sync
```

## Store Implementation

### Core Store Methods
```typescript
interface TransactionStore {
  // Data
  transactions: Transaction[]
  
  // Mutations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  removeTransaction: (id: string) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  clearTransactions: () => void
  
  // Computed Values
  getTotalSpent: () => number
  getSpentByCategory: () => Record<string, number>
  getSpentThisMonth: () => number
  getSpentThisWeek: () => number
}
```

### Transaction Creation
```typescript
addTransaction: (transaction) => {
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),                    // Auto-generated unique ID
    timestamp: new Date().toISOString()  // Current timestamp
  }
  set((state) => ({
    transactions: [newTransaction, ...state.transactions] // Prepend (newest first)
  }))
}
```

### ID Generation Strategy
```typescript
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
// Example output: "k7x8m1h4j5"
```

## Computed Values and Analytics

### Spending Calculations
```typescript
getTotalSpent: () => {
  return get().transactions.reduce((total, t) => total + t.amount, 0)
}

getSpentByCategory: () => {
  const transactions = get().transactions
  return transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)
}
```

### Time-Based Analytics
```typescript
getSpentThisMonth: () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return get().transactions
    .filter(t => new Date(t.timestamp) >= startOfMonth)
    .reduce((total, t) => total + t.amount, 0)
}

getSpentThisWeek: () => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday start
  startOfWeek.setHours(0, 0, 0, 0)
  
  return get().transactions
    .filter(t => new Date(t.timestamp) >= startOfWeek)
    .reduce((total, t) => total + t.amount, 0)
}
```

## React Integration Patterns

### Component Hook Usage
```typescript
function TransactionsList() {
  const { 
    transactions, 
    removeTransaction, 
    getTotalSpent, 
    getSpentThisWeek 
  } = useTransactionStore()
  
  // Reactive updates when store changes
}
```

### Selective Subscriptions
```typescript
// Only subscribe to specific store slices
const transactions = useTransactionStore(state => state.transactions)
const addTransaction = useTransactionStore(state => state.addTransaction)
```

### Performance Optimization
```typescript
// Memoized computed values
const totalSpent = useMemo(() => getTotalSpent(), [transactions])
const categoryBreakdown = useMemo(() => getSpentByCategory(), [transactions])
```

## Data Persistence Strategy

### localStorage Configuration
```typescript
{
  name: 'voice-finance-transactions',  // Storage key
  version: 1,                          // Schema version
  migrate: (persistedState, version) => {
    // Handle schema migrations
    if (version < 1) {
      // Migrate old data format
    }
    return persistedState
  }
}
```

### Storage Format
```json
{
  "state": {
    "transactions": [
      {
        "id": "k7x8m1h4j5",
        "amount": 12.50,
        "vendor": "Starbucks",
        "category": "Food", 
        "timestamp": "2024-01-15T14:30:00.000Z",
        "rawText": "I spent twelve fifty on coffee at Starbucks",
        "confidence": 0.95
      }
    ]
  },
  "version": 1
}
```

### Error Handling
```typescript
// Graceful fallback for localStorage issues
try {
  const stored = localStorage.getItem('voice-finance-transactions')
  return stored ? JSON.parse(stored) : initialState
} catch (error) {
  console.warn('Failed to load persisted state:', error)
  return initialState
}
```

## Demo Data Integration

### Mock Transaction Generator
```typescript
const generateMockTransaction = (transcript: string): Omit<Transaction, 'id' | 'timestamp'> => {
  // Simple parsing for demo purposes
  return {
    amount: 12.50,
    vendor: "Starbucks",
    category: "Food",
    rawText: transcript,
    confidence: 0.95
  }
}
```

### Demo Mode Handling
```typescript
function VoiceRecorderDemo() {
  const { addTransaction } = useTransactionStore()

  const handleTranscription = (transcript: string, audioBlob: Blob) => {
    // In demo mode, simulate API response
    const mockParsedTransaction = generateMockTransaction(transcript)
    addTransaction(mockParsedTransaction)
  }
}
```

## Data Migration Strategy

### Future Backend Integration
```typescript
// Easy migration to server-side storage
const migrateToBackend = async (userId: string) => {
  const localTransactions = useTransactionStore.getState().transactions
  
  // Upload to backend
  await Promise.all(
    localTransactions.map(transaction => 
      api.createTransaction(userId, transaction)
    )
  )
  
  // Clear local storage after successful migration
  useTransactionStore.getState().clearTransactions()
}
```

### Schema Evolution
```typescript
interface TransactionV2 extends Transaction {
  tags?: string[]           // User-defined tags
  receipt?: string          // Receipt image URL
  location?: GeoLocation    // GPS coordinates
  recurring?: boolean       // Recurring expense flag
}
```

## Performance Considerations

### Store Size Management
```typescript
// Automatic cleanup of old transactions
const MAX_TRANSACTIONS = 1000
const CLEANUP_THRESHOLD = 1200

addTransaction: (transaction) => {
  set((state) => {
    const newTransactions = [transaction, ...state.transactions]
    
    // Cleanup if over threshold
    if (newTransactions.length > CLEANUP_THRESHOLD) {
      return {
        transactions: newTransactions.slice(0, MAX_TRANSACTIONS)
      }
    }
    
    return { transactions: newTransactions }
  })
}
```

### Memory Optimization
```typescript
// Lazy computation for expensive operations
const getMonthlyBreakdown = useMemo(() => {
  if (transactions.length === 0) return {}
  
  return transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.timestamp).toISOString().slice(0, 7)
    acc[month] = (acc[month] || 0) + transaction.amount
    return acc
  }, {} as Record<string, number>)
}, [transactions])
```

## Testing Strategy

### Store Testing
```typescript
describe('TransactionStore', () => {
  beforeEach(() => {
    useTransactionStore.getState().clearTransactions()
  })
  
  it('should add transaction with auto-generated ID', () => {
    const { addTransaction, transactions } = useTransactionStore.getState()
    
    addTransaction({
      amount: 10,
      vendor: 'Test',
      category: 'Test', 
      rawText: 'test'
    })
    
    expect(transactions).toHaveLength(1)
    expect(transactions[0].id).toBeDefined()
    expect(transactions[0].timestamp).toBeDefined()
  })
  
  it('should calculate total spent correctly', () => {
    const { addTransaction, getTotalSpent } = useTransactionStore.getState()
    
    addTransaction({ amount: 10, vendor: 'A', category: 'Test', rawText: 'test' })
    addTransaction({ amount: 15, vendor: 'B', category: 'Test', rawText: 'test' })
    
    expect(getTotalSpent()).toBe(25)
  })
})
```

### Integration Testing
```typescript
// Test persistence across page reloads
it('should persist transactions across sessions', () => {
  const { addTransaction } = useTransactionStore.getState()
  
  addTransaction(mockTransaction)
  
  // Simulate page reload
  window.location.reload()
  
  const { transactions } = useTransactionStore.getState()
  expect(transactions).toHaveLength(1)
})
```

## Future Enhancements

### Advanced Analytics
```typescript
// Trend analysis
const getSpendingTrend = (days: number) => {
  // Calculate daily averages and trend direction
}

// Budget tracking
const getBudgetStatus = (monthlyBudget: number) => {
  const spent = getSpentThisMonth()
  return {
    spent,
    remaining: monthlyBudget - spent,
    percentUsed: (spent / monthlyBudget) * 100
  }
}
```

### Sync Capabilities
```typescript
// Cloud sync with conflict resolution
const syncWithCloud = async () => {
  const localTransactions = getState().transactions
  const cloudTransactions = await api.getTransactions()
  
  const merged = mergeTransactions(localTransactions, cloudTransactions)
  set({ transactions: merged })
}
```

This state management implementation provides a solid foundation that can scale from local demo use to production-ready cloud-synchronized expense tracking while maintaining excellent performance and user experience.