# PROJECT_SPEC.md — ZEVA: The English Speaking Studio

## 1. App Overview & Core Vision
- **Application Name:** ZEVA — The English Speaking Studio
- **Concept:** A $0-cost, browser-based English fluency and vocal coaching studio designed for everyday spoken English improvement (CEFR proficiency grading, filler-word tracking, grammar/vocabulary upgrades, live adaptive voice conversation) and confident solo presentation delivery.
- **Tech Stack:**
  - **Framework:** React (Vite) + React Router (or clean state-driven view routing)
  - **Styling:** Tailwind CSS + Lucide React Icons
  - **Audio & AI Architecture (Phase 2 Integration):** Web Audio API (`AnalyserNode` + `MediaRecorder`), Groq Cloud Free Tier (`whisper-large-v3-turbo` for STT; `openai/gpt-oss-120b` with automatic fallback to `openai/gpt-oss-20b` for JSON reasoning), and browser `window.speechSynthesis` / Orpheus TTS.
- **Current Build Goal (Phase 1 — Interactive UI Prototype):**
  - Build the complete, interactive frontend interface from **Page 1 to Page 6** using rich, realistic **Mock Data** and simulated loading/audio states so the entire user flow, transitions, scorecard reports, voice chat loops, and Vocabulary Bank can be tested visually before wiring up live Groq API keys.

---

## 2. Visual Theme & Design System ("Burgundy Studio")
- **Base Background:** Deep obsidian black (`#090507`) across `100vw` × `100vh`.
- **Interactive Cursor-Tracking Aura:** A continuous, soft radial gradient bound smoothly to pointer coordinates (`mousemove` listener) that trails the user's cursor across the screen:
  - `radial-gradient(650px circle at var(--mouse-x) var(--mouse-y), rgba(159, 18, 57, 0.22), rgba(76, 5, 25, 0.08) 45%, transparent 80%)`
  - Smooth CSS damping lag (`transition: background 150ms ease-out`).
- **Card & Surface Surfaces:** Dark wine-tinted charcoal (`#1A0D13` / `#231219`) with `backdrop-blur-xl` and hairline borders (`border-[#4A2230]/70`).
- **Primary Accents:** Rich burgundy/crimson (`#9F1239` default, `#BE123C` hover) with soft crimson outer glows (`shadow-[0_0_25px_rgba(159,18,57,0.45)]`).
- **Secondary / Highlight Accents:** Warm rose-gold (`#FDA4AF` / `#FB7185`) for active indicators, badges, and text gradients.
- **Typography:** Clean sans-serif (`Inter` or `Plus Jakarta Sans`), crisp off-white (`#F9FAFB`) for headings/primary text, and muted rose-gray (`#9CA3AF` / `#D1D5DB`) for secondary descriptions.
- **Global Micro-Interactions:** Smooth staggered fade-ins on view transitions, scale lift on buttons (`hover:scale-[1.02] active:scale-[0.98]`), and pulsing crimson waveforms during recording states.
- **Design Constraints (Strict):**
  - **DO NOT** include a "System Architecture" button anywhere in the UI.
  - **DO NOT** use the word "Free" on CTA buttons (use `Try Zeva`).
  - **DO NOT** display a ticking countdown timer during audio recordings (only state `Limit: 5 minutes max` and enforce a silent 5-minute background cap).
  - **DO NOT** include a "Load Sample Audio" button on recording screens.

---

## 3. Global Persistent Component: Vocabulary Bank Drawer
- **Trigger:** Accessible from the top-right header on Pages 3, 4, 5, and 6 via a distinct rose-gold outlined button (`Vocabulary Bank [Count]`).
- **Layout:** Slide-over glassmorphic drawer from the right (`bg-[#1A0D13]/95 border-l border-[#4A2230]`).
- **States:**
  - **Populated State:** Displays bookmarked sentence upgrade cards (`Original Spoken` vs. `Upgraded Alternative` + Mode tag) with a delete/mastered trash icon.
  - **Empty State:** Displays: *"Your Vocabulary Bank is empty. Bookmark upgraded phrases during your sessions to review them here."*
- **Persistence:** Synced to `localStorage` (keyed by logged-in user email if signed in, or session-only if in Guest Mode).

---

## 4. Page-by-Page Breakdown & Routes

### **Page 1: Landing & Gateway Screen**
- **Route:** `/`
- **Layout & Sections:**
  1. **Minimalist Sticky Header (`h-16`):**
     - Left: Burgundy waveform/mic icon + **ZEVA** (`text-[#F9FAFB]`) + muted subtitle (`The English Speaking Studio`).
     - Right: Clean ghost button `Log In` (navigates to `/login`).
  2. **Above-the-Fold Hero Section:**
     - Eyebrow pill: `Browser-Based AI Vocal & Fluency Studio`.
     - **Wordmark & Crimson Backlight:** Behind **ZEVA** sits an anchored, pulsing radial crimson glow (`blur-3xl bg-[#DC2626]/25`). Title **ZEVA** rendered at `72px` (`text-[72px] font-black tracking-wider text-[#F9FAFB] leading-none`).
     - **Stacked Subtitle:** Immediately underneath **ZEVA**, rendered as **The English Speaking Studio** (`text-2xl sm:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#F9FAFB] via-[#FDA4AF] to-[#FB7185]`).
     - **Two-Line Description:** *"Refine your everyday spoken fluency, eliminate filler habits, and master confident presentation delivery. Real-time acoustic telemetry meets adaptive AI vocal coaching right in your browser."*
     - **Dual Action Buttons:**
       - Primary CTA: `Try Zeva` (`bg-[#9F1239] hover:bg-[#BE123C]`, routes directly to `/studio` in Guest Mode).
       - Secondary CTA: `Log In` (`bg-[#231219]/80 border border-[#4A2230]`, routes to `/login`).
  3. **Scroll-Down Feature Showcase (3 Interactive Cards):**
     - **Card 1 — Everyday Fluency & Grammar:** Preview badge + description of untimed speaking diagnostics, filler audits, and CEFR scoring.
     - **Card 2 — Live Adaptive Voice Conversation:** Preview badge + description of natural two-way spoken scenarios with inline grammar upgrades.
     - **Card 3 — Solo Presentation Studio:** Preview badge + description of uninterrupted pitch/presentation rehearsals with structural and tone feedback.

---

### **Page 2: Authentication & Sign-In Screen**
- **Route:** `/login`
- **Layout & Sections:**
  1. **Top Navigation:** Left `← Back to Home` (`/`), Right `Continue as Guest →` (`/studio`).
  2. **Centerpiece Glassmorphic Auth Card (`max-w-md`):**
     - Header: Burgundy crest icon, title (`Welcome Back to ZEVA` / `Create Your Studio Profile`), subtitle (*"Sync your CEFR progress, streak milestones, and saved vocabulary bank across sessions."*).
     - **Segmented Pill Toggle:** Switches smoothly between `Log In` and `Sign Up`.
     - **Form Inputs:**
       - `Display Name / Studio Alias` (smoothly expands downward only when `Sign Up` is selected).
       - `Email Address`
       - `Password` (with Eye / Eye-Off visibility toggle icon).
     - **Submit Button:** `Log In to Studio` / `Create Studio Account` -> saves/loads profile in `localStorage` and navigates to `/studio`.

---

### **Page 3: The 3-Mode Selector Hub (Central Command Deck)**
- **Route:** `/studio`
- **Layout & Sections:**
  1. **Persistent Studio Header:**
     - Left: **ZEVA** brand crest.
     - Right: Session status pill (`Guest Mode` or signed-in user's Studio Alias + `Log Out` option) and the **Vocabulary Bank** drawer button with live badge count.
  2. **Greeting Header:** *"Welcome to Your Speaking Studio"* + subtitle *"Select a mode below to begin your diagnostic session, practice live conversational fluency, or rehearse your presentation delivery."*
  3. **Three Large Horizontal Feature Cards (`max-w-4xl mx-auto space-y-4`):**
     - **Card 1: Everyday Fluency & Grammar**
       - *Description:* `"Speak on the selected topic to receive a complete CEFR level score, filler word audit, and mistake-to-upgrade breakdown."`
       - *Route:* `/studio/fluency`
     - **Card 2: Live Adaptive Voice Conversation**
       - *Description:* `"Engage in real-time spoken dialogue with an AI conversational partner featuring live inline grammar upgrades and instant scenario reloading."`
       - *Route:* `/studio/conversation`
     - **Card 3: Solo Presentation Studio**
       - *Description:* `"Rehearse high-stakes pitches and structured talks uninterrupted, receiving targeted feedback on professional delivery, pacing, and persuasive vocabulary."`
       - *Route:* `/studio/presentation`

---

### **Page 4: Everyday Fluency & Grammar Studio**
- **Route:** `/studio/fluency`
- **Layout & Sections:**
  1. **Studio Header:** `← Back to Studio Modes` (`/studio`), crimson pill `Everyday Fluency & Grammar`, and `Vocabulary Bank` button.
  2. **Phase A — Topic Prompt & Untimed Recording (`max-w-3xl mx-auto`):**
     - **IELTS-Style Topic Card:** Displays a general speaking topic + 3 bullet points, plus a **Shuffle Topic** (`RefreshCw`) button.
     - **Audio Capture Hub:**
       - *Idle State:* Glowing burgundy **Start Speaking** button + helper text: `"Limit: 5 minutes max"`.
       - *Recording State:* Live simulated/Web Audio rose-crimson waveform visualizer, pulsing `"Recording Live..."` dot (no countdown clock), and a **Stop Recording** button.
       - *Review Bar (Post-Stop):* Playback scrubber (`Play/Pause`) + two explicit buttons: **🗑️ Discard** (resets) and **🚀 Send for Analysis** (triggers loading state -> Phase B).
  3. **Phase B — Diagnostic Scorecard Report:**
     - **4-Column Telemetry Grid:** Estimated CEFR Ring Gauge (e.g., `B2`), Speaking Pace (`136 WPM`), Speech-to-Pause Ratio (`84%`), and Vocal Energy Consistency (`Steady`).
     - **Filler Audit Tracker:** Interactive pills showing caught fillers (`"um" × 3`, `"like" × 2`, `"basically" × 2`) + actionable tip.
     - **Mistake vs. Upgraded Sentences Cards:** Side-by-side comparison cards with one-click **Save to Vocabulary Bank** bookmark buttons.
     - **Post-Report Action Loop (Bottom Buttons):**
       - `Practice Similar Topic` (loads a related reinforcement prompt targeting their mistakes).
       - `Explore New Topic` (shuffles to a completely unrelated topic category).

---

### **Page 5: Live Adaptive Voice Conversation Studio**
- **Route:** `/studio/conversation`
- **Layout & Sections:**
  1. **Studio Header:** `← Back to Studio Modes` (`/studio`), crimson pill `Live Adaptive Voice Conversation`, and `Vocabulary Bank` button.
  2. **Phase A — Pre-Conversation Setup (`max-w-2xl mx-auto`):**
     - **Scenario Card:** Displays conversational roleplay scenario + **Reload / New Topic** (`RefreshCw`) button.
     - **Primary Button:** `Start Conversation` (requests mic / starts continuous hands-free dialogue).
  3. **Phase B — Active Hands-Free Two-Way Conversation (Split Workspace):**
     - *Rules:* Continuous mic session (no Push-to-Talk button, no send button, and **no audio replay buttons** on AI bubbles so users practice asking the AI to repeat naturally).
     - **Left Panel (Chronological Chat Timeline):**
       - AI messages on the left; User messages on the right.
       - Underneath User bubbles appears a discreet **"Better Way to Say That"** inline card with grammar/phrasing upgrades and a **Save to Bank** bookmark icon.
     - **Right Panel (Live Session Telemetry):** Real-time WPM, live filler counter, and ambient amber border pulse if fillers spike.
     - **Bottom Control Bar:** Live voice state pill (`Listening to you...` / `Thinking...` / `AI Speaking...`) + single **Stop Conversation** button.
     - **1–2 Minute Pacing Arc:** Simulates natural conversation wind-down around 60s and graceful closure by 120s, revealing a **Post-Conversation Wrap-Up Summary Card** with an option to `Start Another Scenario`.

---

### **Page 6: Solo Presentation Studio**
- **Route:** `/studio/presentation`
- **Layout & Sections:**
  1. **Studio Header:** `← Back to Studio Modes` (`/studio`), crimson pill `Solo Presentation Studio`, and `Vocabulary Bank` button.
  2. **Phase A — Pre-Rehearsal Setup (`max-w-3xl mx-auto`):**
     - **Source Mode Segmented Switch:**
       - Tab 1: `Practice Prompts` (Curated school/office prompts + **Shuffle Prompt** button).
       - Tab 2: `My Own Topic` (Custom presentation title input e.g., *"Final Year Project Pitch"* + optional audience context pills: `School / College`, `Office / Client`, `General Audience`).
     - **Rehearsal Capture Hub:**
       - *Idle State:* **Start Presentation** button + helper text `"Limit: 5 minutes max"`.
       - *Recording State:* Live crimson waveform + **Stop Recording** button.
       - *Review Bar:* **🗑️ Discard** or **🚀 Send for Evaluation**.
  3. **Phase B — Professional Delivery Report:**
     - **4-Column Metrics:** Authority & Tone Index (`88/100`), Structural Pacing (`124 WPM`), Filler Word Audit, and Pause Discipline.
     - **Structure & Flow Feedback Card:** Evaluates opening hook, transitions, and conclusion tailored to their chosen or custom topic.
     - **Vocabulary & Phrasing Upgrades:** Side-by-side comparison cards with **Save to Vocabulary Bank** buttons.
     - **Post-Report Action Loop:** `Rehearse Same Topic Again` / `Rehearse Similar Prompt` and `Try a New Topic`.

---

## 5. Sample Mock Data (For Interactive Prototype Testing)

### **A. IELTS-Style Fluency Topics (Page 4)**
```json
[
  {
    "id": "ielts-1",
    "category": "Personal Experience",
    "prompt": "Describe a skill you learned outside of school or work that turned out to be surprisingly useful.",
    "bullets": [
      "What the skill is and how you learned it",
      "Why you decided to pick it up at the time",
      "How it has helped you in everyday situations"
    ],
    "similarFollowUp": "Describe a practical habit or hobby you developed recently that improved your daily routine."
  },
  {
    "id": "ielts-2",
    "category": "Travel & Culture",
    "prompt": "Describe a memorable journey you took that changed your perspective on travel.",
    "bullets": [
      "Where you went and who you traveled with",
      "What unexpected events happened during the trip",
      "How this experience influenced the way you view new places"
    ],
    "similarFollowUp": "Describe a local place or landmark in your city that you would recommend to a first-time visitor."
  }
]
```
```json

{
  "cefrLevel": "B2",
  "cefrLabel": "Upper Intermediate",
  "cefrSummary": "Clear, natural expression with strong ideas; reducing mid-sentence fillers and refining past-tense transitions will push you into C1.",
  "wpm": 136,
  "speechToPauseRatio": "84% Active Speech",
  "vocalEnergy": "Steady & Clear",
  "fillers": [
    { "word": "um", "count": 4 },
    { "word": "like", "count": 3 },
    { "word": "basically", "count": 2 }
  ],
  "fillerTip": "Pause silently for half a second instead of filling space with 'um' or 'basically' when transitioning between points.",
  "upgrades": [
    {
      "id": "upg-1",
      "original": "I was very much scared when I first started doing public speaking in front of everyone.",
      "upgraded": "I felt genuinely intimidated the first time I spoke in front of a large audience.",
      "reason": "Replaces repetitive phrasing ('very much scared') with natural, precise vocabulary."
    },
    {
      "id": "upg-2",
      "original": "So basically, that thing helped me to get more confidence in my daily life.",
      "upgraded": "Ultimately, that experience gave me lasting confidence in my day-to-day interactions.",
      "reason": "Eliminates the filler 'basically' and upgrades 'that thing' to a clearer noun."
    }
  ]
}
```

```json
{
  "scenarios": [
    {
      "id": "conv-1",
      "title": "Resolving a Mixed-Up Café Order",
      "context": "You ordered an iced oat latte and a toasted croissant, but the barista handed you a hot americano and a muffin during the morning rush.",
      "aiOpening": "Hi there! Here's your hot americano and blueberry muffin—have a great morning!"
    },
    {
      "id": "conv-2",
      "title": "Catching Up with a Former Colleague",
      "context": "You bump into a former teammate at a tech meetup and catch up on recent projects and weekend plans.",
      "aiOpening": "Hey! It has been ages since we last spoke. How have your projects been going lately?"
    }
  ],
  "mockTranscript": [
    {
      "sender": "ai",
      "text": "Hi there! Here's your hot americano and blueberry muffin—have a great morning!"
    },
    {
      "sender": "user",
      "text": "Oh excuse me, I think there is a small mistake because I actually asked for an iced oat latte.",
      "upgrade": {
        "id": "conv-upg-1",
        "original": "I think there is a small mistake because I actually asked for an iced oat latte.",
        "upgraded": "Excuse me, I believe there's been a mix-up—I originally ordered an iced oat latte."
      }
    }
  ]
}

```

```json
{
  "suggestedPrompts": [
    {
      "id": "pres-1",
      "audience": "Office / Client",
      "title": "2-Minute Executive Project Pitch",
      "prompt": "Present a new workflow automation tool to your team lead, highlighting the problem it solves, key features, and expected time savings."
    },
    {
      "id": "pres-2",
      "audience": "School / College",
      "title": "Final Year Capstone Architecture Overview",
      "prompt": "Explain the core design and real-world impact of your engineering or research project to an academic evaluation panel."
    }
  ],
  "mockReport": {
    "authorityScore": "88 / 100",
    "wpm": 124,
    "pauseDiscipline": "Strong — Effective 1.2s pauses between key points",
    "fillers": [
      { "word": "so", "count": 3 },
      { "word": "kind of", "count": 2 }
    ],
    "structureFeedback": "Your opening hook clearly stated the problem. To make your conclusion stronger, end with a decisive call-to-action rather than trailing off with 'so yeah, that's pretty much it.'",
    "upgrades": [
      {
        "id": "pres-upg-1",
        "original": "We made this system so that normal people don't get confused by hard legal words.",
        "upgraded": "We engineered this platform to demystify complex legal terminology for everyday users."
      }
    ]
  }
}