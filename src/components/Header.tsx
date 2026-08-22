import { Compass, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoginClick: () => void;
  username?: string;
  onLogout?: () => void;
}

export default function Header({ activeTab, setActiveTab, onLoginClick, username, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabs = [
    { id: "home", label: "首页" },
    { id: "about", label: "关于我们" },
    { id: "europe", label: "欧洲" },
    { id: "italy", label: "意大利" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Section: Login */}
        <div className="flex items-center gap-4">

          {username ? <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900" title={`已登录：${username}`}>
              <User className="h-4 w-4" />
              <span className="max-w-24 truncate">{username}</span>
            </div>
            <button onClick={onLogout} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" id="logout-btn">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline">退出登录</span>
            </button>
          </div> : <button
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              id="login-btn"
            >
              <User className="w-4 h-4" />
              <span>登录 / 注册</span>
            </button>}
        </div>

        {/* Right Section: Navigation & CTA */}
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
