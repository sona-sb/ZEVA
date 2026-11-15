import React from "react";
import { go } from "../router";
import { CARD, MUTED, Metric } from "../components/shared";

const MODES = [
  ["fluency", "01", "Everyday Fluency & Grammar", "Speak on the selected topic to receive a complete CEFR level score, filler word audit, and mistake-to-upgrade breakdown."],
  ["conversation", "02", "Live Adaptive Voice Conversation", "Engage in real-time spoken dialogue with an AI conversational partner featuring live inline grammar upgrades and instant scenario reloading."],
  ["presentation", "03", "Solo Presentation Studio", "Rehearse high-stakes pitches and structured talks uninterrupted, receiving targeted feedback on professional delivery, pacing, and persuasive vocabulary."],
];

// Page 3 — 3-Mode Selector Hub (/studio). Header is rendered by App.
export default function Page3({ progress = [] }) {
  const averageWpm = progress.length ? Math.round(progress.reduce((sum, item) => sum + (item.wpm || 0), 0) / progress.length) : 0;
  const recent = progress.slice(-3);
  return (
    <div className="w-full px-4 sm:px-6 pb-16 fi">
      <button className="text-sm text-gray-400 hover:text-[#FDA4AF] inline-flex items-center gap-1.5 transition-colors mb-6 cursor-pointer" onClick={() => go("home")}>
        ← Back to Home
      </button>
      <div className="text-center w-full pt-10 pb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Welcome to Your Speaking Studio</h1>
        <p className={"mt-3 " + MUTED}>Select a mode below to begin your diagnostic session, practice live conversational fluency, or rehearse your presentation delivery.</p>
      </div>
      <div className="w-full grid md:grid-cols-3 gap-4 items-stretch">
        {MODES.map(([r, n, t, d]) => (
          <button key={r} onClick={() => go(r)} className={CARD + " w-full min-h-[360px] text-left flex flex-col items-start gap-5 bg-[#1A0D13]/90 hover:border-[#9F1239] hover:shadow-[0_0_25px_rgba(159,18,57,0.35)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"}>
            <div className="text-6xl font-black text-[#9F1239] group-hover:text-[#FDA4AF] transition-colors duration-300">{n}</div>
            <div className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold">{t}</h2>
              <p className={"mt-4 leading-relaxed overflow-hidden transition-all duration-300 " + MUTED}>{d}</p>
            </div>
            <span className="text-[#FDA4AF] text-xl mt-auto group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        ))}
      </div>
      <div className={CARD + " mt-6"}>
        <h2 className="text-xl font-bold">Practice Progress</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          <Metric label="Sessions Completed" value={progress.length} />
          <Metric label="Average WPM" value={averageWpm} />
          <Metric label="Recent CEFR">
            {recent.length === 0 ? (
              <div className="text-sm font-semibold text-[#FDA4AF]">Complete more sessions</div>
            ) : (
              <div className="flex items-center justify-center">
                {recent.map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    {index > 0 && <span className="text-[#FDA4AF]/70 text-xs mx-1" aria-hidden="true">→</span>}
                    <span className="text-2xl font-extrabold text-[#FDA4AF]">
                      {item.cefr_level || item.cefr || "B1"}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </Metric>
        </div>
      </div>
    </div>
  );
}
