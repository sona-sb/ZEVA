// Phase 1 mock data (from PROJECT_SPEC.md). Replace with Groq responses in Phase 2.

export const TOPICS = [
  {
    category: "Personal Experience",
    prompt: "Describe a skill you learned outside of school or work that turned out to be surprisingly useful.",
    bullets: [
      "What the skill is and how you learned it",
      "Why you decided to pick it up at the time",
      "How it has helped you in everyday situations",
    ],
    similar: "Describe a practical habit or hobby you developed recently that improved your daily routine.",
  },
  {
    category: "Travel & Culture",
    prompt: "Describe a memorable journey you took that changed your perspective on travel.",
    bullets: [
      "Where you went and who you traveled with",
      "What unexpected events happened during the trip",
      "How this experience influenced the way you view new places",
    ],
    similar: "Describe a local place or landmark in your city that you would recommend to a first-time visitor.",
  },
];

export const REPORT = {
  cefr: "B2",
  label: "Upper Intermediate",
  summary:
    "Clear, natural expression with strong ideas; reducing mid-sentence fillers and refining past-tense transitions will push you into C1.",
  wpm: 136,
  ratio: "84%",
  energy: "Steady & Clear",
  fillers: [
    { w: "um", c: 4 },
    { w: "like", c: 3 },
    { w: "basically", c: 2 },
  ],
  tip: "Pause silently for half a second instead of filling space with ‘um’ or ‘basically’ when transitioning between points.",
  up: [
    {
      id: "upg-1",
      original: "I was very much scared when I first started doing public speaking in front of everyone.",
      upgraded: "I felt genuinely intimidated the first time I spoke in front of a large audience.",
      reason: "Replaces repetitive phrasing (‘very much scared’) with natural, precise vocabulary.",
    },
    {
      id: "upg-2",
      original: "So basically, that thing helped me to get more confidence in my daily life.",
      upgraded: "Ultimately, that experience gave me lasting confidence in my day-to-day interactions.",
      reason: "Eliminates the filler ‘basically’ and upgrades ‘that thing’ to a clearer noun.",
    },
  ],
};

export const SCEN = [
  {
    title: "Resolving a Mixed-Up Café Order",
    context:
      "You ordered an iced oat latte and a toasted croissant, but the barista handed you a hot americano and a muffin during the morning rush.",
    open: "Hi there! Here’s your hot americano and blueberry muffin—have a great morning!",
  },
  {
    title: "Catching Up with a Former Colleague",
    context: "You bump into a former teammate at a tech meetup and catch up on recent projects and weekend plans.",
    open: "Hey! It has been ages since we last spoke. How have your projects been going lately?",
  },
];

// Builds a timed conversation script (ms offsets) for the simulated hands-free session.
const mk = (u1, o1, g1, a1, u2, o2, g2, a2, u3, a3) => [
  { t: 0, st: "AI Speaking..." },
  { t: 2500, st: "Listening to you..." },
  { t: 5000, m: { s: "user", text: u1, up: { id: "c1" + u1.length, original: o1, upgraded: g1 } }, st: "Thinking...", wpm: 128 },
  { t: 7000, m: { s: "ai", text: a1 }, st: "AI Speaking..." },
  { t: 9500, st: "Listening to you..." },
  { t: 12000, m: { s: "user", text: u2, up: { id: "c2" + u2.length, original: o2, upgraded: g2 } }, st: "Thinking...", f: 3, wpm: 141 },
  { t: 14000, m: { s: "ai", text: a2 }, st: "AI Speaking..." },
  { t: 16500, m: { s: "user", text: u3 }, st: "Thinking...", wpm: 132 },
  { t: 18500, m: { s: "ai", text: a3 }, st: "AI Speaking..." },
  { t: 21000, done: 1 },
];

export const SCRIPTS = [
  mk(
    "Oh excuse me, I think there is a small mistake because I actually asked for an iced oat latte.",
    "I think there is a small mistake because I actually asked for an iced oat latte.",
    "Excuse me, I believe there’s been a mix-up—I originally ordered an iced oat latte.",
    "Oh no, I’m so sorry about that! Would you like me to remake it with oat milk?",
    "Um, yes please, so basically I need it iced, like, as soon as possible.",
    "Um, yes please, so basically I need it iced, like, as soon as possible.",
    "Yes, please—iced, and if you could make it quickly, I’d really appreciate it.",
    "Of course—I’ll remake it right away. Anything else before I wrap this up?",
    "No, that is all. Thank you for your help!",
    "My pleasure! Enjoy your latte—have a lovely day!"
  ),
  mk(
    "Hi! Yeah, it’s been a long time. My project goes very good, we launched last week.",
    "My project goes very good, we launched last week.",
    "My project is going really well—we launched last week.",
    "That’s fantastic, congratulations! What was the biggest challenge along the way?",
    "Um, I think, like, the deadline was basically the hardest thing for us.",
    "Um, I think, like, the deadline was basically the hardest thing for us.",
    "Honestly, the tight deadline was the hardest part for our team.",
    "Totally understandable. Anyway, I should let you mingle—let’s grab coffee soon!",
    "Sure, that sounds great. Let’s keep in touch!",
    "Definitely! Great seeing you—take care!"
  ),
];

export const PROMPTS = [
  {
    aud: "Office / Client",
    title: "2-Minute Executive Project Pitch",
    prompt:
      "Present a new workflow automation tool to your team lead, highlighting the problem it solves, key features, and expected time savings.",
  },
  {
    aud: "School / College",
    title: "Final Year Capstone Architecture Overview",
    prompt:
      "Explain the core design and real-world impact of your engineering or research project to an academic evaluation panel.",
  },
];

export const PREP = {
  score: "88",
  wpm: 124,
  pause: "Strong — Effective 1.2s pauses between key points",
  fillers: [
    { w: "so", c: 3 },
    { w: "kind of", c: 2 },
  ],
  flow: [
    ["Opening hook", "Your opening hook clearly stated the problem."],
    ["Transitions", "Transitions between key points were smooth, supported by deliberate 1.2s pauses."],
    ["Conclusion", "To make your conclusion stronger, end with a decisive call-to-action rather than trailing off with ‘so yeah, that’s pretty much it.’"],
  ],
  up: [
    {
      id: "pres-upg-1",
      original: "We made this system so that normal people don’t get confused by hard legal words.",
      upgraded: "We engineered this platform to demystify complex legal terminology for everyday users.",
    },
  ],
};
