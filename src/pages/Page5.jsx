import React from "react";
import { useState, useEffect, useRef } from "react";
import { SCEN, SCRIPTS } from "../mockData";
import { B, PRI, SEC, CARD, PILL, MUTED, Metric, Upgrade } from "../components/shared";

// Page 5 — Live Adaptive Voice Conversation (/studio/conversation)
function VoiceOrb({ state }) {
  const listening = state === "Listening to you...";
  const thinking = state === "Thinking...";
  const stateClass = listening ? "voice-orb-listening" : thinking ? "voice-orb-thinking" : "voice-orb-speaking";

  return (
    <div className="relative flex items-center justify-center w-72 h-72 sm:w-96 sm:h-96" aria-label={state}>
      <div className={"voice-orb-ring absolute inset-5 rounded-full border border-[#FDA4AF]/30 " + stateClass} />
      <div className={"voice-orb-ring absolute inset-12 rounded-full border border-[#9F1239]/70 " + stateClass} />
      <div className={"voice-orb-core relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center " + stateClass}>
        <div className="absolute inset-3 rounded-full border border-[#FDA4AF]/30" />
        <div className="relative text-center px-6">
          <div className="flex items-center justify-center gap-1.5 h-10 mb-3">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="w-1.5 rounded-full bg-[#FDA4AF] voice-bar" style={{ animationDelay: i * 0.08 + "s" }} />
            ))}
          </div>
          <p className="font-semibold text-sm sm:text-base">{state}</p>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ":" + String(secs).padStart(2, "0");
}

export default function Page5({ bank, toggle }) {
  const [ph, setPh] = useState("setup"); // setup | live | summary
  const [si, setSi] = useState(0);
  const [msgs, setMsgs] = useState([]);
  const [st, setSt] = useState("AI Speaking...");
  const [wpm, setWpm] = useState(0);
  const [fl, setFl] = useState(0);
  const [duration, setDuration] = useState(0);
  const startedAt = useRef(0);
  const sc = SCEN[si];

  // Simulated hands-free session: plays the scripted timeline, then shows the wrap-up.
  // Phase 2: replace with continuous mic capture + Groq STT/LLM/TTS loop.
  useEffect(() => {
    if (ph !== "live") return;
    startedAt.current = Date.now();
    setMsgs([{ s: "ai", text: sc.open }]);
    setSt("AI Speaking...");
    setWpm(0);
    setFl(0);
    setDuration(0);
    const timers = SCRIPTS[si].map((e) =>
      setTimeout(() => {
        if (e.done) {
          setDuration(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
          setPh("summary");
          return;
        }
        if (e.st) setSt(e.st);
        if (e.m) setMsgs((m) => [...m, e.m]);
        if (e.wpm) setWpm(e.wpm);
        if (e.f) setFl(e.f);
      }, e.t + (e.t ? 800 : 0))
    );
    return () => timers.forEach(clearTimeout);
  }, [ph, si, sc.open]);

  const stopConversation = () => {
    setDuration(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
    setPh("summary");
  };

  const averageWpm = wpm || 134;

  /* Phase A — Setup */
  if (ph === "setup")
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 pb-16 flex flex-col gap-5 fi">
        <div className={CARD}>
          <div className="flex justify-between items-center mb-3">
            <span className={PILL}>Roleplay Scenario</span>
            <button onClick={() => setSi((si + 1) % SCEN.length)} className={B + "text-sm text-[#FDA4AF] border border-[#4A2230] rounded-lg px-3 py-1.5"}>⟳ Reload / New Topic</button>
          </div>
          <h2 className="text-xl font-bold">{sc.title}</h2>
          <p className={"mt-2 leading-relaxed " + MUTED}>{sc.context}</p>
        </div>
        <div className="text-center mt-auto mb-4">
          <button className={PRI + " text-lg px-10 py-4"} onClick={() => setPh("live")}>🎙️ Start Conversation</button>
          <p className={"text-xs mt-3 " + MUTED}>Hands-free: your mic stays on and the AI replies automatically. Ask it to repeat if you miss something.</p>
        </div>
      </div>
    );

  /* Phase C — Full transcript and wrap-up report */
  if (ph === "summary")
    return (
      <div className="w-full px-4 sm:px-6 pb-16 space-y-5 fi">
        <div className={CARD + " text-center"}>
          <span className={PILL}>Conversation Summary &amp; Report</span>
          <h2 className="text-2xl font-bold mt-3">Great conversation!</h2>
          <p className={"mt-1 " + MUTED}>{sc.title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <Metric label="Total Duration" value={formatDuration(duration)} />
            <Metric label="Average WPM" value={averageWpm} sub="Words per minute" />
            <Metric label="Filler Word Audit" value={fl} sub={fl === 0 ? "No fillers detected" : "Filler words detected"} />
          </div>
        </div>

        <section className={CARD}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <span className={PILL}>Transcript</span>
              <h3 className="text-xl font-bold mt-2">Full Conversation Transcript</h3>
            </div>
            <span className={"text-xs " + MUTED}>{msgs.length} turns</span>
          </div>
          <div className="space-y-5">
            {msgs.map((m, k) => (
              <div key={k} className="flex gap-3" style={{ animation: "fu .4s both" }}>
                <div className={"w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold " + (m.s === "user" ? "bg-[#9F1239] text-white" : "bg-[#FDA4AF]/20 text-[#FDA4AF]")}>
                  {m.s === "user" ? "You" : "AI"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-wide text-[#FDA4AF] mb-1">{m.s === "user" ? "Your turn" : "AI turn"}</div>
                  <p className="text-sm leading-relaxed text-[#F9FAFB]">{m.text}</p>
                  {m.up && <Upgrade u={m.up} mode="Live Conversation" bank={bank} toggle={toggle} />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-1">
          <button className={PRI} onClick={() => { setSi((si + 1) % SCEN.length); setPh("setup"); }}>Start Another Scenario</button>
        </div>
      </div>
    );

  /* Phase B — Active voice call: the orb is the only conversation focus. */
  const spike = fl >= 3;
  return (
    <div className="w-full px-4 sm:px-6 pb-10">
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
        <div className="text-center mb-2">
          <span className={PILL}>Live Voice Call</span>
          <h2 className="text-xl font-bold mt-3">{sc.title}</h2>
          <p className={"text-sm mt-1 " + MUTED}>Stay present. ZEVA is listening and responding hands-free.</p>
        </div>
        <VoiceOrb state={st} />
        <div className={"flex items-center justify-center gap-8 sm:gap-16 w-full max-w-xl border-y border-[#4A2230]/70 py-4 mt-2 " + (spike ? "text-amber-300" : "")}>
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">Live WPM</div>
            <div className="text-xl font-bold text-[#FDA4AF] mt-1">{wpm || "—"}</div>
          </div>
          <div className="h-8 w-px bg-[#4A2230]" />
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">Filler words</div>
            <div className="text-xl font-bold text-[#FDA4AF] mt-1">{fl}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-3">
        <button className={SEC + " border-[#9F1239]"} onClick={stopConversation}>⏹ Stop Conversation</button>
      </div>
      <p className={"text-xs text-center mt-3 " + MUTED}>Prototype note: the 60–120s pacing arc is compressed to ~20s so you can see the wind-down and wrap-up quickly.</p>
    </div>
  );
}
