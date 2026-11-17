# ZEVA 
The AI English Speaking & Fluency Studio

**ZEVA** is a voice-first, AI-powered web application designed to help learners build real-world spoken English fluency, pacing, and confidence. Instead of static grammar drills, ZEVA listens to how users actually speak, conducts live voice roleplay, and delivers actionable diagnostics—tracking Words Per Minute (WPM), filler-word habits (*"um"*, *"uh"*, *"like"*), CEFR proficiency progression, and natural phrasing upgrades.

---

## Key Features

* **Fluency Studio:** Practice speaking on curated or custom topics. Records microphone audio, produces a verbatim transcript (preserving hesitation markers), calculates WPM and filler counts, assigns a CEFR level (A1–C2), and suggests *"Better Ways to Say That"*.
* **Live Conversation Studio:** Real-time, hands-free voice roleplay with an AI persona across relatable everyday errands (café, pharmacy, landlord, customer support), casual friend/parent conversations, and custom user scenarios.
* **Presentation Studio:** Long-form structured speaking practice for pitches, interviews, and academic presentations with full pacing and fluency diagnostics.
* **Profile & CEFR Progress Tracker:** Visualizes longitudinal growth through a 3-session CEFR progression trail, plain-English fluency insights, session counts, and a personal **Vocabulary Bank**.
* **Seamless Guest Mode + Cloud Sync:** Visitors can immediately test all speaking studios and save vocabulary locally via `localStorage`, or sign in to sync progress across devices via Supabase.

---

## System Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS | Responsive, dark-themed ("Burgundy Studio") single-page application |
| **Diagnostic STT** | Groq Whisper API (`whisper-large-v3`) | High-accuracy verbatim transcription preserving filler words for accurate fluency math |
| **Conversational Voice** | Browser Web Speech API (`SpeechRecognition` & `speechSynthesis`) | Low-latency real-time turn detection and spoken AI replies in Live Conversation mode |
| **AI Evaluation Engine** | Groq LPU-Accelerated LLMs | Structured JSON fluency scoring, CEFR grading, phrasing upgrades, and roleplay personas |
| **Backend & Auth** | Supabase (PostgreSQL + Auth) | User authentication, `session_history` logging, and `vocabulary_bank` persistence |

---

## Getting Started (Local Setup)

### 1. Prerequisites
* **Node.js** (v18+ recommended) and `npm`
* A **Groq Cloud API Key** ([console.groq.com](https://console.groq.com))
* A **Supabase Project** ([supabase.com](https://supabase.com)) with `session_history` and `vocabulary_bank` tables configured

### 2. Clone & Install
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
npm install
