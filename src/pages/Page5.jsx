import React from "react";
import { useEffect, useRef, useState } from "react";
import { SCEN } from "../mockData";
import { B, PRI, SEC, CARD, PILL, MUTED, Metric, Upgrade } from "../components/shared";
import { generateNewTopics } from "../backend/groqService";
import useLiveVoiceOrb from "../backend/useLiveVoiceOrb";

// Page 5 — Live Adaptive Voice Conversation (/studio/conversation)
function VoiceOrb({ state, intensity }) {
  const stateClass = state === "listening" ? "voice-orb-listening" : state === "thinking" ? "voice-orb-thinking" : "voice-orb-speaking";
  const orbStyle = { transform: "scale(" + (0.94 + intensity * 0.1) + ")" };

  return (
    <div className="relative flex items-center justify-center w-72 h-72 sm:w-96 sm:h-96" aria-label="Live voice conversation">
      <div className={"voice-orb-ring absolute inset-5 rounded-full border border-[#FDA4AF]/30 " + stateClass} />
      <div className={"voice-orb-ring absolute inset-12 rounded-full border border-[#9F1239]/70 " + stateClass} />
      <div className={"voice-orb-core relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center " + stateClass} style={orbStyle}>
        <div className="absolute inset-3 rounded-full border border-[#FDA4AF]/30" />
        <div className="relative text-center px-6">
          <div className="flex items-center justify-center gap-1.5 h-10">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="w-1.5 rounded-full bg-[#FDA4AF] voice-bar" style={{ animationDelay: i * 0.08 + "s" }} />
            ))}
          </div>
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

export default function Page5({ bank, toggle, saveProgress }) {
  const [ph, setPh] = useState("setup");
  const [si, setSi] = useState(0);
  const [scenarios, setScenarios] = useState(SCEN);
  const [msgs, setMsgs] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customScenario, setCustomScenario] = useState("");
  const startedAt = useRef(0);
  const savedProgress = useRef(false);
  const sc = scenarios[si];
  const activeScenario = isCustomMode ? customScenario.trim() : sc;
  const activeScenarioTitle = isCustomMode ? customScenario.trim() || "Custom Scenario" : sc.title;
  const live = useLiveVoiceOrb(activeScenario);
  useEffect(() => {
    if (ph === "live" && live.state === "ended") {
      setMsgs(live.transcript);
      setDuration(Math.max(1, Math.round(live.durationMs / 1000)));
      if (saveProgress && !savedProgress.current) {
        savedProgress.current = true;
        const users = live.transcript.filter((m) => m.s === "user");
        const words = users.reduce((sum, m) => sum + m.text.split(/\s+/).filter(Boolean).length, 0);
        const fillers = users.reduce((sum, m) => sum + (m.text.match(/\b(um|uh|like|you know|basically|actually|literally)\b/gi) || []).length, 0);
        const saveCompletedSession = async () => {
          await saveProgress({
          mode: "conversation",
          topic: activeScenarioTitle,
          wpm: Math.round(words / Math.max(live.durationMs / 60000, 1 / 60)),
          fillerCount: fillers,
          });
        };
        void saveCompletedSession();
      }
      setPh("summary");
    }
  }, [activeScenarioTitle, live.durationMs, live.state, live.transcript, ph, saveProgress]);
  const reportMsgs = ph === "summary" ? msgs : live.transcript;
  const userTurns = reportMsgs.filter((m) => m.s === "user");
  const averageWpm = userTurns.reduce((total, m) => total + m.text.split(/\s+/).filter(Boolean).length, 0) / Math.max(duration / 60, 1 / 60);
  const fillerCount = userTurns.reduce((total, m) => total + (m.text.match(/\b(um|uh|like|you know|basically|actually|literally)\b/gi) || []).length, 0);

  const shuffle = async () => {
    setIsCustomMode(false);
    setCustomScenario("");
    const topics = await generateNewTopics("conversation");
    setScenarios(topics);
    setSi(0);
  };
  const toggleCustomMode = () => {
    setIsCustomMode((active) => !active);
    setCustomScenario("");
  };
  const startConversation = async () => {
    startedAt.current = Date.now();
    savedProgress.current = false;
    await live.startCall();
    setPh("live");
  };
  const stopConversation = () => {
    const result = live.endCall();
    setMsgs(result.transcript);
    const elapsedMs = Math.max(1, Date.now() - startedAt.current);
    setDuration(Math.max(1, Math.round(elapsedMs / 1000)));
    setPh("summary");
  };

  if (ph === "setup")
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 pb-16 flex flex-col gap-5 fi">
        <div className={CARD}>
          <div className="flex justify-between items-center mb-3">
            <span className={PILL}>Roleplay Scenario</span>
              <div className="flex items-center gap-2">
                <button onClick={shuffle} className={B + "text-sm text-[#FDA4AF] border border-[#4A2230] rounded-lg px-3 py-1.5"}>⟳ Reload / New Topic</button>
                <button onClick={toggleCustomMode} className={B + "text-xs px-3 py-1.5 rounded-lg border border-[#9F1239]/50 hover:border-[#FDA4AF] bg-[#140A0E] text-[#FDA4AF]"}>
                  {isCustomMode ? "✕ Back to Presets" : "+ Custom Scenario"}
                </button>
              </div>
          </div>
            {isCustomMode && (
              <input
                value={customScenario}
                onChange={(event) => setCustomScenario(event.target.value)}
                placeholder="Describe your roleplay scenario (e.g., Job interview for a React developer)..."
                className="bg-[#140A0E] border border-[#9F1239]/60 focus:border-[#FDA4AF] text-white placeholder-gray-400 rounded-xl px-4 py-2.5 w-full"
              />
            )}
          {!isCustomMode && (
            <>
              <h2 className="text-xl font-bold">{activeScenarioTitle}</h2>
              <p className={"mt-2 leading-relaxed " + MUTED}>{sc.context}</p>
            </>
          )}
        </div>
        <div className="text-center mt-auto mb-4">
          <button className={PRI + " text-lg px-10 py-4"} onClick={startConversation} disabled={isCustomMode && !customScenario.trim()}>🎙️ Start Conversation</button>
          <p className={"text-xs mt-3 " + MUTED}>Hands-free: your mic stays on and the AI replies automatically. Ask it to repeat if you miss something.</p>
        </div>
      </div>
    );

  if (ph === "summary")
    return (
      <div className="w-full px-4 sm:px-6 pb-16 space-y-5 fi">
        <div className={CARD + " text-center"}>
          <span className={PILL}>Conversation Summary &amp; Report</span>
          <h2 className="text-2xl font-bold mt-3">Great conversation!</h2>
          <p className={"mt-1 " + MUTED}>{sc.title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <Metric label="Total Duration" value={formatDuration(duration)} />
            <Metric label="Average WPM" value={Math.round(averageWpm)} sub="Words per minute" />
            <Metric label="Filler Word Audit" value={fillerCount} sub={fillerCount === 0 ? "No fillers detected" : "Filler words detected"} />
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
          <button className={PRI} onClick={() => { setIsCustomMode(false); setCustomScenario(""); setSi((si + 1) % scenarios.length); setMsgs([]); setPh("setup"); }}>Start Another Scenario</button>
        </div>
      </div>
    );

  return (
    <div className="w-full px-4 sm:px-6 pb-10">
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
        <VoiceOrb state={live.state} intensity={live.orbIntensity} />
      </div>
      <div className="flex justify-center pt-3">
        <button className={SEC + " border-[#9F1239]"} onClick={stopConversation}>⏹ Stop Conversation</button>
      </div>
    </div>
  );
}
