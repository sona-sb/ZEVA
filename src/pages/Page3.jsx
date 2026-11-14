import React from "react";
import { go } from "../router";
import { CARD, MUTED } from "../components/shared";

const MODES = [
  ["fluency", "01", "Everyday Fluency & Grammar", "Speak on the selected topic to receive a complete CEFR level score, filler word audit, and mistake-to-upgrade breakdown."],
  ["conversation", "02", "Live Adaptive Voice Conversation", "Engage in real-time spoken dialogue with an AI conversational partner featuring live inline grammar upgrades and instant scenario reloading."],
  ["presentation", "03", "Solo Presentation Studio", "Rehearse high-stakes pitches and structured talks uninterrupted, receiving targeted feedback on professional delivery, pacing, and persuasive vocabulary."],
];

// Page 3 — 3-Mode Selector Hub (/studio). Header is rendered by App.
export default function Page3() {
  return (
    <div className="px-4 pb-16 fi">
      <div className="text-center max-w-2xl mx-auto pt-10 pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Welcome to Your Speaking Studio</h1>
        <p className={"mt-3 " + MUTED}>Select a mode below to begin your diagnostic session, practice live conversational fluency, or rehearse your presentation delivery.</p>
      </div>
      <div className="max-w-4xl mx-auto space-y-4">
        {MODES.map(([r, n, t, d]) => (
          <button key={r} onClick={() => go(r)} className={CARD + " w-full text-left flex items-center gap-5 hover:border-[#9F1239] hover:shadow-[0_0_25px_rgba(159,18,57,0.35)] hover:-translate-y-0.5 transition group"}>
            <div className="text-3xl font-black text-[#9F1239] group-hover:text-[#FB7185] transition">{n}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{t}</h3>
              <p className={"text-sm mt-1 leading-relaxed " + MUTED}>{d}</p>
            </div>
            <span className="text-[#FDA4AF] text-xl">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
