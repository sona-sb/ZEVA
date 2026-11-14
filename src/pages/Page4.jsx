import React from "react";
import { useState } from "react";
import { TOPICS, REPORT } from "../mockData";
import { B, PRI, SEC, CARD, PILL, MUTED, Metric, Fillers, Upgrade, Recorder } from "../components/shared";

// Page 4 — Everyday Fluency & Grammar (/studio/fluency)
export default function Page4({ bank, toggle }) {
  const [ph, setPh] = useState("a");
  const [i, setI] = useState(0);
  const [tp, setTp] = useState(TOPICS[0]);
  const R = REPORT;

  const shuffle = () => { const n = (i + 1) % TOPICS.length; setI(n); setTp(TOPICS[n]); };
  const similar = () => {
    setTp({
      category: "Reinforcement · Targets your mistakes",
      prompt: tp.similar || TOPICS[0].similar,
      bullets: [
        "Use precise vocabulary instead of ‘very much’ or ‘that thing’",
        "Pause silently instead of using fillers",
        "Link ideas with clear past-tense transitions",
      ],
      similar: TOPICS[0].similar,
    });
    setPh("a");
  };
  const fresh = () => { shuffle(); setPh("a"); };

  /* Phase B — Diagnostic Scorecard */
  if (ph === "b")
    return (
      <div className="w-full px-4 sm:px-6 pb-16 space-y-4 fi">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric label="Estimated CEFR" sub={R.label}>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#4A2230" strokeWidth="7" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#FB7185" strokeWidth="7" strokeLinecap="round" strokeDasharray="150 214" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-black">{R.cefr}</div>
            </div>
          </Metric>
          <Metric label="Speaking Pace" value={R.wpm + " WPM"} sub="Natural range" />
          <Metric label="Speech-to-Pause" value={R.ratio} sub="Active speech" />
          <Metric label="Vocal Energy" value={R.energy.split(" ")[0]} sub={R.energy} />
        </div>

        <div className={CARD}><p className="text-[#D1D5DB]">{R.summary}</p></div>

        <div className={CARD}>
          <h3 className="font-bold mb-3">Filler Audit</h3>
          <Fillers list={R.fillers} />
          <p className={"text-sm mt-4 " + MUTED}>💡 {R.tip}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold px-1">Mistakes → Upgraded Sentences</h3>
          {R.up.map((u) => <Upgrade key={u.id} u={u} mode="Everyday Fluency" bank={bank} toggle={toggle} />)}
        </div>

        <div className="flex gap-3 justify-center flex-wrap pt-2">
          <button className={SEC} onClick={similar}>Practice Similar Topic</button>
          <button className={PRI} onClick={fresh}>Explore New Topic</button>
        </div>
      </div>
    );

  /* Phase A — Topic prompt + recording */
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 pb-16 flex flex-col gap-5 fi">
      <div className={CARD}>
        <div className="flex justify-between items-center mb-3">
          <span className={PILL}>{tp.category}</span>
          <button onClick={shuffle} className={B + "text-sm text-[#FDA4AF] border border-[#4A2230] rounded-lg px-3 py-1.5"}>⟳ Shuffle Topic</button>
        </div>
        <h2 className="text-xl font-bold leading-snug">{tp.prompt}</h2>
        <p className={"text-sm mt-3 " + MUTED}>You should say:</p>
        <ul className="mt-1 space-y-1.5 text-[#D1D5DB]">
          {tp.bullets.map((b) => (
            <li key={b} className="flex gap-2"><span className="text-[#FB7185]">•</span>{b}</li>
          ))}
        </ul>
      </div>
      <Recorder key={tp.prompt} start="Start Speaking" send="Send for Analysis" onSend={() => setPh("b")} className="mt-auto mb-4" />
    </div>
  );
}
