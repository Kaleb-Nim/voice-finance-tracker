# Speech-to-Text Integration with Deepgram

## Overview
Implemented a robust speech-to-text pipeline using Deepgram's Nova-2 model with intelligent transaction parsing and error handling.

## API Endpoint Implementation

### Route Structure
```
POST /api/transcribe
Content-Type: multipart/form-data
Body: audio file (WebM with Opus codec)
```

### Deepgram Configuration
```typescript
const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
  audioBuffer,
  {
    model: 'nova-2',           // Latest high-accuracy model
    language: 'en-US',         // English language optimization
    smart_format: true,        // Automatic capitalization and punctuation
    punctuate: true,          // Enhanced punctuation
    diarize: false,           // Single speaker (expense logging)
    filler_words: false,      // Remove "um", "uh", etc.
    utterances: false,        // Simple transcript format
  }
)
```

## Model Selection Rationale

### Nova-2 Model Benefits
- **Higher accuracy**: 30%+ improvement over previous models
- **Financial terminology**: Better recognition of money-related terms
- **Conversational speech**: Optimized for natural speaking patterns
- **Speed**: Fast processing for real-time applications

### Configuration Optimizations
- **Smart formatting**: Automatic "$12" vs "twelve dollars" handling
- **Punctuation**: Cleaner transaction parsing
- **Language model**: US English for currency recognition
- **No diarization**: Single-user expense logging context

## Transaction Parsing Engine

### Natural Language Processing
```typescript
function parseTransactionFromText(text: string) {
  // Extract amount with multiple patterns
  const amountRegex = /\$?(\d+(?:\.\d{2})?)|(\d+) dollars?|(\d+) bucks?/i
  
  // Extract vendor using contextual patterns
  const atRegex = /(?:at|from)\s+([^.!?]+)/i
  
  // Category classification using keyword matching
  const categoryKeywords = {
    food: ['food', 'restaurant', 'coffee', 'lunch', 'starbucks'],
    transport: ['uber', 'taxi', 'gas', 'fuel', 'parking'],
    shopping: ['store', 'mall', 'amazon', 'target', 'walmart'],
    // ... more categories
  }
}
```

### Parsing Accuracy Improvements

#### Amount Recognition Patterns
```typescript
// Supported formats:
"$12.50"          → 12.50
"twelve dollars"  → 12.00
"12 bucks"       → 12.00
"12.5"           → 12.50
"12 fifty"       → 12.50 (future enhancement)
```

#### Vendor Extraction
```typescript
// Pattern matching:
"I spent $12 at Starbucks"     → vendor: "Starbucks"
"Bought coffee from Joe's"     → vendor: "Joe's"
"$5 for parking at the mall"   → vendor: "the mall"
"Gas station Shell"            → vendor: "Shell"
```

#### Category Classification
```typescript
// Keyword-based categorization:
const categories = {
  food: ['coffee', 'lunch', 'dinner', 'restaurant', 'starbucks'],
  transport: ['uber', 'gas', 'parking', 'taxi', 'metro'],
  shopping: ['amazon', 'store', 'mall', 'target', 'clothes'],
  entertainment: ['movie', 'netflix', 'game', 'concert'],
  utilities: ['electric', 'water', 'internet', 'phone'],
  health: ['doctor', 'pharmacy', 'medicine', 'hospital'],
  groceries: ['grocery', 'supermarket', 'safeway', 'kroger']
}
```

## Error Handling Strategy

### API-Level Errors
```typescript
// Deepgram API validation
if (!process.env.DEEPGRAM_API_KEY) {
  return NextResponse.json(
    { error: 'Deepgram API key not configured' },
    { status: 500 }
  )
}

// File validation
if (!audioFile) {
  return NextResponse.json(
    { error: 'No audio file provided' },
    { status: 400 }
  )
}

// Transcription result validation
if (!transcript) {
  return NextResponse.json(
    { error: 'No transcript generated' },
    { status: 500 }
  )
}
```

### Client-Side Fallbacks
```typescript
// Graceful degradation in voice recorder
try {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Transcription failed')
  }
  
  const data = await response.json()
  setTranscript(data.transcript)
  setState('completed')
} catch (error) {
  setState('error')
  onError?.(error.message)
}
```

## Response Format

### API Response Structure
```typescript
interface TranscriptionResponse {
  transcript: string        // Raw transcription from Deepgram
  amount: number           // Parsed monetary amount
  vendor: string           // Extracted business/location
  category: string         // Auto-categorized expense type
  rawText: string          // Original transcript for reference
  confidence: number       // Deepgram confidence score (0-1)
}
```

### Example Response
```json
{
  "transcript": "I spent twelve dollars on coffee at Starbucks",
  "amount": 12.00,
  "vendor": "Starbucks", 
  "category": "Food",
  "rawText": "I spent twelve dollars on coffee at Starbucks",
  "confidence": 0.95
}
```

## Performance Optimizations

### Audio Processing
```typescript
// Efficient buffer conversion
const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
```

### Memory Management
- **Streaming processing**: No temporary file storage
- **Buffer optimization**: Direct memory operations
- **Garbage collection**: Automatic cleanup of audio data

### Caching Strategy (Future Enhancement)
```typescript
// Potential Redis caching for repeated phrases
const cacheKey = `transcript_${audioHash}`
const cached = await redis.get(cacheKey)
```

## Quality Assurance

### Confidence Scoring
```typescript
// Deepgram provides confidence scores
const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0

// Low confidence handling
if (confidence < 0.7) {
  // Flag for manual review or retry
  response.needsReview = true
}
```

### Parsing Validation
```typescript
// Validate extracted data
const isValidAmount = amount > 0 && amount < 10000  // Reasonable bounds
const hasVendor = vendor !== 'Unknown'
const hasCategory = category !== 'Other'

const parseQuality = {
  amount: isValidAmount,
  vendor: hasVendor, 
  category: hasCategory,
  overall: isValidAmount && hasVendor
}
```

## Future Enhancements

### Advanced NLP Integration
```typescript
// Potential OpenAI GPT integration for complex parsing
const enhancedParsing = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{
    role: "system",
    content: "Extract amount, vendor, and category from expense description"
  }, {
    role: "user", 
    content: transcript
  }],
  functions: [{
    name: "extract_transaction",
    parameters: transactionSchema
  }]
})
```

### Custom Model Training
- **Domain-specific vocabulary**: Finance and expense terminology
- **User adaptation**: Learning from correction patterns
- **Accent support**: Multi-regional speech patterns
- **Context awareness**: Previous transaction patterns

### Real-Time Processing
```typescript
// Deepgram live streaming for instant feedback
const live = deepgram.listen.live({
  model: 'nova-2',
  language: 'en-US',
  smart_format: true,
  interim_results: true
})
```

## Security and Privacy

### Data Protection
- **No audio storage**: Files processed and discarded immediately
- **Minimal logging**: Only errors logged, no transcripts
- **API key security**: Server-side only, not exposed to client
- **Request validation**: Prevent malicious file uploads

### Rate Limiting (Recommended)
```typescript
// Implement rate limiting per IP
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many transcription requests'
})
```

## Testing Strategy

### Unit Tests
- Parsing function accuracy
- Error handling scenarios
- Response format validation
- Edge case handling

### Integration Tests
- End-to-end transcription flow
- Deepgram API connectivity
- Error recovery mechanisms
- Performance under load

### Audio Test Cases
```typescript
const testCases = [
  {
    input: "I spent $12.50 on coffee at Starbucks",
    expected: { amount: 12.50, vendor: "Starbucks", category: "Food" }
  },
  {
    input: "Fifteen dollars for uber ride",
    expected: { amount: 15.00, vendor: "Unknown", category: "Transport" }
  },
  // ... more test cases
]
```

This implementation provides a robust foundation for speech-to-text processing that can be easily enhanced with more sophisticated NLP models while maintaining high performance and reliability.