'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/components/ui/modal'
import { Transaction } from '@/stores/transactions'

interface EditTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction
  onSave: (id: string, updates: Partial<Transaction>) => void
}

const categories = [
  'Food',
  'Transport', 
  'Shopping',
  'Entertainment',
  'Utilities',
  'Health',
  'Groceries',
  'Home',
  'Other'
]

export function EditTransactionModal({ 
  open, 
  onOpenChange, 
  transaction, 
  onSave 
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [vendor, setVendor] = useState(transaction.vendor)
  const [category, setCategory] = useState(transaction.category)
  const [error, setError] = useState('')

  const handleSave = () => {
    const parsedAmount = parseFloat(amount)
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (!vendor.trim()) {
      setError('Please enter a vendor')
      return
    }
    
    onSave(transaction.id, {
      amount: Math.round(parsedAmount * 100) / 100,
      vendor: vendor.trim(),
      category
    })
    
    onOpenChange(false)
    setError('')
  }

  const handleCancel = () => {
    // Reset to original values
    setAmount(transaction.amount.toString())
    setVendor(transaction.vendor)
    setCategory(transaction.category)
    setError('')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader>
        <ModalTitle>Edit Transaction</ModalTitle>
        <ModalClose onClick={handleCancel} />
      </ModalHeader>
      
      <ModalContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="vendor" className="text-sm font-medium">
            Vendor
          </label>
          <Input
            id="vendor"
            type="text"
            placeholder="Enter vendor name"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        {transaction.rawText && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Original Voice Input
            </label>
            <div className="p-3 bg-muted rounded-md text-sm italic">
              "{transaction.rawText}"
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
      </ModalContent>
      
      <ModalFooter>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  )
}