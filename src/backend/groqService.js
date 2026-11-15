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
  "up": [{"id": "upg-1", "original": "spoken sentence", "upgraded": "natural upgraded sentence", "reason": "brief explanation"}]
}`;

function analysisMessages(transcript, audioStats) {
  return [
    {
      role: "system",
      content:
        "You are ZEVA's English speaking diagnostic coach. Analyze the transcript and audio metrics. Return only valid JSON with exactly this scorecard shape (no markdown): " +
        REPORT_SCHEMA +
        " Use the transcript's actual filler words and provide concise, actionable grammar notes through the upgrade reasons.",
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
            : "Generate exactly three fresh English speaking practice topics. Return only JSON in the form {\"topics\":[{\"category\":\"...\",\"prompt\":\"...\",\"bullets\":[\"...\",\"...\",\"...\"] ,\"similar\":\"...\"}]} with no markdown.",
        },
        { role: "user", content: JSON.stringify({ mode }) },
      ],
    }),
  });
  const data = parseJsonContent(result, "Topic generation");
  const valid = mode === "conversation"
    ? (topic) => topic.title && topic.context && topic.open
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
        ' If the user has awkward phrasing, grammar mistakes, or repetitive fillers, set upgrade to {"original":"...","improved":"...","explanation":"..."}; otherwise use null. Do not interrupt the conversation with corrections.',
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