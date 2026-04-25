# Video: <https://drive.google.com/drive/folders/1-oVd0pSacvF5-r2f7ecmDIR5oxceTYxf>

# Zen Travel ✈️

## By Team : T-Junction

> **Curated Journeys, Crafted for You** — A modern luxury travel planning platform powered by AI, face recognition, and personalised itineraries.

# Submission Deliverables:

## Product Requirement Document
<https://docs.google.com/document/d/13oDJlkZnFhT54YdPXY2I57fVoA7lLLFp/edit?usp=drive_link&ouid=101685104398206811215&rtpof=true&sd=true>


## Software Analysis Design
<https://docs.google.com/document/d/17rlD4E5KXsWhKqCbmm0QINeD4ksw4JjW/edit?usp=sharing&ouid=101685104398206811215&rtpof=true&sd=true>

## Quality Assurance Testing Documentation
<https://docs.google.com/document/d/1RHej2zy8gyUwJCfuVY_QarQcGtbmYxXc/edit?usp=sharing&ouid=101685104398206811215&rtpof=true&sd=true>

## Pitch Deck
<https://drive.google.com/drive/folders/1-oVd0pSacvF5-r2f7ecmDIR5oxceTYxf>


## Tech Stack

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-blue)](https://supabase.com/)
[![AWS Rekognition](https://img.shields.io/badge/AWS-Rekognition-orange)](https://aws.amazon.com/rekognition/)



## Features

### [Feature Prioritization & MVP Scope]
To get this to market quickly and validate our concept, we are strictly defining our MVP scope. We are prioritizing three core features that solve the immediate pain points:
- **Face Recognition** : Sensitive Data (Payment Details) Instead of gmail and password we use face recognition
- **Plan Personalised Trip** : Plan the trip based on your personalities, preference and also the place you are interested
- **Read Geopolitical news** and restrict from entering a nation due to war
- **Weather-Based Packing Assistance** — Suggest what things you should pack based on weather forecast
- **Optimized Travel Search** — Compare and find the cheapest and most suitable flight and hotel based on your preference
- **Visa & Entry Requirements** — Provide detail steps on doing VISA or any requirements to enter a nation
- **Auto Send Gmail**
- **General Web Search** to get the attractions at each place

---

- **The Multilingual Conversational Planner & Guardian**: The core AI engine that analyzes personality, handles dynamic itinerary changes via prompts, provides Visa/packing assistance, and integrates active global threat monitoring to alert users of severe destination risks.
- **Real-time Inventory APIs**: Integration with major travel aggregators to pull live pricing and filter out unverified, scam listings.
- **Biometric Unified Checkout**: Because we handle sensitive payment details, our MVP includes a frictionless, highly secure checkout using Face Recognition—ensuring bookings are safe, instant, and password-free.

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
