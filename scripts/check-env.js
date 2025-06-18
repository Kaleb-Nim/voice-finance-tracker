#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Checking environment configuration...\n')

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local')
const envExists = fs.existsSync(envLocalPath)

if (!envExists) {
  console.log('⚠️  .env.local file not found')
  console.log('   Copy .env.local.example to .env.local and configure your API keys\n')
}

// Check Deepgram API key
const deepgramKey = process.env.DEEPGRAM_API_KEY
const hasValidDeepgramKey = deepgramKey && 
  deepgramKey !== 'your_deepgram_api_key' && 
  deepgramKey.length > 10

if (!hasValidDeepgramKey) {
  console.log('🚧 DEVELOPER NOTE: Deepgram API key not configured')
  console.log('   - App will run in demo mode with simulated transcriptions')
  console.log('   - To enable real speech-to-text:')
  console.log('     1. Sign up at https://deepgram.com')
  console.log('     2. Get your API key')
  console.log('     3. Add DEEPGRAM_API_KEY=your_key_here to .env.local')
  console.log('     4. Restart the development server')
  console.log('   - Users will not see this message - demo mode is seamless\n')
} else {
  console.log('✅ Deepgram API key configured')
  console.log('   - Real speech-to-text transcription enabled')
  console.log('   - Singapore-specific parsing active\n')
}

// Check Supabase config (for future use)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const hasValidSupabase = supabaseUrl && 
  supabaseKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseKey !== 'your_supabase_anon_key'

if (!hasValidSupabase) {
  console.log('📝 Supabase not configured (optional for demo)')
  console.log('   - App uses local storage for transactions')
  console.log('   - For cloud storage and user accounts, configure Supabase\n')
} else {
  console.log('✅ Supabase configured')
  console.log('   - Ready for user authentication and cloud storage\n')
}

console.log('🚀 Application ready to start!')

if (!hasValidDeepgramKey) {
  console.log('   Running in demo mode with Singapore-localized examples')
} else {
  console.log('   Running with full speech-to-text capabilities')
}

console.log('')