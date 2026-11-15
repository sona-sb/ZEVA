import React from "react";
import { useState, useEffect } from "react";
import { getRoute, go } from "./router";
import { StudioHeader, BankDrawer } from "./components/shared";
import { addVocabItem, deleteVocabItem, fetchProfileAnalytics, fetchUserVocab, saveSessionProgress, signOutUser, supabase } from "./backend/supabaseClient";
import Page1 from "./pages/Page1";
import Page2 from "./pages/Page2";
import Page3 from "./pages/Page3";
import Page4 from "./pages/Page4";
import Page5 from "./pages/Page5";
import Page6 from "./pages/Page6";
import ProfilePage from "./pages/ProfilePage";

function profileFromAuthUser(authUser) {
  return {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
    email: authUser.email,
  };
}

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [user, setUser] = useState(null);
  const [bank, setBank] = useState([]);
  const [progress, setProgress] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [open, setOpen] = useState(false);

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
      const saved = JSON.parse(localStorage.getItem("zeva-user") || "null");
      if (saved) setUser(saved);
    } catch (error) { console.error("Could not restore local profile.", error.message); }
    if (!supabase) {
      setAuthReady(true);
      return () => {
        window.removeEventListener("hashchange", onHash);
        window.removeEventListener("mousemove", onMove);
      };
    }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) { console.error("Could not restore Supabase session.", error.message); setUser(null); setAuthReady(true); return; }
      if (!active) return;
      if (!data.session?.user) { setUser(null); setAuthReady(true); return; }
      setUser(profileFromAuthUser(data.session.user));
      fetchUserVocab(data.session.user.id).then(setBank).catch((loadError) => console.error(loadError.message));
      fetchProfileAnalytics(data.session.user.id).then(setAnalytics).catch((loadError) => console.error(loadError.message));
      if (getRoute() === "login") go("studio");
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session?.user) return;
      setUser(profileFromAuthUser(session.user));
      fetchUserVocab(session.user.id).then(setBank).catch((error) => console.error(error.message));
      fetchProfileAnalytics(session.user.id).then(setAnalytics).catch((error) => console.error(error.message));
    });
    return () => {
      active = false;
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("mousemove", onMove);
      listener.subscription.unsubscribe();
    };
  }, []);

  const bankKey = user ? "zeva-bank-" + user.email : null;
  useEffect(() => {
    if (!user) {
      fetchUserVocab().then(setBank).catch((error) => console.error(error.message));
      return;
    }
    if (user.id) {
      fetchUserVocab(user.id).then(setBank).catch((error) => console.error(error.message));
      fetchProfileAnalytics(user.id).then((value) => { setAnalytics(value); setProgress(value.sessions); }).catch((error) => console.error(error.message));
      return;
    }
    try { setBank(JSON.parse(localStorage.getItem(bankKey) || "[]")); } catch (error) { console.error("Could not restore guest vocabulary.", error.message); }
  }, [bankKey, user]);

  const saveBank = (items) => {
    setBank(items);
    if (!user?.id) {
      try { localStorage.setItem("zeva_vocab_bank", JSON.stringify(items)); } catch (error) { console.error("Could not save guest vocabulary.", error.message); }
    }
  };

  const toggle = async (item) => {
    const existing = bank.find((b) => b.id === item.id || (b.original === item.original && b.upgraded === item.upgraded));
    if (existing) {
      saveBank(bank.filter((b) => b !== existing));
      if (user?.id) {
        try { await deleteVocabItem(existing.remoteId || existing.id); } catch (error) { console.error(error.message); }
      }
      return;
    }
    if (!user?.id) {
      const { data, error } = await addVocabItem(item);
      if (error) { console.error("Guest vocab save error:", error); return; }
      if (data && !bank.some((entry) => entry.original === data.original && entry.upgraded === data.upgraded)) saveBank([...bank, data]);
      return;
    }
    try {
      const { data, error } = await addVocabItem({
        ...item,
        source_studio: item.source_studio || item.mode,
      });
      if (error) {
        console.error("Supabase vocab save error:", error);
        return;
      }
      if (data && !bank.some((entry) => entry.original === data.original && entry.upgraded === data.upgraded)) saveBank([...bank, data]);
    } catch (error) { console.error("Supabase vocab save error:", error); }
  };

  const saveProgress = async (sessionData) => {
    if (!user?.id) return;
    try {
      const saved = await saveSessionProgress(sessionData);
      if (saved?.error) {
        console.error(saved.error);
        return;
      }
      setProgress((items) => [saved, ...items]);
      const refreshed = await fetchProfileAnalytics(user.id);
      setAnalytics(refreshed);
    } catch (error) { console.error(error.message); }
  };

  const removeVocab = async (itemId) => {
    const item = bank.find((entry) => entry.id === itemId);
    saveBank(bank.filter((entry) => entry.id !== itemId));
    if (item) {
      try { await deleteVocabItem(item.remoteId || item.id); } catch (error) { console.error(error.message); }
    }
  };

  const logout = async () => {
    if (user?.id) {
      try { await signOutUser(); } catch (error) { console.error(error.message); }
    }
    try { localStorage.removeItem("zeva-user"); } catch (error) { console.error("Could not clear local profile.", error.message); }
    setUser(null);
    setBank([]);
    setProgress([]);
    setAnalytics(null);
  };

  const openBank = () => setOpen(true);
  useEffect(() => {
    if (authReady && route === "profile" && !user) go("login");
  }, [authReady, route, user]);

  const shared = { bank, toggle, user, saveProgress };
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
        <Page3 progress={progress} />
      </div>
    );
  else if (route === "profile")
    page = (
      <div>
        <StudioHeader hub user={user} logout={logout} bank={bank} openBank={openBank} />
        <ProfilePage user={user} analytics={analytics} />
      </div>
    );
  else if (route === "fluency") page = studio("Everyday Fluency & Grammar", Page4);
  else if (route === "conversation") page = studio("Live Adaptive Voice Conversation", Page5);
  else page = studio("Solo Presentation Studio", Page6);

  return (
    <div>
      <div key={route}>{page}</div>
      <BankDrawer open={open} close={() => setOpen(false)} bank={bank} remove={removeVocab} />
    </div>
  );
}
