import { useCallback, useEffect, useRef, useState } from "react";
import { generateConversationTurn, transcribeAudio } from "./groqService";

const MAX_CALL_MS = 300000;
const SILENCE_MS = 1600;
const SPEECH_THRESHOLD = 0.035;

function rms(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const sample = (data[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.sqrt(sum / data.length);
}

function pickVoice() {
  return window.speechSynthesis.getVoices().find((voice) => /^en(-|_)/i.test(voice.lang))
    || window.speechSynthesis.getVoices()[0];
}

export default function useLiveVoiceOrb(scenario) {
  const activeScenario = typeof scenario === "string"
    ? { title: scenario, context: scenario, open: "" }
    : scenario;
  const [state, setState] = useState("idle");
  const [orbIntensity, setOrbIntensity] = useState(0.35);
  const [transcript, setTranscript] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState("");
  const stateRef = useRef("idle");
  const streamRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const recorderRef = useRef(null);
  const frameRef = useRef(0);
  const cutoffRef = useRef(0);
  const silenceStartedRef = useRef(0);
  const heardSpeechRef = useRef(false);
  const startedAtRef = useRef(0);
  const stoppingRef = useRef(false);
  const historyRef = useRef([]);
  const transcriptRef = useRef([]);
  const upgradesRef = useRef([]);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    clearTimeout(cutoffRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (contextRef.current && contextRef.current.state !== "closed") void contextRef.current.close();
    recorderRef.current = null;
    streamRef.current = null;
    contextRef.current = null;
    analyserRef.current = null;
  }, []);

  const endCall = useCallback(() => {
    if (state === "idle" || state === "ended") return { transcript: transcriptRef.current, upgrades: upgradesRef.current };
    stoppingRef.current = true;
    window.speechSynthesis.cancel();
    cleanup();
    setDurationMs(Math.max(0, Date.now() - startedAtRef.current));
    setOrbIntensity(0);
    stateRef.current = "ended";
    setState("ended");
    return { transcript: transcriptRef.current, upgrades: upgradesRef.current };
  }, [cleanup, state]);

  const speak = useCallback((text) => new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    stateRef.current = "speaking";
    setState("speaking");
    window.speechSynthesis.speak(utterance);
  }), []);

  const processTurn = useCallback(async (audioBlob) => {
    if (stoppingRef.current || !audioBlob.size) return;
    stateRef.current = "thinking";
    setState("thinking");
    const result = await transcribeAudio(audioBlob);
    const userText = result.text?.trim();
    if (!userText) return startListening();
    const userEntry = { s: "user", text: userText };
    const turn = await generateConversationTurn(userText, historyRef.current, scenario);
    const upgrade = turn.upgrade
      ? { id: "conv-" + Date.now(), original: turn.upgrade.original, upgraded: turn.upgrade.improved, reason: turn.upgrade.explanation, keyVocabulary: turn.upgrade.keyVocabulary || [] }
      : null;
    if (upgrade) {
      userEntry.up = upgrade;
      upgradesRef.current = [...upgradesRef.current, upgrade];
      setUpgrades(upgradesRef.current);
    }
    const aiEntry = { s: "ai", text: turn.aiReply };
    historyRef.current = [...historyRef.current, userEntry, aiEntry];
    transcriptRef.current = [...transcriptRef.current, userEntry, aiEntry];
    setTranscript(transcriptRef.current);
    await speak(turn.aiReply);
    if (!stoppingRef.current) startListening();
  }, [activeScenario, speak]);

  const startListening = useCallback(() => {
    if (stoppingRef.current || !analyserRef.current) return;
    const recorder = new MediaRecorder(streamRef.current);
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      if (stoppingRef.current) return;
      void processTurn(new Blob(chunks, { type: recorder.mimeType || "audio/webm" })).catch((processError) => {
        setError(processError.message);
        endCall();
      });
    };
    recorderRef.current = recorder;
    heardSpeechRef.current = false;
    silenceStartedRef.current = 0;
    recorder.start();
    stateRef.current = "listening";
    setState("listening");
  }, [endCall, processTurn]);

  const sample = useCallback((now) => {
    const analyser = analyserRef.current;
    if (!analyser || stoppingRef.current) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    const volume = rms(data);
    setOrbIntensity(Math.min(1, Math.max(0.2, volume * 8)));
    if (stateRef.current === "listening" && recorderRef.current?.state === "recording") {
      if (volume >= SPEECH_THRESHOLD) {
        heardSpeechRef.current = true;
        silenceStartedRef.current = 0;
      } else if (heardSpeechRef.current) {
        if (!silenceStartedRef.current) silenceStartedRef.current = now;
        if (now - silenceStartedRef.current >= SILENCE_MS) recorderRef.current.stop();
      }
    }
    frameRef.current = requestAnimationFrame(sample);
  }, [state]);

  const startCall = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("Live audio is not supported in this browser.");
    setError("");
    stoppingRef.current = false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser.");
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream;
      contextRef.current = context;
      analyserRef.current = analyser;
      startedAtRef.current = Date.now();
      historyRef.current = [];
      transcriptRef.current = [];
      upgradesRef.current = [];
      setTranscript([]);
      setUpgrades([]);
      stateRef.current = "speaking";
      setState("speaking");
      const greeting = activeScenario.open;
      if (greeting) {
        const opening = { s: "ai", text: greeting };
        transcriptRef.current = [opening];
        setTranscript([opening]);
        await speak(greeting);
      }
      if (!stoppingRef.current) {
        startListening();
        frameRef.current = requestAnimationFrame(sample);
        cutoffRef.current = window.setTimeout(() => endCall(), MAX_CALL_MS);
      }
    } catch (startError) {
      stream.getTracks().forEach((track) => track.stop());
      throw startError;
    }
  }, [activeScenario.open, endCall, sample, speak, startListening]);

  useEffect(() => () => {
    stoppingRef.current = true;
    window.speechSynthesis.cancel();
    cleanup();
  }, [cleanup]);

  return { state, orbIntensity, transcript, upgrades, durationMs, error, startCall, endCall };
}