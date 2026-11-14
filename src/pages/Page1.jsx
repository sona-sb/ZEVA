import React from "react";
import { go } from "../router";
import { Logo, PRI, SEC, GHOST, CARD, PILL, MUTED } from "../components/shared";

const FEATURES = [
  ["Everyday Fluency & Grammar", "Untimed speaking diagnostics, filler audits and CEFR scoring.", "B2 · 136 WPM"],
  ["Live Adaptive Voice Conversation", "Natural two-way spoken scenarios with inline grammar upgrades.", "Hands-free"],
  ["Solo Presentation Studio", "Uninterrupted pitch rehearsals with structure and tone feedback.", "Authority 88/100"],
];

// Page 1 — Landing & Gateway (/)
export default function Page1() {
  return (
    <div>
      <header className="sticky top-11 z-40 h-16 bg-[#090507]/70 backdrop-blur-xl border-b border-[#4A2230]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Logo sub />
          <button className={GHOST + " border border-[#4A2230]"} onClick={() => go("login")}>Log In</button>
        </div>
      </header>

      <section className="fi text-center px-4 pt-20 pb-24 max-w-3xl mx-auto">
        <div><span className={PILL}>Browser-Based AI Vocal & Fluency Studio</span></div>
        <div className="relative mt-8 inline-block">
          <div className="absolute inset-0 blur-3xl bg-[#DC2626]/25 rounded-full" style={{ animation: "glow 3.5s ease-in-out infinite" }} />
          <h1 className="relative text-[72px] font-black tracking-wider text-[#F9FAFB] leading-none">ZEVA</h1>
        </div>
        <p className="text-2xl sm:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#F9FAFB] via-[#FDA4AF] to-[#FB7185] mt-3">
          The English Speaking Studio
        </p>
        <p className="mt-6 leading-relaxed text-[#D1D5DB]">
          Refine your everyday spoken fluency, eliminate filler habits, and master confident presentation delivery. Real-time acoustic telemetry meets adaptive AI vocal coaching right in your browser.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mt-8">
          <button className={PRI + " text-lg"} onClick={() => go("studio")}>Try Zeva</button>
          <button className={SEC + " text-lg"} onClick={() => go("login")}>Log In</button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24 grid md:grid-cols-3 gap-4">
        {FEATURES.map(([t, d, b]) => (
          <div key={t} className={CARD + " hover:-translate-y-1 hover:border-[#9F1239] transition cursor-pointer"} onClick={() => go("studio")}>
            <span className={PILL}>{b}</span>
            <h3 className="text-lg font-bold mt-4 mb-2">{t}</h3>
            <p className={"text-sm leading-relaxed " + MUTED}>{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
