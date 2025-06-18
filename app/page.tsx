'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Clock, Shield, BarChart3, DollarSign, Zap, Trash2, Edit } from "lucide-react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { EditTransactionModal } from "@/components/edit-transaction-modal";
import { useTransactionStore, Transaction } from "@/stores/transactions";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default function Home() {
  const [isDemo, setIsDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Track your spending
            <br />
            <span className="text-blue-600">without lifting a finger</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Say goodbye to spreadsheets and typing. Voice Finance Tracker 
            lets you log expenses by speaking—perfect for busy minds, tired eyes, or 
            anyone who just wants it simple.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsDemo(true)}
            >
              Start Voice-Only Budgeting Free →
            </Button>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Mic className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Hands-free expense tracking with natural voice commands</h3>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Designed for neurodivergent, visually impaired, and mobile-first users</h3>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Real-time summaries without screens or manual categorization</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Works offline for total freedom and privacy</h3>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure, no-login mode for maximum control</h3>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Lightning fast voice recognition</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      {isDemo && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Try it now</h2>
              <div className="space-y-8">
                <VoiceRecorderDemo />
                <TransactionsList />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function VoiceRecorderDemo() {
  const { addTransaction } = useTransactionStore()

  const handleTranscription = (transcript: string, audioBlob: Blob, apiResponse?: any) => {
    if (apiResponse) {
      // Use parsed data from API response
      addTransaction({
        amount: apiResponse.amount || 0,
        vendor: apiResponse.vendor || 'Unknown',
        category: apiResponse.category || 'Other',
        rawText: apiResponse.transcript || transcript,
        confidence: apiResponse.confidence || 0
      })
    } else {
      // Fallback to basic parsing (shouldn't happen with new API design)
      addTransaction({
        amount: 0,
        vendor: 'Unknown',
        category: 'Other',
        rawText: transcript,
        confidence: 0.5
      })
    }
  }

  const handleError = (error: string) => {
    console.error('Recording error:', error)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Voice Expense Tracker Demo</CardTitle>
          <CardDescription>
            Click the microphone and say something like "I spent $5 on chicken rice at Maxwell Food Centre"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceRecorder 
            onTranscription={handleTranscription}
            onError={handleError}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionsList() {
  const { transactions, removeTransaction, updateTransaction, getTotalSpent, getSpentThisWeek } = useTransactionStore()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
          <CardDescription>
            Your voice-recorded expenses will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No transactions yet. Try recording your first expense!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalSpent())}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getSpentThisWeek())}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            All your voice-recorded expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                    <div className="text-sm text-muted-foreground">at {transaction.vendor}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {transaction.category}
                    </span>
                    <span>{formatRelativeTime(transaction.timestamp)}</span>
                  </div>
                  {transaction.rawText && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      "{transaction.rawText}"
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTransaction(transaction)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this transaction?')) {
                        removeTransaction(transaction.id)
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          transaction={editingTransaction}
          onSave={(id, updates) => {
            updateTransaction(id, updates)
            setEditingTransaction(null)
          }}
        />
      )}
    </div>
  )
}
