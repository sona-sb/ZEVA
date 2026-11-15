import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function assertNoError(error, operation) {
  if (error) throw new Error(operation + " failed: " + error.message);
}

function assertClient() {
  if (!supabase) throw new Error("Supabase is not configured; continuing in guest mode.");
}

function mapVocabRow(row) {
  return {
    ...row,
    upgraded: row.improved || row.upgraded || "",
    mode: row.source_studio || row.mode || "Studio",
    remoteId: row.id,
  };
}

function mapSessionRow(row) {
  return {
    ...row,
    mode: row.studio_mode || row.studio_type || row.mode || "Studio",
    cefr: row.cefr_level || row.cefr || null,
  };
}

function getGuestSessions() {
  try {
    return JSON.parse(localStorage.getItem("zeva_session_history") || "[]");
  } catch (error) {
    console.error("Guest session history load error:", error);
    return [];
  }
}

export async function signUpUser(email, password, fullName) {
  assertClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  assertNoError(error, "Sign up");
  return data;
}

export async function signInUser(email, password) {
  assertClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  assertNoError(error, "Sign in");
  return data;
}

export async function signOutUser() {
  assertClient();
  const { error } = await supabase.auth.signOut();
  assertNoError(error, "Sign out");
}

export async function fetchUserVocab(userId) {
  if (!supabase) {
    try {
      return JSON.parse(localStorage.getItem("zeva_vocab_bank") || "[]");
    } catch (error) {
      console.error("Guest vocab load error:", error);
      return [];
    }
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) console.error("Supabase vocab auth lookup error:", authError);
  if (!user) {
    try {
      return JSON.parse(localStorage.getItem("zeva_vocab_bank") || "[]");
    } catch (error) {
      console.error("Guest vocab load error:", error);
      return [];
    }
  }
  const { data, error } = await supabase
    .from("vocabulary_bank")
    .select("*")
    .eq("user_id", user.id || userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase vocab load error:", error);
    return [];
  }
  return (data || []).map(mapVocabRow);
}

export async function addVocabItem(item) {
  if (!supabase) {
    try {
      const saved = JSON.parse(localStorage.getItem("zeva_vocab_bank") || "[]");
      const duplicate = saved.find((entry) => entry.original === item.original && entry.upgraded === (item.improved || item.upgraded));
      if (duplicate) return { data: duplicate, error: null };
      const entry = {
        id: item.id,
        original: item.original,
        upgraded: item.improved || item.upgraded || "",
        explanation: item.explanation || item.tip || item.reason || "",
        mode: item.source_studio || item.mode || "Studio",
      };
      localStorage.setItem("zeva_vocab_bank", JSON.stringify([entry, ...saved]));
      return { data: entry, error: null };
    } catch (error) {
      console.error("Guest vocab save error:", error);
      return { data: null, error };
    }
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) console.error("Supabase vocab auth lookup error:", authError);
  if (!user) return addVocabItemWithoutAuth(item);
  const improved = item.improved || item.upgraded || "";
  const { data: duplicate, error: duplicateError } = await supabase
    .from("vocabulary_bank")
    .select("*")
    .eq("user_id", user.id)
    .eq("original", item.original)
    .eq("improved", improved)
    .maybeSingle();
  if (duplicateError) {
    console.error("Supabase vocab duplicate check error:", duplicateError);
    return { data: null, error: duplicateError };
  }
  if (duplicate) return { data: mapVocabRow(duplicate), error: null };
  const { data, error } = await supabase
    .from("vocabulary_bank")
    .insert({
      user_id: user.id,
      original: item.original,
      improved,
      explanation: item.explanation || item.tip || item.reason || "",
      source_studio: item.source_studio || item.mode || "Studio",
    })
    .select()
    .single();
  if (error) {
    console.error("Supabase vocab save error:", error);
    return { data: null, error };
  }
  return { data: mapVocabRow(data), error: null };
}

export async function deleteVocabItem(id) {
  if (!supabase) {
    try {
      const saved = JSON.parse(localStorage.getItem("zeva_vocab_bank") || "[]");
      localStorage.setItem("zeva_vocab_bank", JSON.stringify(saved.filter((item) => item.id !== id)));
    } catch (error) { console.error("Guest vocab delete error:", error); }
    return;
  }
  const { error } = await supabase.from("vocabulary_bank").delete().eq("id", id);
  if (error) console.error("Supabase vocab delete error:", error);
}

async function addVocabItemWithoutAuth(item) {
  try {
    const saved = JSON.parse(localStorage.getItem("zeva_vocab_bank") || "[]");
    const entry = {
      id: item.id,
      original: item.original,
      upgraded: item.improved || item.upgraded || "",
      explanation: item.explanation || item.tip || item.reason || "",
      mode: item.source_studio || item.mode || "Studio",
    };
    if (saved.some((value) => value.original === entry.original && value.upgraded === entry.upgraded)) {
      return { data: saved.find((value) => value.original === entry.original && value.upgraded === entry.upgraded), error: null };
    }
    localStorage.setItem("zeva_vocab_bank", JSON.stringify([entry, ...saved]));
    return { data: entry, error: null };
  } catch (error) {
    console.error("Guest vocab save error:", error);
    return { data: null, error };
  }
}

export async function saveSessionProgress(sessionData) {
  const sessionRow = {
    studio_mode: sessionData.studio_mode || sessionData.mode,
    topic: sessionData.topic,
    cefr_level: sessionData.cefr_level || sessionData.cefr || null,
    score: Math.round(Number(sessionData.score)) || 0,
    wpm: Math.round(Number(sessionData.wpm)) || 0,
    filler_count: Math.round(Number(sessionData.filler_count ?? sessionData.fillerCount)) || 0,
  };
  if (!supabase) {
    const saved = { ...sessionRow, id: "guest-" + Date.now(), created_at: new Date().toISOString() };
    const sessions = getGuestSessions();
    localStorage.setItem("zeva_session_history", JSON.stringify([...sessions, saved]));
    console.log("Guest session_history save:", { transcriptLength: sessionData.transcriptLength, row: saved });
    return saved;
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) console.error("Supabase session auth lookup error:", authError);
  if (!user) {
    const saved = { ...sessionRow, id: "guest-" + Date.now(), created_at: new Date().toISOString() };
    const sessions = getGuestSessions();
    localStorage.setItem("zeva_session_history", JSON.stringify([...sessions, saved]));
    console.log("Guest session_history save (no authenticated user):", { transcriptLength: sessionData.transcriptLength, row: saved });
    return saved;
  }
  console.log("Supabase session_history insert:", { userId: user.id, transcriptLength: sessionData.transcriptLength, row: sessionRow });
  const { data, error } = await supabase
    .from("session_history")
    .insert({
      user_id: user.id,
      ...sessionRow,
    })
    .select()
    .single();
  if (error) {
    console.error("Supabase session_history insert error:", error);
    return { error };
  }
  console.log("Supabase session_history insert succeeded:", data);
  return data;
}

export async function fetchUserProgress(userId) {
  if (!supabase) return getGuestSessions().map(mapSessionRow);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) console.error("Supabase session auth lookup error:", authError);
  if (!user) return getGuestSessions().map(mapSessionRow);
  const { data, error } = await supabase
    .from("session_history")
    .select("*")
    .eq("user_id", user.id || userId)
    .order("created_at", { ascending: true });
  assertNoError(error, "Loading session progress");
  return (data || []).map(mapSessionRow);
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function calculateGrowthMetrics(sessions, vocabularyCount) {
  const validScores = sessions.map((item) => Number(item.score)).filter((value) => Number.isFinite(value));
  const wpmValues = sessions.map((item) => Number(item.wpm)).filter((value) => Number.isFinite(value) && value > 0);
  const halfway = Math.ceil(sessions.length / 2);
  const firstHalf = sessions.slice(0, halfway).map((item) => Number(item.filler_count)).filter(Number.isFinite);
  const recentHalf = sessions.slice(-halfway).map((item) => Number(item.filler_count)).filter(Number.isFinite);
  const firstFillers = average(firstHalf);
  const recentFillers = average(recentHalf);
  const averageFillers = average(sessions.map((item) => Number(item.filler_count)).filter(Number.isFinite));
  const fillerChange = firstFillers ? Math.round(((recentFillers - firstFillers) / firstFillers) * 100) : 0;
  const latest = [...sessions].reverse().find((item) => item.cefr_level || item.cefr);
  const currentCefr = latest?.cefr_level || latest?.cefr || "B1";
  const averageScore = average(validScores);
  const tierProgress = Math.max(0, Math.min(100, Math.round(averageScore || (currentCefr === "B1" ? 25 : 50))));

  return {
    currentCefr,
    progressPercent: tierProgress,
    totalSessions: sessions.length,
    avgWpm: Math.round(average(wpmValues)),
    fillerTrend: {
      change: Math.round(recentFillers - firstFillers),
      percentage: fillerChange,
      improved: recentFillers <= firstFillers,
      decreasing: recentFillers < firstFillers,
      average: averageFillers,
    },
    vocabularyCount,
  };
}

export async function fetchProfileAnalytics(userId) {
  if (!supabase) {
    let vocabularyCount = 0;
    try { vocabularyCount = JSON.parse(localStorage.getItem("zeva_vocab_bank") || "[]").length; } catch (error) { console.error("Guest vocab analytics error:", error); }
    const sessions = getGuestSessions().map(mapSessionRow);
    return { sessions, vocabularyCount, metrics: calculateGrowthMetrics(sessions, vocabularyCount) };
  }
  assertClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) console.error("Supabase profile auth lookup error:", authError);
  if (!user) {
    const sessions = getGuestSessions().map(mapSessionRow);
    return { sessions, vocabularyCount: 0, metrics: calculateGrowthMetrics(sessions, 0) };
  }
  const sessions = await fetchUserProgress(userId);
  const { count, error } = await supabase
    .from("vocabulary_bank")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id || userId);
  assertNoError(error, "Loading vocabulary count");
  return {
    sessions,
    vocabularyCount: count || 0,
    metrics: calculateGrowthMetrics(sessions, count || 0),
  };
}
