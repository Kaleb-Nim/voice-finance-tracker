# UI Components and Design System

## Overview
Built a comprehensive design system using TailwindCSS 4 with custom design tokens, implementing reusable components following shadcn/ui patterns with enhanced animations and accessibility features.

## Design System Foundation

### Color System
```css
:root {
  /* Light mode */
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --primary: #171717;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #171717;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #171717;
  --radius: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode variants */
    --background: #0a0a0a;
    --foreground: #ededed;
    --primary: #ededed;
    --primary-foreground: #0a0a0a;
    /* ... additional dark mode tokens */
  }
}
```

### Typography Scale
```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

**Font Integration**:
- **Geist Sans**: Primary interface font (Vercel's design system)
- **Geist Mono**: Code and data display
- **Variable fonts**: Optimized loading and rendering
- **Fallback stack**: System fonts for reliability

## Core UI Components

### Button Component
```typescript
// Class Variance Authority pattern
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Features**:
- **Polymorphic design**: Works with any element type
- **Variant system**: Consistent styling across use cases
- **Focus management**: Keyboard navigation support
- **Disabled states**: Proper accessibility handling

### Card Component System
```typescript
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)
```

**Component Hierarchy**:
- `Card`: Container with border and shadow
- `CardHeader`: Top section with padding
- `CardTitle`: Semantic heading element
- `CardDescription`: Muted descriptive text
- `CardContent`: Main content area
- `CardFooter`: Action area at bottom

### Input Component
```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Accessibility Features**:
- **Focus indicators**: Clear visual feedback
- **Screen reader support**: Proper labeling
- **Keyboard navigation**: Full keyboard accessibility
- **Error states**: Validation feedback integration

## Advanced Modal Component

### Animation Integration
```typescript
const Modal = ({ open, onOpenChange, children, className }: ModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Modal with scale and fade animation */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full max-w-lg bg-background rounded-lg shadow-lg",
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Features**:
- **Escape key handling**: Close on Esc press
- **Focus management**: Trap focus within modal
- **Body scroll lock**: Prevent background scrolling
- **Click outside**: Close on backdrop click
- **Smooth animations**: Framer Motion integration

## Landing Page Implementation

### Hero Section Design
```typescript
<h1 className="text-5xl md:text-7xl font-bold mb-6">
  Track your spending
  <br />
  <span className="text-blue-600">without lifting a finger</span>
</h1>
```

**Typography Hierarchy**:
- **H1**: Large display text with responsive scaling
- **Color accent**: Blue highlight for key phrases
- **Responsive breakpoints**: Mobile-first approach
- **Line height**: Optimized for readability

### Feature Grid Layout
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
  {features.map(feature => (
    <div className="text-center" key={feature.id}>
      <div className="flex items-center justify-center mb-4">
        <feature.icon className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="font-semibold mb-2">{feature.title}</h3>
    </div>
  ))}
</div>
```

**Layout Features**:
- **Responsive grid**: 1 column mobile, 3 columns desktop
- **Icon system**: Lucide React for consistency
- **Color theming**: Brand colors throughout
- **Consistent spacing**: 8px grid system

## Transaction List UI

### Summary Cards
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{formatCurrency(getTotalSpent())}</div>
    </CardContent>
  </Card>
  {/* Additional summary cards */}
</div>
```

### Transaction Items
```typescript
<div className="flex items-center justify-between p-4 border rounded-lg">
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
  <Button
    variant="ghost"
    size="sm"
    onClick={() => removeTransaction(transaction.id)}
    className="text-red-500 hover:text-red-700"
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

**Design Patterns**:
- **Visual hierarchy**: Size and color coding for importance
- **Category badges**: Color-coded expense categories
- **Relative timestamps**: Human-readable time display
- **Quote display**: Original voice transcript shown
- **Action buttons**: Clear delete functionality

## Animation System

### Framer Motion Integration
```typescript
// Recording pulse animation
{state === 'recording' && (
  <motion.div
    className="absolute inset-0 rounded-full bg-red-500/20"
    animate={{ scale: [1, 1.3, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  />
)}

// Icon state transitions
<AnimatePresence mode="wait">
  {state === 'idle' && (
    <motion.div
      key="mic"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      <Mic className="h-8 w-8" />
    </motion.div>
  )}
</AnimatePresence>
```

### Waveform Visualization
```typescript
<div className="flex items-center justify-center space-x-1 h-16">
  {Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      className="w-1 bg-blue-500 rounded-full"
      animate={{ 
        height: [4, Math.max(4, audioLevel * 0.6 + Math.random() * 20), 4] 
      }}
      transition={{ 
        duration: 0.5 + Math.random() * 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  ))}
</div>
```

**Animation Principles**:
- **Performance**: GPU-accelerated transforms
- **Accessibility**: Respects `prefers-reduced-motion`
- **Meaningful motion**: Animations provide feedback
- **Smooth transitions**: Consistent timing functions

## Responsive Design Strategy

### Breakpoint System
```css
/* TailwindCSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Mobile-First Implementation
```typescript
<h1 className="text-4xl md:text-6xl font-bold mb-6">
  {/* Base: 4xl, Medium+: 6xl */}
</h1>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Base: 1 column, Medium+: 3 columns */}
</div>

<Button size="lg" className="px-8">
  {/* Large button for touch targets */}
</Button>
```

## Accessibility Implementation

### WCAG 2.1 Compliance
- **Color contrast**: 4.5:1 minimum ratio
- **Focus indicators**: Clear keyboard navigation
- **Screen reader support**: Semantic HTML and ARIA labels
- **Touch targets**: 44px minimum size
- **Motion sensitivity**: Reduced motion support

### Semantic HTML
```typescript
// Proper heading hierarchy
<h1>Track your spending</h1>
<h2>Why Choose Voice Finance Tracker?</h2>
<h3>Lightning Fast</h3>

// Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Button purposes
<button aria-label="Delete transaction">
  <Trash2 className="h-4 w-4" />
</button>
```

### Keyboard Navigation
```typescript
// Focus management
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    startRecording()
  }
  if (e.key === 'Escape') {
    stopRecording()
  }
}
```

## Performance Optimizations

### CSS Optimization
```css
/* Efficient animations */
.button {
  transition: background-color 200ms ease-in-out;
  will-change: background-color;
}

/* Reduced layout thrashing */
.loading-spinner {
  transform: rotate(0deg);
  animation: spin 1s linear infinite;
}
```

### Component Optimization
```typescript
// Memoized expensive renders
const TransactionItem = React.memo(({ transaction, onDelete }) => {
  return (
    <div className="transaction-item">
      {/* Render transaction */}
    </div>
  )
})

// Optimized list rendering
const TransactionList = () => {
  const transactions = useTransactionStore(state => state.transactions)
  
  return (
    <div>
      {transactions.map(transaction => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

## Testing Strategy

### Visual Regression Testing
```bash
# Chromatic for component testing
npm run chromatic

# Cross-browser testing
npm run test:browsers
```

### Accessibility Testing
```bash
# Automated a11y testing
npm run test:a11y

# Screen reader testing
npm run test:screenreader
```

### Component Testing
```typescript
describe('Button Component', () => {
  it('should render with correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })
  
  it('should handle keyboard navigation', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })
})
```

This design system provides a robust foundation for building consistent, accessible, and performant user interfaces while maintaining the flexibility to adapt to future design needs and brand evolution.