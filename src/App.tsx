import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeTab from "./components/HomeTab";
import AboutUsTab from "./components/AboutUsTab";
import EuropeTab from "./components/EuropeTab";
import ItalyTab from "./components/ItalyTab";
import CustomizeTab from "./components/CustomizeTab";
import AuthDialog from "./components/AuthDialog";
import { supabase } from "./lib/supabase";

type TabId = "home" | "about" | "europe" | "italy" | "customize";
const protectedTabs: TabId[] = ["customize"];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);

  const navigate = (tab: string) => {
    const nextTab = tab as TabId;
    if (protectedTabs.includes(nextTab) && !username) {
      setPendingTab(nextTab);
      setLoginOpen(true);
      return;
    }
    setActiveTab(nextTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab") as TabId | null;
    if (requested && ["home", "about", "europe", "italy", "customize"].includes(requested)) {
      if (protectedTabs.includes(requested)) {
        setPendingTab(requested);
        setLoginOpen(true);
      } else setActiveTab(requested);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const syncUser = (user: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) => {
      const metadata = user?.user_metadata;
      setUsername(
        typeof metadata?.given_name === "string" ? metadata.given_name
          : typeof metadata?.username === "string" ? metadata.username
            : user?.email ?? "",
      );
    };
    supabase.auth.getUser().then(({ data }) => syncUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => syncUser(session?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase?.auth.signOut();
    setUsername("");
    setPendingTab(null);
    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthenticated = (displayName: string) => {
    setUsername(displayName);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return <div className="min-h-screen bg-[#fafbfa] text-zinc-900">
    <Header activeTab={activeTab} setActiveTab={navigate} onLoginClick={() => setLoginOpen(true)} username={username || undefined} onLogout={logout} />
    <main>
      {activeTab === "home" && <HomeTab onStartCustomise={() => navigate("customize")} onRouteAccess={() => navigate("europe")} />}
      {activeTab === "about" && <AboutUsTab onStartCustomise={() => navigate("customize")} />}
      {activeTab === "europe" && <EuropeTab isAuthenticated={Boolean(username)} onRequireLogin={() => setLoginOpen(true)} />}
      {activeTab === "italy" && <ItalyTab isAuthenticated={Boolean(username)} onRequireLogin={() => setLoginOpen(true)} />}
      {activeTab === "customize" && <CustomizeTab />}
    </main>
    <Footer onNavClick={navigate} />

    {loginOpen && <AuthDialog onClose={() => { setLoginOpen(false); setPendingTab(null); }} onAuthenticated={handleAuthenticated} />}
  </div>;
}
