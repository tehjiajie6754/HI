# Zen Travel ✈️

> **Curated Journeys, Crafted for You** — A modern luxury travel planning platform powered by AI, face recognition, and personalised itineraries.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-blue)](https://supabase.com/)
[![AWS Rekognition](https://img.shields.io/badge/AWS-Rekognition-orange)](https://aws.amazon.com/rekognition/)

---

## Features

- 🎭 **Face Liveness Verification** — MediaPipe-powered blink, head-turn & nod detection
- 🔍 **Face Recognition Login** — AWS Rekognition identifies returning travellers instantly
- 🤖 **AI Travel Concierge** — Google Gemini-powered chatbot for personalised itineraries
- 📋 **4-Step Onboarding** — Traveller profile, preferences, verification & payment setup
- 🌐 **Bilingual** — English & Bahasa Malaysia support
- 💎 **Luxury Aesthetic** — Playfair Display + Inter, gold accents, glassmorphism

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Styling | Custom CSS design system, Framer Motion |
| Auth | Supabase, AWS Rekognition |
| AI/Chat | Google Gemini 1.5 Flash, FastAPI |
| Face Detection | MediaPipe Tasks Vision |

---

## Quick Start

### Frontend

```bash
cd zentravel
cp .env.example .env.local   # fill in your credentials
npm install
npm run dev                  # http://localhost:3000
```

### Backend (AI Chatbot)

```bash
cd zentravel/backend
pip install -r requirements.txt
cp ../.env.example .env      # fill in GOOGLE_GENAI_API_KEY
uvicorn main:app --reload    # http://localhost:8000
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM key for Rekognition |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret |
| `AWS_REGION` | e.g. `ap-southeast-1` |
| `AWS_REKOGNITION_COLLECTION_ID` | Your Rekognition face collection ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GOOGLE_GENAI_API_KEY` | Google AI Studio API key |

---

## Demo Accounts (Development)

| Email | Password | Travel Style |
|-------|----------|-------------|
| sarah.chen@zentravel.com | password123 | Adventure |
| marcus.rivera@zentravel.com | password123 | Luxury |
| aiko.tanaka@zentravel.com | password123 | Cultural |

---

## Project Structure

```
zentravel/
├── src/
│   ├── app/
│   │   ├── api/face-recognition/   # AWS Rekognition endpoint
│   │   ├── api/chatbot/            # AI chat proxy
│   │   ├── login/                  # Face liveness login
│   │   ├── onboarding/             # 4-step traveller setup
│   │   └── home/                   # Post-login dashboard
│   ├── components/
│   │   ├── auth/PreLoginHome       # Landing page
│   │   ├── backgrounds/Iridescence # WebGL background
│   │   ├── chatbot/Chatbot         # AI concierge widget
│   │   ├── layout/                 # Header, Footer, ConditionalLayout
│   │   └── sections/              # Hero, Features, CTA
│   ├── contexts/                   # UserContext, LanguageContext
│   └── lib/                        # utils, types, onboarding-storage
└── backend/
    └── main.py                     # FastAPI AI backend
```

---

*Built with ❤️ — Zen Travel, 2025*
