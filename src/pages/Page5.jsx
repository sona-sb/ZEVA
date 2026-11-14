import React from "react";
import { useState, useEffect, useRef } from "react";
import { SCEN, SCRIPTS } from "../mockData";
import { B, PRI, SEC, CARD, PILL, MUTED, Metric, Upgrade } from "../components/shared";

// Page 5 — Live Adaptive Voice Conversation (/studio/conversation)
export default function Page5({ bank, toggle }) {
  const [ph, setPh] = useState("setup"); // setup | live | summary
  const [si, setSi] = useState(0);
  const [msgs, setMsgs] = useState([]);
  const [st, setSt] = useState("AI Speaking...");
  const [wpm, setWpm] = useState(0);
  const [fl, setFl] = useState(0);
  const end = useRef(null);
  const sc = SCEN[si];

  // Simulated hands-free session: plays the scripted timeline, then shows the wrap-up.
  // Phase 2: replace with continuous mic capture + Groq STT/LLM/TTS loop.
  useEffect(() => {
    if (ph !== "live") return;
    setMsgs([{ s: "ai", text: sc.open }]);
    setSt("AI Speaking...");
    setWpm(0);
    setFl(0);
    const timers = SCRIPTS[si].map((e) =>
      setTimeout(() => {
        if (e.done) { setPh("summary"); return; }
        if (e.st) setSt(e.st);
        if (e.m) setMsgs((m) => [...m, e.m]);
        if (e.wpm) setWpm(e.wpm);
        if (e.f) setFl(e.f);
      }, e.t + (e.t ? 800 : 0))
    );
    return () => timers.forEach(clearTimeout);
  }, [ph]);

  useEffect(() => {
    if (end.current) end.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs]);

  const ups = msgs.filter((m) => m.up).map((m) => m.up);

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

  /* Wrap-up summary */
  if (ph === "summary")
    return (
      <div className="w-full px-4 sm:px-6 pb-16 space-y-4 fi">
        <div className={CARD + " text-center"}>
          <span className={PILL}>Wrap-Up Summary</span>
          <h2 className="text-2xl font-bold mt-3">Great conversation!</h2>
          <p className={"mt-1 " + MUTED}>{sc.title}</p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <Metric label="Avg Pace" value={(wpm || 134) + " WPM"} />
            <Metric label="Fillers" value={fl} />
            <Metric label="Upgrades" value={ups.length} />
          </div>
        </div>
        {ups.map((u) => <Upgrade key={u.id} u={u} compact mode="Live Conversation" bank={bank} toggle={toggle} />)}
        <div className="text-center pt-2">
          <button className={PRI} onClick={() => { setSi((si + 1) % SCEN.length); setPh("setup"); }}>Start Another Scenario</button>
        </div>
      </div>
    );

  /* Phase B — Active conversation (no replay buttons, no push-to-talk, no send button) */
  const spike = fl >= 3;
  return (
    <div className="w-full px-4 sm:px-6 pb-10">
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <div className={CARD + " h-[460px] overflow-y-auto space-y-4"}>
          {msgs.map((m, k) => (
            <div key={k} className={"flex " + (m.s === "user" ? "justify-end" : "justify-start")} style={{ animation: "fu .4s both" }}>
              <div className="max-w-[85%]">
                <div className={"rounded-2xl px-4 py-3 text-sm leading-relaxed " + (m.s === "user" ? "bg-[#9F1239] rounded-br-sm" : "bg-[#231219] border border-[#4A2230]/70 rounded-bl-sm")}>{m.text}</div>
                {m.up && <Upgrade u={m.up} compact mode="Live Conversation" bank={bank} toggle={toggle} />}
              </div>
            </div>
          ))}
          <div ref={end} />
        </div>

        <div className={CARD + " space-y-4 border " + (spike ? "border-amber-400" : "")} style={spike ? { animation: "amber 1.2s infinite" } : {}}>
          <h3 className="font-bold">Live Telemetry</h3>
          <Metric label="Words / Min" value={wpm || "—"} />
          <Metric label="Filler Counter" value={fl} sub={spike ? "⚠ Fillers spiking — slow down" : "Looking clean"} />
        </div>
      </div>

      <div className={CARD + " mt-4 flex items-center justify-between gap-3 flex-wrap !py-4"}>
        <span className="flex items-center gap-2 text-[#FDA4AF] font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />{st}
        </span>
        <button className={SEC + " border-[#9F1239]"} onClick={() => setPh("summary")}>⏹ Stop Conversation</button>
      </div>
      <p className={"text-xs text-center mt-3 " + MUTED}>Prototype note: the 60–120s pacing arc is compressed to ~20s so you can see the wind-down and wrap-up quickly.</p>
    </div>
  );
}
