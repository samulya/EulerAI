# Euler AI — The AI Mathematics Mentor

## Overview
Euler AI is a full-stack Progressive Web Application (PWA) that teaches mathematics from elementary school to research level. It acts as an AI mathematics mentor, adapting explanations to the learner's age, level, and goals.

## Tech Stack
- **Frontend**: React + TypeScript + Vite (port 5000)
- **Backend**: Express.js (port 3001)
- **AI**: Google Gemini (gemini-1.5-flash) — mock mode when no API key
- **Styling**: Tailwind CSS
- **Math Rendering**: KaTeX via react-markdown + remark-math + rehype-katex
- **Storage**: Browser localStorage (profile, API key, history)

## Running the App
```
npm run dev
```
This starts both the Vite frontend (port 5000) and Express backend (port 3001) concurrently.

## Key Files
- `server/index.js` — Express backend with Gemini integration
- `src/pages/` — All app pages (Onboarding, Dashboard, Ask, History, Profile, Settings)
- `src/contexts/AppContext.tsx` — Global state (profile, API key, history, progress)
- `src/components/` — Reusable UI components

## Adding a Gemini API Key
1. Go to `/settings` in the app
2. Enter your Gemini API key (get one free at https://aistudio.google.com/app/apikey)
3. Click "Validate & Save"

Without a key, the app runs in mock mode with sample responses.

## Design System
- Primary: Deep Navy Blue `#0F172A`
- Accent: Gold `#D4A017`
- Background: Off-white `#F8FAFC`

## Features
- Personalized onboarding (name, age, country, goal)
- 4 teaching modes: Hint Only / Teach Me / Step-by-Step / Full Solution
- Age-adaptive AI explanations (8-10, 11-13, 14-18, University, JEE, Olympiad, Research)
- Image upload for handwritten/printed math questions
- Learning feedback (Yes/Somewhat/No → auto-simplify)
- Progress tracking (history, mastered topics, review topics)
- PWA-ready (installable)

## User Preferences
- Navy/white/gold design system maintained throughout
- No emojis in core UI (only in onboarding options)
- Mobile-first, clean academic aesthetic
- Mock responses preserved for all modes when no Gemini key provided
