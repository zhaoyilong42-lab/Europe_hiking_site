interface FooterProps {
  onNavClick: (tabId: string) => void;
}

export default function Footer({ onNavClick }: FooterProps) {
  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800 pt-16 pb-12" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {/* Left Column: Navigation links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6 border-b border-zinc-800 pb-3">服务导航</h3>
          <ul className="space-y-3.5 text-sm text-zinc-400">
            <li>
              <button
                onClick={() => onNavClick("europe")}
                className="hover:text-emerald-400 transition-colors text-left"
              >
                我们提供的徒步路线
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavClick("about")}
                className="hover:text-emerald-400 transition-colors text-left"
              >
                关于我们
              </button>
            </li>
            <li>
              <span className="text-zinc-500 cursor-default">合作团队与品牌 (CAI & UIMLA 支持)</span>
            </li>
            <li>
              <span className="text-zinc-500 cursor-default">参与者真实评价</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Contact info */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6 border-b border-zinc-800 pb-3">联系我们</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">微信:</span>
              <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded font-mono text-xs select-all">
                Ambition_1704
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">INSTAGRAM:</span>
              <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded font-mono text-xs select-all">
                yilong.zhao.00
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">抖音:</span>
              <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded font-mono text-xs select-all">
                77314052089
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">电子邮箱:</span>
              <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded font-mono text-xs select-all">
                zhaoyilong17@gmail.com
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">小红书:</span>
              <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded font-mono text-xs select-all">
                481740363
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright and Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800/80 pt-8 flex items-center text-xs text-zinc-500">
        <div>
          © 2026 欧洲徒步 (Europe Trekking) · 专注欧洲华人一日户外与山野探索
        </div>
      </div>
    </footer>
  );
}
