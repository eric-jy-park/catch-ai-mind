# Catch AI Mind - Planning Documentation

Complete planning documentation for the 캐치마인드 AI drawing game.

## Quick Reference

**Main Plan**: `/Users/ericpark/.claude/plans/typed-riding-dahl.md` (Complete implementation plan)

## Documentation Structure

1. **Frontend Architecture** (`01-frontend-architecture.md`)
   - Next.js project structure
   - 스케치북 design system
   - Component architecture
   - Excalidraw integration
   - Korean text handling

2. **AI Drawing & Guessing Overhaul** (`02-ai-drawing-guessing-overhaul.md`)
   - SVG-based drawing generation (inspired by Pintel)
   - Vision-based guessing (AI sees canvas screenshot)
   - Migration from JSON elements to SVG strings
   - OpenRouter vision API integration
   - Implementation phases and checklist

3. **Technology Stack**
   - Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS
   - Canvas: Excalidraw (collaborative drawing)
   - Real-time: Liveblocks (Storage + Presence + Broadcast)
   - AI: OpenAI, Anthropic, Google, xAI, DeepSeek
   - Korean: Noto Sans KR font, hangul-js matching

3. **Key Design Principles**
   - 편안한 스케치북 느낌 (comfortable sketchbook aesthetic) throughout entire UI
   - Desktop-first (1920x1080 for streamers)
   - Anonymous sessions (no login required)
   - v1 includes: Core game + sound effects + ad slots

## Implementation Phases

### Week 1: Foundation
- Next.js setup + dependencies
- Liveblocks configuration
- Korean word bank generation (300+ words)
- Korean fuzzy matching algorithm

### Week 2: Game Logic
- Game state machine
- API routes (create, guess, next-round)
- Server-side validation
- Timer synchronization

### Week 3: AI Integration
- 5 AI providers with distinct personalities
- Progressive drawing orchestration
- AI guessing with cooldown
- Streaming API endpoints

### Week 4: Frontend UI
- Character selection screen
- Game screen with Excalidraw canvas
- 스케치북 styled components
- Korean IME input

### Week 5: Polish & Deploy
- Sound effects
- Ad integration (placeholder slots)
- DALL-E character portraits
- Testing + deployment

## Critical Files (Priority Order)

**Tier 1 - Foundation:**
1. `/liveblocks.config.ts`
2. `/types/game-state.ts`
3. `/lib/matching/korean-matcher.ts`
4. `/data/words/easy.json`

**Tier 2 - Game Logic:**
5. `/lib/game/game-state-machine.ts`
6. `/lib/server/gameSessionStore.ts`
7. `/app/api/game/guess/route.ts`
8. `/lib/ai/providers/base.ts`

**Tier 3 - UI:**
9. `/components/game/ExcalidrawCanvas.tsx`
10. `/app/game/[roomId]/page.tsx`
11. `/app/select/page.tsx`
12. `/lib/ai/orchestrator.ts`

## AI Character Personalities

- **ChatGPT (모범생)**: Precise, methodical, by-the-book
- **Gemini (듀얼)**: Artistic, unpredictable, sometimes brilliant
- **Claude (차분함)**: Minimalist, polite, thoughtful
- **Grok (엣지)**: Chaotic, meme-aware, edgy
- **DeepSeek (다크호스)**: Rough, analytical, underdog

## Environment Variables Needed

```env
# Liveblocks
LIVEBLOCKS_SECRET_KEY=
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
XAI_API_KEY=
DEEPSEEK_API_KEY=
```

## Success Criteria

- ✅ All 5 AI characters functional
- ✅ 10-round game loop with role swapping
- ✅ Korean fuzzy matching accurate
- ✅ AI drawing progressive and entertaining
- ✅ 스케치북 aesthetic throughout
- ✅ Stream-friendly (OBS 1920x1080)
- ✅ Real-time sync <200ms

## Next Steps

Ready to begin implementation! Start with Phase 1: Project Setup.
