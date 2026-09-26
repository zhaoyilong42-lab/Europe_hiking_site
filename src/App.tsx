import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeTab from "./components/HomeTab";
import AboutUsTab from "./components/AboutUsTab";
import EuropeTab from "./components/EuropeTab";
import ItalyTab from "./components/ItalyTab";
import CustomizeTab from "./components/CustomizeTab";
import { LanguageProvider } from "./lib/locale";

type TabId = "home" | "about" | "europe" | "italy" | "customize";

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const navigate = (tab: string) => {
    const nextTab = tab as TabId;

    setActiveTab(nextTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab") as TabId | null;
    if (requested && ["home", "about", "europe", "italy", "customize"].includes(requested)) {
      setActiveTab(requested);
    }
  }, []);


  return <div className="min-h-screen bg-[#fafbfa] text-zinc-900" data-locale-root>
    <Header activeTab={activeTab} setActiveTab={navigate} />
    <main>
      {activeTab === "home" && <HomeTab onStartCustomise={() => navigate("customize")} onRouteAccess={() => navigate("europe")} />}
      {activeTab === "about" && <AboutUsTab onStartCustomise={() => navigate("customize")} />}
      {activeTab === "europe" && <EuropeTab />}
      {activeTab === "italy" && <ItalyTab />}
      {activeTab === "customize" && <CustomizeTab />}
    </main>
    <Footer onNavClick={navigate} />

  </div>;
}

export default function App() {
  return <LanguageProvider><AppContent /></LanguageProvider>;
}
