# Voice Finance Tracker - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will automatically check your environment and inform you of the current mode.

3. **Open Application**
   - Navigate to http://localhost:3000
   - Click "Start Voice-Only Budgeting Free" to try the demo
   - Record a voice expense like "I spent $5 on chicken rice at Maxwell Food Centre"

## 🇸🇬 Singapore-Optimized

The app is pre-configured for Singapore users with local context:
- **Food**: Chicken rice, laksa, bubble tea, hawker centres, kopitiams
- **Transport**: MRT, Grab, EZ-Link, parking, petrol stations
- **Shopping**: NTUC, Giant, Orchard Road, Marina Bay Sands
- **Services**: Singtel, Starhub, SP Group, PUB

## Features Available

### ✅ **Always Working**
- **Voice Recording**: Professional audio capture with waveform visualization
- **Smart Demo Mode**: Seamless fallback with Singapore-specific examples
- **Transaction Management**: Add, edit, delete transactions
- **Real-time Analytics**: Spending summaries and category breakdowns
- **Data Persistence**: Transactions saved in browser localStorage
- **Mobile Responsive**: Works on all device sizes
- **Singapore Context**: Local vendors, transport, and services recognition

### 🚀 **Enhanced with API Key**
- **Real Speech-to-Text**: Actual voice transcription via Deepgram
- **Natural Language**: Process any spoken expense description
- **Higher Accuracy**: Real-time confidence scoring and validation

## Developer Setup (Optional)

For real speech-to-text transcription:

1. **Get Deepgram API Key**
   - Sign up at https://deepgram.com
   - Create a new project and generate an API key

2. **Configure Environment**
   ```bash
   # Copy example file
   cp .env.local.example .env.local
   
   # Add your API key
   DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

## Example Voice Commands (Singapore Context)

Try saying these phrases:
- "I spent $5 on chicken rice at Maxwell Food Centre"
- "MRT fare $2.50 to Orchard Road"
- "Bubble tea at Gong Cha $4.80"
- "Grab to Marina Bay Sands $15"
- "NTUC groceries $45"
- "Singtel phone bill $50"

## How It Works

### User Experience
- **Seamless**: Users never see technical errors or API messages
- **Intelligent Fallback**: App works perfectly without any setup
- **Singapore-First**: Optimized for local context and speech patterns

### Developer Experience
- **Clear Feedback**: Build-time checks inform you of current mode
- **Easy Setup**: Optional API key for enhanced functionality
- **No User Impact**: Technical configuration doesn't affect user experience

## Next Steps

1. **Deploy to Vercel**: `vercel --prod`
2. **Add Analytics**: Vercel Analytics or PostHog
3. **Error Monitoring**: Sentry integration
4. **Testing**: Jest + React Testing Library
5. **Enhanced Features**: Receipt scanning, budgets, exports

## Troubleshooting

### Voice Recording Not Working
- Ensure microphone permissions are granted
- Check that you're using HTTPS (required for microphone access)
- Verify browser compatibility (Chrome, Firefox, Safari 14+)

### API Errors
- Verify Deepgram API key is correct
- Check internet connectivity
- Monitor browser console for error messages

### Build Issues
- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies are installed
- Check Node.js version compatibility (16+)