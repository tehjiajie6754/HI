# Zen Travel — Project Context for AI Assistants

## What This Is
A luxury travel agency platform cloned from the BizKuKu MSME template and rebranded for travel itinerary planning.
Located at: `c:/Users/yeswa/OneDrive/Desktop/temp/BizKuKu/zentravel/`

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), Google GenAI (gemini-pro)
- **Auth / DB**: Supabase
- **Face Recognition**: AWS Rekognition + MediaPipe Tasks Vision
- **Fonts**: Playfair Display (headings) + Inter (body)

## Design System — Luxury Minimal
```
Colors:
  --color-white:   #FAFAFA  (primary backgrounds)
  --color-cream:   #F5F0EB  (warm secondary backgrounds)
  --color-charcoal:#1A1A2E  (primary text, dark sections)
  --color-gold:    #C9A84C  (accents, CTAs)
  --color-stone:   #E8E4DF  (borders, muted elements)

Typography:
  Headings: Playfair Display (serif)  → var(--font-heading)
  Body:     Inter (sans-serif)        → var(--font-body)
```

## Key Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Root page — shows PreLoginHome or redirects to /home |
| `src/app/login/page.tsx` | Face liveness + AWS Rekognition login |
| `src/app/onboarding/page.tsx` | 4-step traveller onboarding |
| `src/app/home/page.tsx` | Post-login home with all sections + Chatbot |
| `src/components/face-liveness/FaceLivenessModal.tsx` | Reusable face liveness modal |
| `src/components/chatbot/Chatbot.tsx` | Floating AI concierge |
| `src/contexts/UserContext.tsx` | Auth state + mock traveller accounts |
| `src/contexts/LanguageContext.tsx` | EN / BM i18n |
| `src/lib/onboarding-storage.ts` | localStorage persistence |
| `backend/main.py` | FastAPI entry point |
| `backend/src/api/chat.py` | Chat endpoint (Gemini Pro) |

## Dev Commands
```bash
# Frontend
cd zentravel && npm run dev        # → http://localhost:3001

# Backend (Python 3.10+)
cd zentravel/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Demo Accounts
```
sarah.chen@zentravel.com     / password123  (Adventure)
marcus.rivera@zentravel.com  / password123  (Luxury)
aiko.tanaka@zentravel.com    / password123  (Cultural)
```

## Environment Variables
See `.env.example` for all required keys:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GENAI_API_KEY`
- `NEXT_PUBLIC_API_URL` (FastAPI URL, defaults to http://localhost:8000)

## What NOT to Change
- Do not add MSME-specific components (financial reports, open finance, compliance)
- Do not remove the gold accent colour — it's the primary brand accent
- Do not change font imports — Playfair Display + Inter are core to the aesthetic
