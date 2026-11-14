import React from "react";
import { useState, useEffect } from "react";
import { getRoute } from "./router";
import { ProtoNav, StudioHeader, BankDrawer } from "./components/shared";
import Page1 from "./pages/Page1";
import Page2 from "./pages/Page2";
import Page3 from "./pages/Page3";
import Page4 from "./pages/Page4";
import Page5 from "./pages/Page5";
import Page6 from "./pages/Page6";

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [user, setUser] = useState(null); // null = Guest Mode
  const [bank, setBank] = useState([]);   // Vocabulary Bank
  const [open, setOpen] = useState(false);

  // Hash routing + cursor-tracking aura + restore saved profile
  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); window.scrollTo(0, 0); };
    const onMove = (e) => {
      const s = document.documentElement.style;
      s.setProperty("--mouse-x", e.clientX + "px");
      s.setProperty("--mouse-y", e.clientY + "px");
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("mousemove", onMove);
    try {
      const u = JSON.parse(localStorage.getItem("zeva-user") || "null");
      if (u) setUser(u);
    } catch (e) { /* storage unavailable */ }
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Bank persists to localStorage keyed by email when signed in; session-only in Guest Mode
  const bankKey = user ? "zeva-bank-" + user.email : null;
  useEffect(() => {
    if (!bankKey) return;
    try { setBank(JSON.parse(localStorage.getItem(bankKey) || "[]")); } catch (e) { /* ignore */ }
  }, [bankKey]);

  const saveBank = (b) => {
    setBank(b);
    if (bankKey) { try { localStorage.setItem(bankKey, JSON.stringify(b)); } catch (e) { /* ignore */ } }
  };
  const toggle = (item) =>
    saveBank(bank.some((b) => b.id === item.id) ? bank.filter((b) => b.id !== item.id) : [...bank, item]);
  const logout = () => {
    try { localStorage.removeItem("zeva-user"); } catch (e) { /* ignore */ }
    setUser(null);
    setBank([]);
  };

  const openBank = () => setOpen(true);
  const shared = { bank, toggle };
  const studio = (title, Page) => (
    <div>
      <StudioHeader title={title} bank={bank} openBank={openBank} />
      <Page {...shared} />
    </div>
  );

  let page;
  if (route === "home") page = <Page1 />;
  else if (route === "login") page = <Page2 setUser={setUser} />;
  else if (route === "studio")
    page = (
      <div>
        <StudioHeader hub user={user} logout={logout} bank={bank} openBank={openBank} />
        <Page3 />
      </div>
    );
  else if (route === "fluency") page = studio("Everyday Fluency & Grammar", Page4);
  else if (route === "conversation") page = studio("Live Adaptive Voice Conversation", Page5);
  else page = studio("Solo Presentation Studio", Page6);

  return (
    <div>
      <ProtoNav route={route} />
      <div key={route}>{page}</div>
      <BankDrawer open={open} close={() => setOpen(false)} bank={bank} remove={(id) => saveBank(bank.filter((b) => b.id !== id))} />
    </div>
  );
}
