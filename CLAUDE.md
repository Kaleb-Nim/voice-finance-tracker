# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice Finance Tracker is a production-ready Singapore-localized expense tracking application that uses voice commands to log expenses. It features seamless demo mode that works without configuration while supporting optional real speech-to-text integration via Deepgram API. The app includes 480+ Singapore-specific keywords for local context recognition.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack (includes environment checking)
- `npm run build` - Build for production (includes environment validation)
- `npm start` - Start production server  
- `npm run lint` - Run ESLint
- `npm run check-env` - Manually check environment configuration

### Testing
- No test framework configured yet

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TailwindCSS 4
- **State Management**: Zustand with localStorage persistence
- **Speech Processing**: Deepgram API with Singapore context parsing
- **UI Components**: shadcn/ui patterns with Framer Motion animations
- **Deployment**: Vercel

### Key Components (Implemented)
- `VoiceRecorder.tsx` - Advanced audio recording with waveform visualization
- `EditTransactionModal.tsx` - Transaction editing interface
- `ui/` components - Reusable component library (Button, Card, Input, Modal)
- Singapore-specific transaction parsing engine

### API Routes Structure
- `/api/transcribe` - Speech-to-text processing with Singapore context parsing

### Data Storage
- **Local Storage**: Browser localStorage with Zustand store
- **Transaction Schema**: 
  ```typescript
  interface Transaction {
    id: string
    amount: number
    vendor: string
    category: string
    date: string
    rawText: string
    confidence: number
  }
  ```

## Singapore Localization

### Context Categories (480+ keywords)
- **Food**: chicken rice, laksa, bak kut teh, bubble tea, hawker centres, kopitiams
- **Transport**: MRT, Grab, EZ-Link, ERP, COE, parking
- **Shopping**: NTUC FairPrice, Ion Orchard, VivoCity, Shopee, Lazada
- **Utilities**: SP Group, Singtel, StarHub, Town Council, CPF

### Voice Command Examples
- "I spent $5 on chicken rice at Maxwell Food Centre"
- "MRT fare $2.50 to Orchard Road"
- "Bubble tea at Gong Cha $4.80"
- "Grab to Marina Bay Sands $15"

## Configuration

### TypeScript
- Path alias: `@/*` maps to project root
- Strict mode enabled
- Next.js plugin configured
- 100% type coverage across codebase

### Next.js
- App Router with React Server Components
- Geist font family (Sans & Mono)
- Default configuration in `next.config.ts`
- Build-time environment validation

### Environment Variables (Optional)
```
# Optional - enables real speech-to-text (demo mode works without this)
DEEPGRAM_API_KEY=your_deepgram_api_key

# Future use - not currently required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Notes

### Current State
- **Production Ready**: Fully functional Singapore-localized expense tracker
- **Demo Mode**: Works seamlessly without any API configuration
- **Enhanced Mode**: Real speech-to-text when Deepgram API key is configured
- **Local-First**: All data stored in browser localStorage
- **Mobile Optimized**: Responsive design with PWA capabilities

### Key Features
- Voice recording with professional waveform visualization
- Real-time transaction parsing with Singapore context
- CRUD operations for transaction management
- Instant analytics (totals, weekly spending, category breakdowns)
- Edit transactions with modal interface
- Cross-browser compatibility (Chrome, Firefox, Safari)

### Architecture Patterns
- **Local-First**: Primary data storage in browser localStorage
- **Progressive Enhancement**: Core functionality works offline
- **Graceful Fallbacks**: Demo mode when API unavailable
- **Singapore Context**: 480+ local keywords for accurate parsing
- **Developer-Friendly**: Clear environment feedback during development

### Voice Processing Flow
```
User Voice → MediaRecorder API → Audio Blob → /api/transcribe → 
Singapore Context Parsing → Transaction Data → Zustand Store → 
UI Update → localStorage Persistence
```

### Performance Optimizations
- Bundle size: 155 kB first load with code splitting
- Runtime: localStorage operations under 1ms
- Animations: 60fps with hardware acceleration
- Memory management: Proper cleanup of audio contexts

## Development Workflow

### Adding New Features
1. Check ai_docs/ for architecture understanding
2. Follow existing patterns in components/ui/
3. Use TypeScript interfaces from types/
4. Test in both demo and enhanced modes
5. Update documentation in ai_docs/

### Singapore Context Expansion
- Add new keywords to categoryKeywords in `/api/transcribe/route.ts`
- Test parsing accuracy with new contexts
- Update voice command examples in components

### Environment Modes
1. **Demo Mode**: No API keys required, uses some Singapore-specific mock data
2. **Enhanced Mode**: Deepgram API key enables real speech-to-text
3. **Development**: Clear console feedback about current mode

## Testing Strategy

### Manual Testing Checklist
- Voice recording works across browsers
- Singapore context parsing accuracy
- Transaction CRUD operations
- Data persistence across sessions
- Mobile responsiveness
- Microphone permission handling

### Future Testing
- Unit tests for transaction parsing
- Integration tests for voice workflow
- E2E tests for complete user journey
- Performance testing for audio processing

## Deployment

### Environment Setup
- Works immediately without any configuration
- Optional Deepgram API key for enhanced functionality
- Vercel deployment ready with automatic builds
- Environment checking integrated into build process

### Production Checklist
- [x] Some Singapore localization complete
- [x] Demo mode seamless experience
- [x] Mobile-responsive design
- [x] Error handling and fallbacks
- [x] Performance optimization
- [ ] Analytics integration (future)
- [ ] Error monitoring (future)

After completion of each major change, detail the changes in ai_docs/*