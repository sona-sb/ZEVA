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

export async function saveSessionProgress(userId, sessionData) {
  assertClient();
  const { data, error } = await supabase
    .from("session_history")
    .insert({
      user_id: userId,
      mode: sessionData.mode,
      topic: sessionData.topic,
      cefr: sessionData.cefr || null,
      score: sessionData.score || null,
      wpm: sessionData.wpm || 0,
      filler_count: sessionData.fillerCount || 0,
    })
    .select()
    .single();
  assertNoError(error, "Saving session progress");
  return data;
}

export async function fetchUserProgress(userId) {
  assertClient();
  const { data, error } = await supabase
    .from("session_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  assertNoError(error, "Loading session progress");
  return data || [];
}
