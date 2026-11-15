import React from "react";
import { useState } from "react";
import { PROMPTS, PREP } from "../mockData";
import { B, PRI, SEC, CARD, PILL, MUTED, Metric, Fillers, Upgrade, Recorder } from "../components/shared";
import useAudioRecorder from "../backend/useAudioRecorder";
import { analyzePresentation, calculateWpm, generateNewTopics, transcribeAudio } from "../backend/groqService";

const AUDIENCES = ["School / College", "Office / Client", "General Audience"];

// Page 6 — Solo Presentation Studio (/studio/presentation)
export default function Page6({ bank, toggle, saveProgress }) {
  const [ph, setPh] = useState("a");
  const [tab, setTab] = useState("prompts");
  const [pi, setPi] = useState(0);
  const [title, setTitle] = useState("");
  const [aud, setAud] = useState("General Audience");
  const [rk, setRk] = useState(0); // bumps to reset the Recorder
  const [prompts, setPrompts] = useState(PROMPTS);
  const [report, setReport] = useState(PREP);
  const [error, setError] = useState("");
  const recorder = useAudioRecorder();
  const R = report;
  const p = prompts[pi];
  const topic = tab === "prompts" ? p.title : title || "My presentation";

  const shuffle = async () => {
    setError("");
    try {
      const fresh = await generateNewTopics("presentation");
      setPrompts(fresh);
      setPi(0);
    } catch (shuffleError) {
      setError(shuffleError.message);
    }
  };

  const startRecording = async () => {
    setError("");
    if (tab === "own" && !title.trim()) {
      const validationError = new Error("Enter a presentation topic before starting.");
      setError(validationError.message);
      throw validationError;
    }
    await recorder.startRecording();
  };

  const analyzeRecording = async (audioBlob) => {
    try {
      if (!audioBlob) throw new Error("No recorded audio was available. Please record again.");
      const transcription = await transcribeAudio(audioBlob);
      const transcript = transcription.text;
      if (!transcript) throw new Error("The audio transcription was empty. Please try speaking again.");
      const stats = recorder.getAudioStats();
      const wpm = calculateWpm(transcript, stats.durationMs);
      const result = await analyzePresentation(transcript, { ...stats, wpm }, {
        mode: tab,
        topic,
        targetAudience: tab === "prompts" ? (p.aud || aud) : aud,
      });
      setReport({ ...result, wpm });
      if (saveProgress) await saveProgress({
        mode: "presentation",
        topic,
        score: result.score,
        wpm,
        fillerCount: result.fillers.reduce((sum, item) => sum + (item.c || 0), 0),
      });
      setPh("b");
    } catch (analysisError) {
      setError(analysisError.message);
      throw analysisError;
    }
  };

  /* Phase B — Professional Delivery Report */
  if (ph === "b")
    return (
      <div className="w-full px-4 sm:px-6 pb-16 space-y-4 fi">
        <div className="text-center"><span className={PILL}>{topic}</span></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric label="Authority & Tone" value={R.score + "/100"} sub="Commanding" />
          <Metric label="Structural Pacing" value={R.wpm + " WPM"} sub="Measured" />
          <Metric label="Filler Audit"><Fillers list={R.fillers} /></Metric>
          <Metric label="Pause Discipline" value="Strong" sub="1.2s pauses" />
        </div>

        <div className={CARD}>
          <h3 className="font-bold mb-3">Structure & Flow Feedback</h3>
          <div className="space-y-3">
            {R.flow.map(([h, t]) => (
              <div key={h} className="flex gap-3">
                <span className="text-[#FB7185] font-bold w-28 shrink-0 text-sm">{h}</span>
                <p className="text-sm text-[#D1D5DB]">{t}</p>
              </div>
            ))}
          </div>
          <p className={"text-xs mt-3 " + MUTED}>Pause discipline: {R.pause}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold px-1">Vocabulary & Phrasing Upgrades</h3>
          {R.up.map((u) => <Upgrade key={u.id} u={u} mode="Presentation" bank={bank} toggle={toggle} />)}
        </div>

        <div className="flex gap-3 justify-center flex-wrap pt-2">
          <button className={SEC} onClick={() => { setRk(rk + 1); setPh("a"); }}>Rehearse Same Topic Again</button>
          <button className={SEC} onClick={() => { setTab("prompts"); setPi((pi + 1) % PROMPTS.length); setRk(rk + 1); setPh("a"); }}>Rehearse Similar Prompt</button>
          <button className={PRI} onClick={() => { setTab("own"); setTitle(""); setRk(rk + 1); setPh("a"); }}>Try a New Topic</button>
        </div>
      </div>
    );

  /* Phase A — Pre-rehearsal setup */
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 pb-16 flex flex-col gap-5 fi">
      <div className="grid grid-cols-2 bg-[#1A0D13]/80 rounded-full p-1 border border-[#4A2230]/70">
        {[["prompts", "Practice Prompts"], ["own", "My Own Topic"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={"rounded-full py-2 text-sm font-semibold transition " + (tab === k ? "bg-[#9F1239] text-white" : "text-[#9CA3AF]")}>{l}</button>
        ))}
      </div>

      {tab === "prompts" ? (
        <div className={CARD}>
          <div className="flex justify-between items-center mb-3">
            <span className={PILL}>{p.aud}</span>
            <button onClick={shuffle} className={B + "text-sm text-[#FDA4AF] border border-[#4A2230] rounded-lg px-3 py-1.5"}>⟳ Shuffle Prompt</button>
          </div>
          <h2 className="text-xl font-bold">{p.title}</h2>
          <p className={"mt-2 leading-relaxed " + MUTED}>{p.prompt}</p>
        </div>
      ) : (
        <div className={CARD + " space-y-4"}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Final Year Project Pitch" className="w-full bg-[#090507]/70 border border-[#4A2230] rounded-xl px-4 py-3 outline-none focus:border-[#FB7185]" />
          <div className="flex gap-2 flex-wrap">
            {AUDIENCES.map((a) => (
              <button key={a} onClick={() => setAud(a)} className={"text-sm rounded-full px-4 py-1.5 border transition " + (aud === a ? "bg-[#9F1239] border-[#9F1239] text-white" : "border-[#4A2230] text-[#D1D5DB]")}>{a}</button>
            ))}
          </div>
        </div>
      )}

      <Recorder
        key={rk + tab + pi}
        start="Start Presentation"
        send="Send for Evaluation"
        onStartRecording={startRecording}
        onStopRecording={recorder.stopRecording}
        onSend={analyzeRecording}
        waveform={recorder.waveform}
        error={error}
        recordingActive={recorder.isRecording}
        recordedBlob={recorder.recordingBlob}
        className="mt-auto mb-4"
      />
    </div>
  );
}
