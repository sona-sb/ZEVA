import React, { useEffect, useMemo, useState } from "react";
import { CARD, MUTED, PILL, Metric, SEC } from "../components/shared";
import { go } from "../router";
import { fetchProfileAnalytics } from "../backend/supabaseClient";

const METRICS = [
  ["score", "Score"],
  ["wpm", "WPM"],
  ["fillers", "Filler Words"],
];

function modeLabel(mode) {
  if (mode === "fluency") return "Fluency";
  if (mode === "conversation") return "Conversation";
  if (mode === "presentation") return "Presentation";
  return mode || "Studio";
}

function formatDate(value) {
  if (!value) return "Recent session";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function GrowthChart({ sessions }) {
  const [metric, setMetric] = useState("score");
  const [hovered, setHovered] = useState(null);
  const values = sessions.map((item) => {
    if (metric === "wpm") return Number(item.wpm) || 0;
    if (metric === "fillers") return Number(item.filler_count) || 0;
    return Number(item.score) || 0;
  });
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => ({
    x: sessions.length === 1 ? 380 : 40 + (index * 680) / (sessions.length - 1),
    y: 210 - ((value - min) / range) * 170,
    value,
  }));
  const line = points.map((point, index) => (index === 0 ? "M" : "L") + " " + point.x + " " + point.y).join(" ");
  const area = points.length ? line + " L " + points[points.length - 1].x + " 230 L " + points[0].x + " 230 Z" : "";

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className={PILL}>Growth Analytics</span>
          <h2 className="text-xl font-bold mt-2">Your speaking trajectory</h2>
        </div>
        <div className="flex gap-1 bg-[#090507]/60 rounded-xl p-1 border border-[#4A2230]">
          {METRICS.map(([key, label]) => (
            <button key={key} onClick={() => { setMetric(key); setHovered(null); }} className={"rounded-lg px-3 py-1.5 text-xs font-semibold transition " + (metric === key ? "bg-[#9F1239] text-white" : "text-[#9CA3AF]")}>{label}</button>
          ))}
        </div>
      </div>
      {sessions.length < 2 ? (
        <div className={"h-64 flex items-center justify-center text-center " + MUTED}>
          Complete at least two practice sessions to unlock your growth chart.
        </div>
      ) : (
        <div className="relative mt-5">
          <svg viewBox="0 0 760 260" className="w-full h-auto" role="img" aria-label={metric + " growth chart"}>
            <defs>
              <linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FDA4AF" stopOpacity=".32" />
                <stop offset="100%" stopColor="#9F1239" stopOpacity=".03" />
              </linearGradient>
            </defs>
            {[40, 82, 124, 166, 208].map((y) => <line key={y} x1="40" x2="720" y1={y} y2={y} stroke="#4A2230" strokeDasharray="4 6" />)}
            <path d={area} fill="url(#growthFill)" />
            <path d={line} fill="none" stroke="#FDA4AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <g key={index} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                <circle cx={point.x} cy={point.y} r="11" fill="transparent" />
                <circle cx={point.x} cy={point.y} r="5" fill="#9F1239" stroke="#FDA4AF" strokeWidth="2" />
                {hovered === index && (
                  <foreignObject x={Math.min(point.x - 82, 570)} y={Math.max(point.y - 78, 4)} width="170" height="70">
                    <div className="bg-[#231219] border border-[#FDA4AF]/60 rounded-lg p-2 text-[11px] text-white shadow-xl">
                      <strong>{formatDate(sessions[index].created_at)}</strong>
                      <div>{modeLabel(sessions[index].mode)} · {METRICS.find((item) => item[0] === metric)[1]}: {point.value}</div>
                    </div>
                  </foreignObject>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage({ user, analytics }) {
  const [profileAnalytics, setProfileAnalytics] = useState(analytics);
  useEffect(() => setProfileAnalytics(analytics), [analytics]);
  useEffect(() => {
    if (!user?.id) return undefined;
    fetchProfileAnalytics(user.id).then(setProfileAnalytics).catch((error) => console.error(error.message));
    return undefined;
  }, [user?.id]);
  const sessions = profileAnalytics?.sessions || [];
  const metrics = profileAnalytics?.metrics || {};
  const fillerTrend = metrics.fillerTrend || {};
  const currentCefr = metrics.currentCefr || "B1";
  const progressPercent = metrics.progressPercent || 0;
  const totalSessions = metrics.totalSessions || 0;
  const avgWpm = metrics.avgWpm || 0;
  const vocabularyCount = profileAnalytics?.vocabularyCount || metrics.vocabularyCount || 0;
  const [recentSessions] = useState(() => sessions.slice().reverse().slice(0, 6));
  const distribution = useMemo(() => ["fluency", "conversation", "presentation"].map((mode) => ({
    mode,
    count: sessions.filter((item) => item.mode === mode).length,
  })), [sessions]);
  const maxDistribution = Math.max(...distribution.map((item) => item.count), 1);
  const sessionFillerCounts = sessions.map((item) => Number(item.filler_count)).filter(Number.isFinite);
  const sessionFillerAverage = sessionFillerCounts.length
    ? sessionFillerCounts.reduce((sum, count) => sum + count, 0) / sessionFillerCounts.length
    : 0;
  const fillerAverage = Number.isFinite(fillerTrend.average) ? fillerTrend.average : sessionFillerAverage;
  const fillerStatus = sessions.length < 2
    ? "Just getting started"
    : fillerAverage < 2
      ? "Rarely using fillers"
      : fillerTrend.decreasing
        ? "Getting cleaner"
        : "Watch out for 'um' / 'uh'";

  return (
    <main className="w-full px-4 sm:px-6 pb-16 space-y-5 fi">
      <div className={CARD + " flex flex-col sm:flex-row items-center sm:items-start gap-5"}>
        <div className="w-20 h-20 rounded-2xl bg-[#9F1239] flex items-center justify-center text-3xl font-black text-[#FDA4AF] shadow-[0_0_25px_rgba(159,18,57,0.45)]">{(user?.name || user?.email || "?").charAt(0).toUpperCase()}</div>
        <div className="flex-1 text-center sm:text-left">
          <span className={PILL}>Profile &amp; Growth</span>
          <h1 className="text-2xl font-bold mt-2">{user?.name || "ZEVA Speaker"}</h1>
          <p className={"text-sm mt-1 " + MUTED}>{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
            <span className={PILL}>CEFR {currentCefr}</span>
            <span className={"text-xs " + MUTED}>Readiness for next level: {progressPercent}%</span>
          </div>
          <div className="h-2 bg-[#4A2230] rounded-full overflow-hidden mt-3 max-w-xl">
            <div className="h-full bg-gradient-to-r from-[#9F1239] to-[#FDA4AF] rounded-full" style={{ width: progressPercent + "%" }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Sessions Completed" value={totalSessions} />
        <Metric label="Average Pace" value={avgWpm + " WPM"} />
        <Metric label="Filler Word Trend" value={fillerStatus} sub={"~" + Math.round(fillerAverage) + " per session"} />
        <Metric label="Vocabulary Bank" value={vocabularyCount} />
      </div>

      <GrowthChart sessions={sessions} />

      <div className="grid lg:grid-cols-2 gap-5">
        <div className={CARD}>
          <span className={PILL}>Studio Mix</span>
          <h2 className="text-xl font-bold mt-2">Practice distribution</h2>
          <div className="space-y-4 mt-5">
            {distribution.map((item) => (
              <div key={item.mode}>
                <div className="flex justify-between text-sm mb-1"><span>{modeLabel(item.mode)}</span><span className={MUTED}>{item.count}</span></div>
                <div className="h-2 bg-[#4A2230] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#9F1239] to-[#FDA4AF] rounded-full" style={{ width: item.count / maxDistribution * 100 + "%" }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className={CARD}>
          <span className={PILL}>Recent Activity</span>
          <h2 className="text-xl font-bold mt-2">Practice history</h2>
          <div className="space-y-3 mt-4">
            {recentSessions.length === 0 ? <p className={MUTED}>Your completed sessions will appear here.</p> : recentSessions.map((item, index) => (
              <div key={item.id || index} className="border-b border-[#4A2230]/70 pb-3 last:border-0">
                <div className="flex justify-between gap-3"><span className={PILL}>{modeLabel(item.mode)}</span><span className={"text-xs " + MUTED}>{formatDate(item.created_at)}</span></div>
                <p className="text-sm font-semibold mt-2">{item.topic || "Speaking practice"}</p>
                <p className={"text-xs mt-1 " + MUTED}>{item.cefr_level || item.cefr || (item.score ? "Score " + item.score : "Evaluated")} · {item.wpm || 0} WPM</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-1"><button className={SEC} onClick={() => go("studio")}>Back to Studio</button></div>
    </main>
  );
}
