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
    category: "Daily Errands",
    title: "Resolving a Mixed-Up Café Order",
    context:
      "You ordered an iced oat latte and a toasted croissant, but the barista handed you a hot americano and a muffin during the morning rush.",
    open: "Hi there! Here’s your hot americano and blueberry muffin—have a great morning!",
  },
  {
    category: "Friends & Family",
    title: "Catching Up with a Former Colleague",
    context: "You bump into a former teammate at a tech meetup and catch up on recent projects and weekend plans.",
    open: "Hey! It has been ages since we last spoke. How have your projects been going lately?",
  },
  {
    category: "Friends & Family",
    title: "Catching Up with a Close Friend",
    context:
      "You are a close friend who has not spoken with the learner in a few weeks. Ask warmly about their life, work or studies, and recent highlights.",
    open: "Hey, I’ve missed talking with you! What’s been happening in your world lately?",
  },
  {
    category: "Friends & Family",
    title: "Explaining a Career Choice",
    context:
      "You are the learner’s supportive but practical parent. Ask why they chose their current study or career path and gently explore their plans and concerns.",
    open: "I’m glad you told me about your plans. Can you help me understand what made you choose this career direction?",
  },
  {
    category: "Friends & Family",
    title: "Planning a Weekend Hangout",
    context:
      "You are an easygoing friend trying to make weekend plans. Suggest a couple of activities, compare schedules and preferences, and settle on a practical plan.",
    open: "Are you free this weekend? I was thinking we could do something fun together—what are you in the mood for?",
  },
  {
    category: "Friends & Family",
    title: "Venting About a Tough Day",
    context:
      "You are a patient, empathetic friend listening after the learner has had a difficult day. Encourage them to share what happened and respond with natural support, not a lecture.",
    open: "You sound like you’ve had a really rough day. Do you want to tell me what happened?",
  },
  {
    category: "Friends & Family",
    title: "Recommending a Favorite Movie",
    context:
      "You are a curious friend asking for a movie recommendation. Ask what the learner likes, react to their suggestion, and discuss why the film is worth watching.",
    open: "I’m looking for something good to watch tonight. What movie would you recommend, and what makes it one of your favorites?",
  },
  {
    category: "Daily Errands",
    title: "Returning a Defective Item",
    context:
      "You are a polite but busy store returns clerk. The learner is returning a defective item, so ask for the receipt and briefly explain the available refund or exchange options.",
    open: "Hi there. I can help with that return—could I see the item and your receipt, please?",
  },
  {
    category: "Daily Errands",
    title: "Asking a Pharmacist for Relief",
    context:
      "You are a careful community pharmacist. Ask about the learner’s cold or allergy symptoms, relevant medicines or health considerations, and suggest when they should see a doctor.",
    open: "Of course, I can help you look at some options. What symptoms are bothering you, and how long have you had them?",
  },
  {
    category: "Daily Errands",
    title: "Requesting a Landlord Repair",
    context:
      "You are a responsive but detail-oriented landlord. The learner is reporting a repair needed in their home, so ask when it started, how serious it is, and arrange a visit.",
    open: "Thanks for letting me know. What exactly is broken, and when did you first notice the problem?",
  },
  {
    category: "Daily Errands",
    title: "Customizing a Café Order",
    context:
      "You are a friendly café barista taking a detailed order during a normal morning shift. Confirm the learner’s drink size, milk, sweetness, temperature, and any food choice.",
    open: "Good morning! What can I get started for you today, and would you like to customize your drink?",
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
