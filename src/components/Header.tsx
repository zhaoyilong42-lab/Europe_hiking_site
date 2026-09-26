import { Compass, Languages, Menu, X } from "lucide-react";
import { useLocale } from "../lib/locale";
import { useState } from "react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;

}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const tabs = [
    { id: "home", label: "首页" },
    { id: "about", label: "关于我们" },
    { id: "europe", label: "欧洲" },
    { id: "italy", label: "意大利" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm" role="group" aria-label="语言切换" data-locale-skip>
            <Languages className="ml-2 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <button type="button" onClick={() => setLocale("zh")} className={`rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${locale === "zh" ? "bg-emerald-800 text-white" : "text-zinc-600 hover:bg-zinc-100"}`} aria-pressed={locale === "zh"}>中文</button>
            <button type="button" onClick={() => setLocale("it")} className={`rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${locale === "it" ? "bg-emerald-800 text-white" : "text-zinc-600 hover:bg-zinc-100"}`} aria-pressed={locale === "it"}>IT</button>
          </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-emerald-700 bg-emerald-50/60"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
                id={`tab-nav-${tab.id}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {activeTab !== "customize" && <button
            onClick={() => setActiveTab("customize")}
            className="hidden md:flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm"
            id="cta-customize-btn"
          >
            <Compass className="w-4 h-4" />
            <span>定制一日徒步</span>
          </button>}

          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50" aria-label={mobileMenuOpen ? "关闭导航菜单" : "打开导航菜单"} id="mobile-menu-btn">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-3 shadow-lg" id="mobile-navigation-menu">
        <nav className="grid gap-1">
          {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} className={`rounded-lg px-4 py-3 text-left text-sm font-semibold ${activeTab === tab.id ? "bg-emerald-50 text-emerald-800" : "text-zinc-700 hover:bg-zinc-50"}`}>{tab.label}</button>)}
          <button type="button" onClick={() => { setActiveTab("customize"); setMobileMenuOpen(false); }} className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-bold text-white"><Compass className="h-4 w-4" /> 定制一日徒步</button>
        </nav>
      </div>}
    </header>
  );
}
