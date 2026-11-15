import React from "react";
import { go } from "../router";
import { Logo, PRI, SEC, GHOST, CARD, PILL, MUTED } from "../components/shared";

const FEATURES = [
  ["Everyday Fluency & Grammar", "Build natural speech through untimed diagnostic speaking practice, then receive a CEFR proficiency score that makes progress measurable. Filler-word audits reveal habits that interrupt your flow, while personalized vocabulary upgrades help you sound clearer, more precise, and more confident in everyday conversations.", "B2 · 136 WPM"],
  ["Live Adaptive Voice Conversation", "Practice hands-free with a two-way voice dialogue that listens, responds, and keeps the conversation moving. Real-time speech-to-text response loops make each exchange visible, while inline phrasing corrections sharpen your grammar without breaking your rhythm. Authentic recovery scenarios help you stay composed when conversations take an unexpected turn.", "Hands-free"],
  ["Solo Presentation Studio", "Rehearse uninterrupted professional presentations in a focused studio built around your goals. Bring a custom topic for a school speech, project pitch, or office talk, and practice until your structure feels natural. Targeted feedback on pacing, authority, and persuasive delivery turns each rehearsal into a more compelling performance.", "Authority 88/100"],
];

const PREVIEW_FRAME = "bg-[#140A0E] border border-[#9F1239]/40 rounded-2xl p-6 shadow-2xl min-h-[473px] flex items-center justify-center";

function FluencyPreview() {
  const bars = [24, 42, 30, 58, 38, 70, 46, 34, 62, 28, 52, 40, 66, 32, 48, 26, 56, 38, 72, 30, 46, 60, 34, 54];
  return (
    <div className={PREVIEW_FRAME} data-preview="fluency">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-1.5 h-24">
          {bars.map((height, index) => (
            <span key={index} className="w-2 rounded-full bg-gradient-to-t from-[#9F1239] to-[#FDA4AF]" style={{ height: height + "px" }} />
          ))}
        </div>
        <div className="flex justify-center gap-2 flex-wrap mt-8">
          <span className={PILL}>138 WPM</span>
          <span className={PILL}>0 Filler Words</span>
        </div>
      </div>
    </div>
  );
}

function ConversationPreview() {
  return (
    <div className={PREVIEW_FRAME} data-preview="conversation">
      <div className="text-center">
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          <div className="absolute inset-2 rounded-full border border-[#FDA4AF]/20" />
          <div className="absolute inset-8 rounded-full border border-[#9F1239]/70" />
          <div className="absolute inset-16 rounded-full bg-[#9F1239] shadow-[0_0_55px_rgba(253,164,175,0.45)] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#FDA4AF]/20 border border-[#FDA4AF]/50" />
          </div>
        </div>
        <span className={PILL}>Hands-Free AI Persona</span>
      </div>
    </div>
  );
}

function PresentationPreview() {
  return (
    <div className={PREVIEW_FRAME} data-preview="presentation">
      <div className="w-full max-w-sm bg-[#090507]/70 border border-[#4A2230] rounded-xl p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={PILL}>CEFR B2</span>
          <span className="text-xs text-[#FDA4AF]">Diagnostic Report</span>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-xs text-[#D1D5DB] mb-2">
            <span>Authority Score</span>
            <span className="text-[#FDA4AF]">88/100</span>
          </div>
          <div className="h-2 rounded-full bg-[#4A2230] overflow-hidden">
            <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-[#9F1239] to-[#FDA4AF]" />
          </div>
        </div>
        <div className="mt-6 border-l-2 border-[#FDA4AF] bg-[#9F1239]/15 rounded-r-lg p-3">
          <div className="text-[11px] uppercase tracking-wide text-[#FDA4AF]">Better Way to Say That</div>
          <p className="text-sm text-white mt-2">“deliver a compelling presentation”</p>
        </div>
      </div>
    </div>
  );
}

// Page 1 — Landing & Gateway (/)
export default function Page1() {
  return (
    <div>
      <header className="sticky top-0 z-40 h-16 w-full bg-[#090507]/70 backdrop-blur-xl border-b border-[#4A2230]/50">
        <div className="w-full px-4 sm:px-6 h-full flex items-center justify-between">
          <Logo sub />
          <button className={GHOST + " border border-[#4A2230]"} onClick={() => go("login")}>Log In</button>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory">
        <section className="fi relative min-h-full snap-start w-full text-center px-4 sm:px-6 py-20 flex flex-col items-center justify-center">
          <div><span className={PILL}>Browser-Based AI Vocal & Fluency Studio</span></div>
          <div className="relative mt-8 inline-block">
            <div className="absolute inset-0 blur-3xl bg-[#DC2626]/25 rounded-full" style={{ animation: "glow 3.5s ease-in-out infinite" }} />
            <h1 className="relative text-[72px] font-black tracking-wider text-[#F9FAFB] leading-none">ZEVA</h1>
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#F9FAFB] via-[#FDA4AF] to-[#FB7185] mt-3">
            The English Speaking Studio
          </p>
          <p className="mt-6 leading-relaxed text-[#D1D5DB] max-w-3xl">
            Refine your everyday spoken fluency, eliminate filler habits, and master confident presentation delivery. Real-time acoustic telemetry meets adaptive AI vocal coaching right in your browser.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mt-8">
            <button className={PRI + " text-lg"} onClick={() => go("studio")}>Try Zeva</button>
            <button className={SEC + " text-lg"} onClick={() => go("login")}>Log In</button>
          </div>
          <p className="absolute bottom-[1cm] left-4 sm:left-6 text-sm uppercase tracking-[0.3em] text-[#FDA4AF] text-left">Main Features</p>
        </section>

        <section className="min-h-full snap-start w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
          <div className="w-full">
            <div className="my-[1cm]">
              <div className="h-px w-full bg-[#9F1239]/40" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={CARD + " w-full min-h-[473px] flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:border-[#9F1239] transition cursor-pointer"} onClick={() => go("studio")}>
                <span className={PILL}>{FEATURES[0][2]}</span>
                <h2 className="text-2xl font-bold mt-4 mb-2">{FEATURES[0][0]}</h2>
                <p className={"leading-relaxed max-w-2xl " + MUTED}>{FEATURES[0][1]}</p>
              </div>
              <FluencyPreview />
            </div>
          </div>
        </section>

        {FEATURES.slice(1).map(([t, d, b]) => (
          <section key={t} className="min-h-full snap-start w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
            <div className="w-full">
              <div className="h-px w-full bg-[#9F1239]/40 mt-[1cm] mb-[1cm]" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={CARD + " w-full min-h-[473px] flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:border-[#9F1239] transition cursor-pointer"} onClick={() => go("studio")}>
                  <span className={PILL}>{b}</span>
                  <h2 className="text-2xl font-bold mt-4 mb-2">{t}</h2>
                  <p className={"leading-relaxed max-w-2xl " + MUTED}>{d}</p>
                </div>
                {t === FEATURES[1][0] ? <ConversationPreview /> : <PresentationPreview />}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
