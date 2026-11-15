import { useCallback, useEffect, useRef, useState } from "react";

const MAX_DURATION_MS = 300000;
const SILENCE_THRESHOLD = 0.035;

function getRms(data) {
  let total = 0;
  for (let i = 0; i < data.length; i += 1) {
    const normalized = (data[i] - 128) / 128;
    total += normalized * normalized;
  }
  return Math.sqrt(total / data.length);
}

export default function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [waveform, setWaveform] = useState([]);
  const [error, setError] = useState("");
  const [audioStats, setAudioStats] = useState({ durationMs: 0, activeMs: 0, silenceMs: 0, speechToPauseRatio: "0%" });
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const audioUrlRef = useRef("");
  const audioStatsRef = useRef(audioStats);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef = useRef([]);
  const frameRef = useRef(0);
  const cutoffRef = useRef(0);
  const startedAtRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const activeMsRef = useRef(0);
  const silenceMsRef = useRef(0);

  const stopTracks = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (contextRef.current && contextRef.current.state !== "closed") void contextRef.current.close();
    contextRef.current = null;
    analyserRef.current = null;
  }, []);

  const sampleAudio = useCallback((now) => {
    const analyser = analyserRef.current;
    if (!analyser || !startedAtRef.current) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    const elapsed = lastFrameAtRef.current ? now - lastFrameAtRef.current : 0;
    lastFrameAtRef.current = now;
    if (getRms(data) >= SILENCE_THRESHOLD) activeMsRef.current += elapsed;
    else silenceMsRef.current += elapsed;
    const frequency = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequency);
    const bars = Array.from({ length: 30 }, (_, index) => {
      const offset = Math.floor(index * frequency.length / 30);
      return Math.max(8, Math.round((frequency[offset] / 255) * 56));
    });
    setWaveform(bars);
    frameRef.current = requestAnimationFrame(sampleAudio);
  }, []);

  const stopRecording = useCallback(() => new Promise((resolve, reject) => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      reject(new Error("Recording is not active."));
      return;
    }
    recorder.onstop = () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(cutoffRef.current);
      const durationMs = Math.max(0, Date.now() - startedAtRef.current);
      const activeMs = Math.round(activeMsRef.current);
      const silenceMs = Math.round(silenceMsRef.current);
      const stats = {
        durationMs,
        activeMs,
        silenceMs,
        speechToPauseRatio: durationMs ? Math.round((activeMs / durationMs) * 100) + "%" : "0%",
      };
      audioStatsRef.current = stats;
      setAudioStats(stats);
      setIsRecording(false);
      stopTracks();
      const mimeType = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setAudioUrl((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        const nextUrl = URL.createObjectURL(blob);
        audioUrlRef.current = nextUrl;
        return nextUrl;
      });
      setRecordingBlob(blob);
      resolve(blob);
    };
    recorder.onerror = () => reject(new Error("The browser could not finish recording audio."));
    recorder.stop();
  }), [stopTracks]);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw new Error("Audio recording is not supported in this browser.");
    }
    setError("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser.");
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      streamRef.current = stream;
      contextRef.current = context;
      analyserRef.current = analyser;
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      lastFrameAtRef.current = 0;
      activeMsRef.current = 0;
      silenceMsRef.current = 0;
      const stats = { durationMs: 0, activeMs: 0, silenceMs: 0, speechToPauseRatio: "0%" };
      audioStatsRef.current = stats;
      setAudioStats(stats);
      setWaveform([]);
      setAudioUrl((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        audioUrlRef.current = "";
        return "";
      });
      setRecordingBlob(null);
      setIsRecording(true);
      recorder.start();
      frameRef.current = requestAnimationFrame(sampleAudio);
      cutoffRef.current = window.setTimeout(() => { void stopRecording(); }, MAX_DURATION_MS);
    } catch (startError) {
      stream.getTracks().forEach((track) => track.stop());
      throw startError;
    }
  }, [sampleAudio, stopRecording]);

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    clearTimeout(cutoffRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    stopTracks();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = "";
  }, [stopTracks]);

  return { isRecording, waveform, error, setError, audioStats, recordingBlob, audioUrl, getAudioStats: () => audioStatsRef.current, startRecording, stopRecording };
}