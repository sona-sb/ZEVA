import React from "react";
import { useState, useEffect } from "react";
import { go } from "../router";

/* ---------- Design tokens ("Burgundy Studio") ---------- */
export const B = "transition hover:scale-[1.02] active:scale-[0.98] ";
export const PRI = B + "bg-[#9F1239] hover:bg-[#BE123C] text-white font-semibold rounded-xl px-6 py-3 shadow-[0_0_25px_rgba(159,18,57,0.45)]";
export const SEC = B + "bg-[#231219]/80 border border-[#4A2230] text-[#F9FAFB] rounded-xl px-6 py-3";
export const GHOST = B + "text-[#D1D5DB] hover:text-white rounded-lg px-4 py-2 text-sm";
export const CARD = "bg-[#1A0D13]/80 backdrop-blur-xl border border-[#4A2230]/70 rounded-2xl p-6";
export const PILL = "inline-block bg-[#9F1239]/30 border border-[#9F1239]/60 text-[#FDA4AF] text-xs font-semibold rounded-full px-3 py-1";
export const MUTED = "text-[#9CA3AF]";

/* ---------- Brand ---------- */
export const Logo = ({ sub }) => (
  <button type="button" onClick={() => go("home")} className="flex items-center gap-2.5 text-left">
    <div className="w-9 h-9 rounded-xl bg-[#9F1239] flex items-center justify-center shadow-[0_0_18px_rgba(159,18,57,0.5)]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
        <path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4" />
      </svg>
    </div>
    <div className="leading-tight">
      <div className="font-extrabold tracking-wider">ZEVA</div>
      {sub && <div className={"text-[11px] " + MUTED}>The English Speaking Studio</div>}
    </div>
  </button>
);

/* ---------- Studio header (pages 3–6) ---------- */
export function StudioHeader({ title, bank, openBank, hub, user, logout }) {
  return (
    <header className="w-full flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 h-16">
      {hub ? (
        <Logo />
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <button className={GHOST} onClick={() => go("studio")}>← Back to Studio Modes</button>
          <span className={PILL}>{title}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        {hub && (
          <span className="text-sm bg-[#231219]/80 border border-[#4A2230] rounded-full px-3 py-1.5 flex items-center gap-2">
            {user ? user.name : "Guest Mode"}
            {user && <button className="text-[#FDA4AF] text-xs underline" onClick={logout}>Log Out</button>}
          </span>
        )}
        <button onClick={openBank} className={B + "border border-[#FDA4AF] text-[#FDA4AF] rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#FDA4AF]/10"}>
          Vocabulary Bank <span className="ml-1 bg-[#FDA4AF] text-[#4C0519] rounded-full px-2 py-0.5 text-xs">{bank.length}</span>
        </button>
      </div>
    </header>
  );
}

/* ---------- Vocabulary Bank drawer ---------- */
export function BankDrawer({ open, close, bank, remove }) {
  return (
    <div className={"fixed inset-0 z-[60] " + (open ? "" : "pointer-events-none")}>
      <div onClick={close} className={"absolute inset-0 bg-black/60 transition-opacity " + (open ? "opacity-100" : "opacity-0")} />
      <aside className={"absolute right-0 top-0 h-full w-full max-w-md bg-[#1A0D13]/95 backdrop-blur-xl border-l border-[#4A2230] p-6 overflow-y-auto transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Vocabulary Bank <span className="text-[#FDA4AF]">({bank.length})</span></h2>
          <button onClick={close} className={GHOST}>✕ Close</button>
        </div>
        {bank.length === 0 ? (
          <p className={MUTED + " text-center mt-16 leading-relaxed"}>
            Your Vocabulary Bank is empty. Bookmark upgraded phrases during your sessions to review them here.
          </p>
        ) : (
          <div className="space-y-3">
            {bank.map((b) => (
              <div key={b.id} className="bg-[#231219] border border-[#4A2230]/70 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={PILL}>{b.mode}</span>
                  <button title="Mark mastered / delete" onClick={() => remove(b.id)} className="text-[#FB7185] hover:scale-110 transition">🗑️</button>
                </div>
                <div className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">Original Spoken</div>
                <p className="text-sm text-[#D1D5DB] mb-2">{b.original}</p>
                <div className="text-[11px] uppercase tracking-wide text-[#FDA4AF]">Upgraded Alternative</div>
                <p className="text-sm font-medium">{b.upgraded}</p>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

/* ---------- Upgrade card (Original vs Upgraded + Save to Bank) ---------- */
export function Upgrade({ u, mode, bank, toggle, compact }) {
  const saved = bank.some((b) => b.id === u.id || (b.original === u.original && b.upgraded === u.upgraded));
  return (
    <div className={compact ? "mt-2 bg-[#231219]/80 border border-dashed border-[#9F1239]/60 rounded-xl p-3 text-sm" : "bg-[#231219]/80 border border-[#4A2230]/70 rounded-xl p-4"}>
      <div className="flex justify-between items-start gap-3">
        <div className="text-[11px] uppercase tracking-wide text-[#FDA4AF] font-semibold">{compact ? "Better Way to Say That" : "Upgrade"}</div>
        <button
          onClick={() => toggle({ id: u.id, original: u.original, upgraded: u.upgraded, explanation: u.explanation || u.reason || "", source_studio: mode, mode })}
          className={B + "text-xs rounded-lg px-2.5 py-1 border " + (saved ? "bg-[#FDA4AF] text-[#4C0519] border-[#FDA4AF]" : "border-[#FDA4AF]/60 text-[#FDA4AF]")}
        >
          {saved ? "🔖 Saved" : compact ? "🔖 Save to Bank" : "🔖 Save to Vocabulary Bank"}
        </button>
      </div>
      <div className={compact ? "mt-1" : "grid sm:grid-cols-2 gap-3 mt-3"}>
        <div>
          <div className="text-[11px] text-[#9CA3AF]">Original</div>
          <p className="text-[#9CA3AF] line-through decoration-[#9F1239]/70">{u.original}</p>
        </div>
        <div className={compact ? "mt-1" : ""}>
          <div className="text-[11px] text-[#FDA4AF]">Upgraded</div>
          <p className="font-medium">{u.upgraded}</p>
        </div>
      </div>
      {u.reason && <p className={"text-xs mt-3 " + MUTED}>💡 {u.reason}</p>}
    </div>
  );
}

/* ---------- Small display pieces ---------- */
export const Wave = ({ levels }) => (
  <div className="flex items-center justify-center gap-1 h-16">
    {Array.from({ length: 30 }, (_, i) => (
      <span key={i} className="bar" style={{ animationDelay: (i % 10) * 0.09 + "s", height: (levels && levels[i]) || 24 + ((i * 17) % 34) + "px" }} />
    ))}
  </div>
);

export const Metric = ({ label, value, sub, children }) => (
  <div className={CARD + " !p-4 text-center flex flex-col items-center justify-center"}>
    <div className="text-[11px] uppercase tracking-wide text-[#9CA3AF] mb-2">{label}</div>
    {children || <div className="text-2xl font-extrabold text-[#FDA4AF]">{value}</div>}
    {sub && <div className="text-xs text-[#D1D5DB] mt-1">{sub}</div>}
  </div>
);

export const Fillers = ({ list }) => (
  <div className="flex flex-wrap gap-2">
    {list.map((f) => (
      <span key={f.w} className="bg-[#9F1239]/25 border border-[#9F1239]/60 text-[#FDA4AF] rounded-full px-3 py-1 text-sm cursor-default hover:bg-[#9F1239]/50 transition">
        “{f.w}” × {f.c}
      </span>
    ))}
  </div>
);

/* ---------- Recorder: idle → recording → review → analyzing ----------
   No countdown clock is shown. In Phase 2, enforce a silent 5-minute cap
   inside the "rec" state (e.g. setTimeout → stop MediaRecorder). */
export function Recorder({ start, send, onSend, onStartRecording, onStopRecording, waveform, error, recordingActive, recordedBlob, className = "" }) {
  const [s, setS] = useState("idle");
  const [pl, setPl] = useState(false);
  const [pr, setPr] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  useEffect(() => {
    if (onStopRecording && recordingActive === false && recordedBlob && s === "rec") {
      setAudioBlob(recordedBlob);
      setS("review");
    }
  }, [onStopRecording, recordingActive, recordedBlob, s]);

  useEffect(() => {
    if (!pl) return;
    const t = setInterval(() => setPr((p) => { if (p >= 100) { setPl(false); return 0; } return p + 4; }), 200);
    return () => clearInterval(t);
  }, [pl]);

  const reset = () => { setS("idle"); setPl(false); setPr(0); setAudioBlob(null); };
  const submit = () => {
    setS("loading");
    if (onStartRecording || onStopRecording) {
      Promise.resolve(onSend(audioBlob)).catch((submitError) => {
        setS("review");
        if (error === undefined) console.error(submitError);
      });
      return;
    }
    setTimeout(onSend, 1900);
  };
  const begin = () => {
    setAudioBlob(null);
    setS("rec");
    if (onStartRecording) {
      Promise.resolve(onStartRecording()).catch(() => setS("idle"));
    }
  };
  const stop = () => {
    setS("review");
    if (onStopRecording) {
      Promise.resolve(onStopRecording()).then(setAudioBlob).catch(() => setS("idle"));
    }
  };

  return (
    <div className={CARD + " text-center " + className}>
      {s === "idle" && (
        <div className="py-4">
          <button onClick={begin} className={PRI + " text-lg px-10 py-4"}>🎙️ {start}</button>
          <p className={"text-sm mt-4 " + MUTED}>Limit: 5 minutes max</p>
          {error && <p className={"text-xs mt-3 " + MUTED}>{error}</p>}
        </div>
      )}
      {s === "rec" && (
        <div className="py-2">
          <Wave levels={waveform} />
          <div className="flex items-center justify-center gap-2 text-[#FB7185] font-semibold my-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />Recording Live...
          </div>
          <button onClick={stop} className={SEC + " border-[#9F1239]"}>⏹ Stop Recording</button>
          {error && <p className={"text-xs mt-3 " + MUTED}>{error}</p>}
        </div>
      )}
      {s === "review" && (
        <div className="py-2">
          <div className="flex items-center gap-4 bg-[#231219] rounded-xl p-3 mb-4">
            <button onClick={() => setPl(!pl)} className={B + "w-10 h-10 rounded-full bg-[#9F1239] text-white shrink-0"}>{pl ? "❚❚" : "▶"}</button>
            <div className="flex-1 h-2 rounded-full bg-[#4A2230]/70 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#9F1239] to-[#FDA4AF] transition-all" style={{ width: pr + "%" }} />
            </div>
            <span className="text-xs text-[#9CA3AF]">Your take</span>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={reset} className={SEC}>🗑️ Discard</button>
            <button onClick={submit} className={PRI}>🚀 {send}</button>
          </div>
          {error && <p className={"text-xs mt-3 " + MUTED}>{error}</p>}
        </div>
      )}
      {s === "loading" && (
        <div className="py-8">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#4A2230] border-t-[#FB7185] animate-spin" />
          <p className="mt-4 text-[#FDA4AF]">Analyzing your speech…</p>
          {error && <p className={"text-xs mt-3 " + MUTED}>{error}</p>}
        </div>
      )}
    </div>
  );
}
