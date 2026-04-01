import { useEffect, useState } from "react";
import { List, Settings, History } from "lucide-react";
import RulesPage from "./pages/RulesPage";
import GlobalSettingsPage from "./pages/GlobalSettingsPage";
import HistoryPage from "./pages/HistoryPage";

type Tab = "rules" | "settings" | "history";

const TABS: { id: Tab; label: string; icon: typeof List }[] = [
  { id: "rules", label: "ルール", icon: List },
  { id: "settings", label: "グローバル設定", icon: Settings },
  { id: "history", label: "履歴", icon: History },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("rules");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as Tab;
    if (hash && TABS.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-1 h-14">
            <span className="font-semibold text-gray-900 mr-6 text-base">Tab Manager</span>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === "rules" && <RulesPage />}
        {activeTab === "settings" && <GlobalSettingsPage />}
        {activeTab === "history" && <HistoryPage />}
      </main>
    </div>
  );
}
