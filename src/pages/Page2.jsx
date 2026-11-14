import React from "react";
import { useState } from "react";
import { go } from "../router";
import { PRI, GHOST, CARD, MUTED } from "../components/shared";

const INPUT = "w-full bg-[#090507]/70 border border-[#4A2230] rounded-xl px-4 py-3 outline-none focus:border-[#FB7185] text-sm";

// Page 2 — Authentication (/login)
export default function Page2({ setUser }) {
  const [mode, setMode] = useState("in");
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name: "", email: "", pw: "" });
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = () => {
    const email = f.email || "you@example.com";
    const u = { name: (mode === "up" && f.name) || email.split("@")[0], email };
    try { localStorage.setItem("zeva-user", JSON.stringify(u)); } catch (e) { /* storage unavailable */ }
    setUser(u);
    go("studio");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <div className="flex justify-between h-16 items-center">
        <button className={GHOST} onClick={() => go("home")}>← Back to Home</button>
        <button className={GHOST} onClick={() => go("studio")}>Continue as Guest →</button>
      </div>

      <div className={CARD + " max-w-md mx-auto mt-6 fi"}>
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#9F1239] items-center justify-center text-xl shadow-[0_0_25px_rgba(159,18,57,0.45)]">♛</div>
          <h1 className="text-2xl font-bold mt-3">{mode === "in" ? "Welcome Back to ZEVA" : "Create Your Studio Profile"}</h1>
          <p className={"text-sm mt-2 " + MUTED}>Sync your CEFR progress, streak milestones, and saved vocabulary bank across sessions.</p>
        </div>

        <div className="grid grid-cols-2 bg-[#090507]/70 rounded-full p-1 mt-6 border border-[#4A2230]/70">
          {[["in", "Log In"], ["up", "Sign Up"]].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} className={"rounded-full py-2 text-sm font-semibold transition " + (mode === k ? "bg-[#9F1239] text-white" : "text-[#9CA3AF]")}>{l}</button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <div className={"overflow-hidden transition-all duration-300 " + (mode === "up" ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
            <input className={INPUT} placeholder="Display Name / Studio Alias" value={f.name} onChange={up("name")} />
          </div>
          <input className={INPUT} type="email" placeholder="Email Address" value={f.email} onChange={up("email")} />
          <div className="relative">
            <input className={INPUT + " pr-12"} type={show ? "text" : "password"} placeholder="Password" value={f.pw} onChange={up("pw")} />
            <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" title="Toggle visibility">{show ? "🙈" : "👁️"}</button>
          </div>
          <button className={PRI + " w-full"} onClick={submit}>{mode === "in" ? "Log In to Studio" : "Create Studio Account"}</button>
        </div>
      </div>
    </div>
  );
}
