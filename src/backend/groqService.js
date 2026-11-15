const API_BASE = "https://api.groq.com/openai/v1";
const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";
const PRIMARY_ANALYSIS_MODEL = "openai/gpt-oss-120b";
const FALLBACK_ANALYSIS_MODEL = "openai/gpt-oss-20b";

function getApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("Missing VITE_GROQ_API_KEY. Add it to your local .env file.");
  return key;
}

async function groqRequest(path, options) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      Authorization: "Bearer " + getApiKey(),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error("Groq request failed (" + response.status + "): " + body.slice(0, 300));
  }
  return response.json();
}

function parseJsonContent(result, operation) {
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error(operation + " returned no JSON content.");
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(operation + " returned invalid JSON: " + error.message);
  }
}

function validateReport(report) {
  const required = ["cefr", "label", "summary", "wpm", "ratio", "energy", "fillers", "tip", "up"];
  if (!report || required.some((key) => !(key in report))) {
    throw new Error("Fluency analysis did not match the expected diagnostic scorecard schema.");
  }
  if (!Array.isArray(report.fillers) || !Array.isArray(report.up)) {
    throw new Error("Fluency analysis returned invalid filler or upgrade data.");
  }
  return report;
}

export async function transcribeAudio(audioBlob) {
  if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
    throw new Error("No recorded audio was available for transcription.");
  }
  const form = new FormData();
  form.append("file", audioBlob, "zeva-speaking-practice.webm");
  form.append("model", TRANSCRIPTION_MODEL);
  form.append("response_format", "verbose_json");
  form.append("prompt", "Umm, uh, like, you know, basically, actually, literally.");

  return groqRequest("/audio/transcriptions", { method: "POST", body: form });
}

export function calculateWpm(transcript, durationMs) {
  if (!transcript || typeof transcript !== "string") throw new Error("A transcript is required to calculate WPM.");
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(durationMs / 60000, 1 / 60);
  return Math.round(words / minutes);
}

const REPORT_SCHEMA = `{
  "cefr": "B2",
  "label": "Upper Intermediate",
  "summary": "one concise overall diagnostic summary",
  "wpm": 136,
  "ratio": "84%",
  "energy": "Steady & Clear",
  "fillers": [{"w": "um", "c": 4}],
  "tip": "one practical improvement tip",
  "up": [{"id": "upg-1", "original": "spoken sentence", "upgraded": "natural upgraded sentence", "reason": "brief explanation", "keyVocabulary": [{"word": "exact word as it appears in the improved sentence", "definition": "concise, plain-English meaning in this sentence's context (max 15 words)", "level": "B2 or C1"}]}]
}`;

function analysisMessages(transcript, audioStats) {
  return [
    {
      role: "system",
      content:
        "You are ZEVA's English speaking diagnostic coach. Analyze the transcript and audio metrics. Return only valid JSON with exactly this scorecard shape (no markdown): " +
        REPORT_SCHEMA +
        " Use the transcript's actual filler words and provide concise, actionable grammar notes through the upgrade reasons. For each upgrade, include keyVocabulary with 1–3 impactful advanced or idiomatic words from the improved sentence that a learner may want clarified, using B2 or C1 levels and definitions of no more than 15 words; return an empty array when the sentence uses only basic words.",
    },
    {
      role: "user",
      content: JSON.stringify({ transcript, audioStats }),
    },
  ];
}

export async function analyzeFluency(transcript, audioStats = {}) {
  if (!transcript || typeof transcript !== "string") throw new Error("A transcript is required for fluency analysis.");
  const body = (model) => ({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: analysisMessages(transcript, audioStats),
  });
  let result;
  try {
    result = await groqRequest("/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body(PRIMARY_ANALYSIS_MODEL)),
    });
  } catch (primaryError) {
    try {
      result = await groqRequest("/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body(FALLBACK_ANALYSIS_MODEL)),
      });
    } catch (fallbackError) {
      throw new Error("Fluency analysis failed with both Groq models. " + fallbackError.message);
    }
  }
  return validateReport(parseJsonContent(result, "Fluency analysis"));
}

export async function generateNewTopics(mode) {
  const result = await groqRequest("/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: FALLBACK_ANALYSIS_MODEL,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: mode === "conversation"
            ? "Generate exactly three fresh roleplay conversation scenarios. Return only JSON in the form {\"topics\":[{\"title\":\"...\",\"context\":\"...\",\"open\":\"...\"}]} with no markdown. Each opening must be a natural AI greeting in character."
            : mode === "presentation"
              ? "Generate exactly three fresh presentation prompts. Return only JSON in the form {\"topics\":[{\"aud\":\"School / College or Office / Client\",\"title\":\"...\",\"prompt\":\"...\"}]} with no markdown. Calibrate each prompt to its audience."
              : "Generate exactly three fresh English speaking practice topics. Return only JSON in the form {\"topics\":[{\"category\":\"...\",\"prompt\":\"...\",\"bullets\":[\"...\",\"...\",\"...\"] ,\"similar\":\"...\"}]} with no markdown.",
        },
        { role: "user", content: JSON.stringify({ mode }) },
      ],
    }),
  });
  const data = parseJsonContent(result, "Topic generation");
  const valid = mode === "conversation"
    ? (topic) => topic.title && topic.context && topic.open
    : mode === "presentation"
      ? (topic) => topic.aud && topic.title && topic.prompt
      : (topic) => topic.category && topic.prompt && Array.isArray(topic.bullets);
  if (!Array.isArray(data.topics) || data.topics.length === 0 || data.topics.some((topic) => !valid(topic))) {
    throw new Error("Topic generation returned an invalid topic list.");
  }
  return data.topics;
}

const CONVERSATION_SCHEMA = `{
  "aiReply": "one to three natural sentences in character, ending with a thoughtful follow-up question",
  "upgrade": null
}`;

function conversationMessages(userTranscript, conversationHistory, scenario) {
  return [
    {
      role: "system",
      content:
        "You are ZEVA's roleplay conversation partner. Stay in character for the scenario, respond naturally in one to three sentences, and ask a thoughtful follow-up question. Return only valid JSON with this exact shape: " +
        CONVERSATION_SCHEMA +
        ' If the user has awkward phrasing, grammar mistakes, or repetitive fillers, set upgrade to {"original":"...","improved":"...","explanation":"...","keyVocabulary":[{"word":"exact word as it appears in the improved sentence","definition":"concise, plain-English meaning in this sentence\'s context (max 15 words)","level":"B2 or C1"}]}; otherwise use null. Pick 1–3 impactful advanced or idiomatic words from the improved sentence, or return [] if it only uses basic words. Do not interrupt the conversation with corrections.',
    },
    {
      role: "user",
      content: JSON.stringify({ scenario, conversationHistory, userTranscript }),
    },
  ];
}

function validateConversationTurn(turn) {
  if (!turn || typeof turn.aiReply !== "string" || !turn.aiReply.trim()) {
    throw new Error("Conversation AI returned no reply.");
  }
  if (turn.upgrade !== null && (!turn.upgrade || typeof turn.upgrade.original !== "string" || typeof turn.upgrade.improved !== "string" || typeof turn.upgrade.explanation !== "string")) {
    throw new Error("Conversation AI returned an invalid upgrade.");
  }
  return turn;
}

export async function generateConversationTurn(userTranscript, conversationHistory, scenario) {
  if (!userTranscript || typeof userTranscript !== "string") throw new Error("A user transcript is required.");
  const body = (model) => ({
    model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: conversationMessages(userTranscript, conversationHistory, scenario),
  });
  let result;
  try {
    result = await groqRequest("/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body(PRIMARY_ANALYSIS_MODEL)),
    });
  } catch (primaryError) {
    try {
      result = await groqRequest("/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body(FALLBACK_ANALYSIS_MODEL)),
      });
    } catch (fallbackError) {
      throw new Error("Conversation AI failed with both Groq models. " + fallbackError.message);
    }
  }
  return validateConversationTurn(parseJsonContent(result, "Conversation AI"));
}

const PRESENTATION_SCHEMA = `{
  "score": "88",
  "wpm": 124,
  "pause": "Strong — Effective pauses between key points",
  "fillers": [{"w": "so", "c": 3}],
  "flow": [
    ["Opening hook", "Feedback on the opening hook calibrated to the audience"],
    ["Transitions", "Feedback on transitions and body flow"],
    ["Conclusion", "Feedback on closing impact"]
  ],
  "up": [{"id": "pres-upg-1", "original": "spoken phrase", "upgraded": "audience-appropriate executive phrase", "reason": "brief explanation", "keyVocabulary": [{"word": "exact word as it appears in the improved sentence", "definition": "concise, plain-English meaning in this sentence's context (max 15 words)", "level": "B2 or C1"}]}]
}`;

function presentationMessages(transcript, audioStats, context) {
  return [
    {
      role: "system",
      content:
        "You are ZEVA's presentation delivery evaluator. Evaluate an uninterrupted spoken presentation for authority, confidence, pacing, cadence, structure, fillers, and audience-appropriate phrasing. Calibrate feedback to the topic, mode, and target audience. Return only valid JSON with exactly this schema and no markdown: " +
        PRESENTATION_SCHEMA +
        " Use score as a string number from 0 to 100. Keep flow as exactly three [heading, feedback] pairs named Opening hook, Transitions, and Conclusion. Use actual transcript filler words and provide concise upgrade reasons. For each upgrade, include keyVocabulary with 1–3 impactful advanced or idiomatic words from the improved sentence that a learner may want clarified, using B2 or C1 levels and definitions of no more than 15 words; return an empty array when the sentence uses only basic words.",
    },
    {
      role: "user",
      content: JSON.stringify({ transcript, audioStats, context }),
    },
  ];
}

function validatePresentation(report) {
  if (!report || typeof report.score !== "string" || typeof report.wpm !== "number" || typeof report.pause !== "string" || !Array.isArray(report.fillers) || !Array.isArray(report.flow) || !Array.isArray(report.up)) {
    throw new Error("Presentation analysis did not match the expected delivery report schema.");
  }
  if (report.flow.length !== 3 || report.flow.some((item) => !Array.isArray(item) || item.length !== 2)) {
    throw new Error("Presentation analysis returned an invalid structure breakdown.");
  }
  return report;
}

export async function analyzePresentation(transcript, audioStats = {}, context = {}) {
  if (!transcript || typeof transcript !== "string") throw new Error("A presentation transcript is required.");
  const body = (model) => ({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: presentationMessages(transcript, audioStats, context),
  });
  let result;
  try {
    result = await groqRequest("/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body(PRIMARY_ANALYSIS_MODEL)),
    });
  } catch (primaryError) {
    try {
      result = await groqRequest("/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body(FALLBACK_ANALYSIS_MODEL)),
      });
    } catch (fallbackError) {
      throw new Error("Presentation analysis failed with both Groq models. " + fallbackError.message);
    }
  }
  return validatePresentation(parseJsonContent(result, "Presentation analysis"));
}