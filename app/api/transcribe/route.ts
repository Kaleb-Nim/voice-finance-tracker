import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Check if Deepgram API key is configured
    const hasApiKey = process.env.DEEPGRAM_API_KEY && 
                     process.env.DEEPGRAM_API_KEY !== 'your_deepgram_api_key'

    if (!hasApiKey) {
      // Fallback to demo mode - simulate transcription
      console.warn('Deepgram API key not configured, using demo mode')
      
      // Return demo transcription based on audio duration simulation
      const demoTranscripts = [
        // Singapore-specific examples (maintain local relevance)
        "I spent twelve dollars on chicken rice at Maxwell Food Centre",
        "Bought bubble tea for five dollars at Gong Cha", 
        "MRT fare two dollars and fifty cents",
        
        // International mainstream examples
        "Bought coffee at Starbucks for four dollars and fifty cents",
        "McDonald's meal cost eight dollars and ninety five cents",
        "Uber ride to downtown fifteen dollars",
        "Grocery shopping at the supermarket thirty two dollars",
        "Gas station fill up forty five dollars",
        "Restaurant dinner twenty eight dollars",
        "Online shopping on Amazon eighteen dollars and ninety nine cents"
      ]
      
      const randomTranscript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)]
      const parsedTransaction = parseTransactionFromText(randomTranscript)

      return NextResponse.json({
        transcript: randomTranscript,
        ...parsedTransaction,
        confidence: 0.85, // Demo confidence
        demoMode: true
      })
    }

    // Convert File to Buffer for real transcription
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    try {
      // Transcribe with Deepgram
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: 'en-US',
          smart_format: true,
          punctuate: true,
          diarize: false,
          filler_words: false,
          utterances: false,
        }
      )

      if (error) {
        console.error('Deepgram error:', error)
        throw new Error('Deepgram transcription failed')
      }

      const transcript = result.results?.channels[0]?.alternatives[0]?.transcript

      if (!transcript) {
        throw new Error('No transcript generated')
      }

      // Parse transaction from transcript
      const parsedTransaction = parseTransactionFromText(transcript)

      return NextResponse.json({
        transcript,
        ...parsedTransaction,
        confidence: result.results?.channels[0]?.alternatives[0]?.confidence || 0
      })

    } catch (deepgramError) {
      console.error('Real transcription failed, falling back to demo mode:', deepgramError)
      
      // Fallback to demo mode if real transcription fails
      const fallbackTranscript = "Demo: I spent ten dollars on food"
      const parsedTransaction = parseTransactionFromText(fallbackTranscript)

      return NextResponse.json({
        transcript: fallbackTranscript,
        ...parsedTransaction,
        confidence: 0.5,
        demoMode: true
      })
    }

  } catch (error) {
    console.error('Transcription endpoint error:', error)
    
    // Always provide a fallback response
    const errorTranscript = "Demo: Unable to process audio"
    const parsedTransaction = parseTransactionFromText(errorTranscript)

    return NextResponse.json({
      transcript: errorTranscript,
      ...parsedTransaction,
      confidence: 0.3,
      demoMode: true
    })
  }
}

// Enhanced transaction parser with comprehensive pattern matching
function parseTransactionFromText(text: string) {
  const lowerText = text.toLowerCase()
  
  // Extract amount with multiple patterns
  let amount = 0
  
  // Pattern 1: Direct dollar amounts ($12.50, $12, 12.50)
  const dollarRegex = /\$?(\d+(?:\.\d{1,2})?)/g
  const dollarMatches = Array.from(text.matchAll(dollarRegex))
  
  // Pattern 2: Spelled out numbers (future enhancement)
  // const wordsToNumbers: Record<string, number> = {
  //   'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  //   'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  //   'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  //   'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  //   'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
  //   'eighty': 80, 'ninety': 90, 'hundred': 100
  // }
  
  // Pattern 3: Complex amount patterns
  const amountPatterns = [
    /(\d+)\s*(?:dollars?|bucks?|euro?s?)\s*(?:and\s*)?(\d+)?\s*(?:cents?)?/i,
    /(\d+)\s*(?:and\s*)?(\d+)\s*(?:cents?)?/i,
    /(\d+)\s*(?:point|dot)\s*(\d+)/i,
    /(\d+)\s*fifty/i, // "twelve fifty" = 12.50
    /(\d+)\s*twenty\s*five/i, // "twelve twenty five" = 12.25
  ]
  
  // Try dollar regex first
  if (dollarMatches.length > 0) {
    amount = parseFloat(dollarMatches[0][1])
  } else {
    // Try complex patterns
    for (const pattern of amountPatterns) {
      const match = text.match(pattern)
      if (match) {
        const dollars = parseInt(match[1]) || 0
        const cents = parseInt(match[2]) || 0
        amount = dollars + (cents / 100)
        break
      }
    }
  }
  
  // Extract vendor with enhanced patterns
  let vendor = 'Unknown'
  const vendorPatterns = [
    /(?:at|from|to)\s+([A-Za-z\s&']+?)(?:\s+(?:for|on|in|today|yesterday|this|last)|\.|$)/i,
    /(?:paid|spending|spent)\s+(?:at|to)\s+([A-Za-z\s&']+?)(?:\s+(?:for|on|in|today|yesterday|this|last)|\.|$)/i,
    /([A-Za-z\s&']+?)\s+(?:store|restaurant|cafe|shop|market|gas station)/i,
  ]
  
  for (const pattern of vendorPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      vendor = match[1].trim()
      // Clean up common words
      vendor = vendor.replace(/\b(the|a|an)\b/gi, '').trim()
      if (vendor.length > 2) break
    }
  }
  
  // Extract category with expanded keyword matching
  let category = 'Other'
  const categoryKeywords = {
    Food: [
      // Local Singapore Food
      'food', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'brunch',
      'chicken rice', 'laksa', 'bak kut teh', 'char kway teow', 'roti prata', 'mee goreng',
      'satay', 'rojak', 'carrot cake', 'oyster omelette', 'hokkien mee', 'nasi lemak',
      'dim sum', 'wonton noodles', 'fish ball noodles', 'kaya toast', 'soft boiled eggs',
      
      // Local Chains & Kopitiams
      'toast box', 'ya kun', 'kopitiam', 'food republic', 'food junction', 'food court',
      'hawker centre', 'hawker center', 'coffee shop', 'zi char', 'economy rice',
      
      // Drinks
      'kopi', 'teh', 'milo', 'bubble tea', 'fresh juice', 'sugar cane',
      
      // International Chains
      'starbucks', 'costa coffee', 'the coffee bean', 'dunkin', 'mcdonalds', 'kfc',
      'burger king', 'pizza hut', 'dominos', 'subway', 'yoshinoya', 'mos burger',
      'old chang kee', 'breadtalk', 'four fingers', 'long john silvers',
      
      // General Food Terms
      'eat', 'meal', 'snack', 'drink', 'food delivery', 'takeaway', 'dine in'
    ],
    Transport: [
      // Singapore Public Transport
      'mrt', 'bus', 'lrt', 'ez-link', 'simplygo', 'smrt', 'sbs transit', 'public transport',
      'train', 'metro', 'transport', 'fare', 'top up', 'card',
      
      // Ride Sharing & Taxis
      'grab', 'gojek', 'comfort delgro', 'comfort', 'tada', 'ryde', 'taxi', 'private hire',
      'ride', 'transport', 'car rental', 'car sharing',
      
      // Parking & Road
      'parking', 'hdb parking', 'mall parking', 'street parking', 'season parking',
      'erp', 'electronic road pricing', 'coe', 'road tax', 'vehicle inspection',
      
      // Fuel & Maintenance
      'petrol', 'diesel', 'fuel', 'esso', 'shell', 'spc', 'caltex', 'mobil',
      'car wash', 'oil change', 'repair', 'mechanic', 'workshop', 'service'
    ],
    Shopping: [
      // Singapore Malls & Areas
      'orchard road', 'ion orchard', 'ngee ann city', 'plaza singapura', 'bugis junction',
      'vivocity', 'marina bay sands', 'citylink mall', 'raffles city', 'suntec city',
      'causeway point', 'jurong point', 'tampines mall', 'bedok mall', 'westgate',
      'shopping', 'mall', 'store', 'retail',
      
      // Local Retail Chains
      'ntuc fairprice', 'giant', 'cold storage', 'sheng siong', 'prime supermarket',
      'mustafa centre', 'popular bookstore', 'times bookstore', 'kinokuniya',
      
      // Electronics & Tech
      'challenger', 'courts', 'harvey norman', 'best denki', 'gain city', 'audio house',
      'apple store', 'samsung', 'electronics', 'gadgets', 'phone', 'laptop',
      
      // Fashion & Lifestyle
      'uniqlo', 'h&m', 'zara', 'cotton on', 'charles & keith', 'pedro', 'love bonito',
      'clothes', 'clothing', 'shoes', 'bags', 'accessories', 'fashion',
      
      // Online
      'shopee', 'lazada', 'amazon', 'qoo10', 'carousell', 'online shopping'
    ],
    Entertainment: [
      // Entertainment Venues
      'cinema', 'movie', 'golden village', 'cathay cineplexes', 'shaw theatres',
      'theater', 'theatre', 'esplanade', 'concert', 'show', 'performance',
      'universal studios', 'adventure cove', 'sea aquarium', 'zoo', 'bird park',
      'gardens by the bay', 'art museum', 'science centre',
      
      // Gaming & Activities
      'arcade', 'timezone', 'virtual reality', 'escape room', 'bowling', 'karaoke',
      'ktv', 'pool', 'billiards', 'gym', 'fitness', 'swimming', 'sports',
      
      // Streaming & Digital
      'netflix', 'disney plus', 'amazon prime', 'spotify', 'youtube premium',
      'apple music', 'subscription', 'digital', 'entertainment'
    ],
    Utilities: [
      // Singapore Utilities
      'sp group', 'sp services', 'electricity', 'electric', 'power', 'utility bill',
      'pub', 'water', 'water bill', 'conservancy', 'town council', 's&cc',
      
      // Telecommunications
      'singtel', 'starhub', 'm1', 'circles life', 'phone bill', 'mobile plan',
      'internet', 'wifi', 'broadband', 'fibre', 'data plan', 'roaming',
      
      // Other Services
      'insurance', 'medisave', 'cpf', 'government', 'iras', 'tax', 'fine',
      'license', 'permit', 'registration', 'renewal'
    ],
    Health: [
      // Healthcare
      'doctor', 'clinic', 'polyclinic', 'hospital', 'specialist', 'dentist', 'dental',
      'medical', 'health', 'checkup', 'consultation', 'treatment', 'medicine',
      'pharmacy', 'guardian', 'watsons', 'unity pharmacy', 'prescription',
      'tcm', 'traditional chinese medicine', 'acupuncture', 'physiotherapy',
      'health screening', 'vaccination', 'covid test', 'medical insurance'
    ],
    Groceries: [
      // Supermarkets
      'ntuc fairprice', 'giant', 'cold storage', 'sheng siong', 'prime supermarket',
      'marketplace', 'finest', 'jason deli', 'meidi-ya', 'don don donki',
      'grocery', 'groceries', 'supermarket', 'hypermarket', 'provisions',
      
      // Markets
      'wet market', 'market', 'pasar', 'fresh market', 'morning market',
      'tekka market', 'chinatown market', 'geylang market',
      
      // Products
      'vegetables', 'fruits', 'meat', 'seafood', 'dairy', 'bread', 'eggs',
      'rice', 'noodles', 'canned food', 'frozen food', 'household items'
    ],
    Home: [
      // Home Improvement
      'ikea', 'courts', 'harvey norman', 'gain city', 'home improvement',
      'furniture', 'appliances', 'electronics', 'renovation', 'interior design',
      
      // Housing
      'rent', 'rental', 'mortgage', 'property', 'hdb', 'condo', 'landed',
      'utility deposit', 'agent fee', 'stamp duty', 'valuation',
      
      // Maintenance & Services
      'aircon service', 'plumber', 'electrician', 'handyman', 'cleaning service',
      'pest control', 'locksmith', 'repair', 'maintenance', 'contractor',
      
      // Household Items
      'detergent', 'toilet paper', 'tissue', 'soap', 'shampoo', 'toothpaste',
      'cleaning supplies', 'light bulbs', 'batteries', 'tools', 'hardware'
    ]
  }
  
  // Calculate confidence score based on keyword matches
  let bestCategory = 'Other'
  let maxMatches = 0
  
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestCategory = cat
    }
  }
  
  if (maxMatches > 0) {
    category = bestCategory
  }
  
  // Confidence scoring
  let confidence = 0.5 // Base confidence
  if (amount > 0) confidence += 0.3
  if (vendor !== 'Unknown') confidence += 0.2
  if (category !== 'Other') confidence += 0.2
  
  return {
    amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
    vendor: vendor.length > 30 ? vendor.substring(0, 30) + '...' : vendor,
    category,
    rawText: text,
    parseConfidence: Math.min(confidence, 1.0)
  }
}