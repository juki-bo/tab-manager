import { useEffect, useState } from "react";
import { Settings, History, Power } from "lucide-react";
import { getStorage } from "@/shared/storage";
import type { StorageData } from "@/shared/types";

export default function Popup() {
  const [data, setData] = useState<StorageData | null>(null);

  useEffect(() => {
    getStorage().then(setData);
  }, []);

  const openOptions = async (tab?: string) => {
    const optionsBase = chrome.runtime.getURL("src/options/index.html");
    const existing = await chrome.tabs.query({ url: `${optionsBase}*` });
    if (existing.length > 0 && existing[0].id != null) {
      await chrome.tabs.update(existing[0].id, { active: true });
      if (existing[0].windowId != null) {
        await chrome.windows.update(existing[0].windowId, { focused: true });
      }
      if (tab) {
        await chrome.tabs.sendMessage(existing[0].id, { type: "navigate", tab });
      }
    } else {
      const url = tab ? `${optionsBase}#${tab}` : optionsBase;
      await chrome.tabs.create({ url });
    }
    window.close();
  };

  const activeRules = data?.rules.filter((r) => r.enabled).length ?? 0;
  const autoClose = data?.globalSettings.autoCloseMinutes ?? 0;
  const historyCount = data?.closedTabs.length ?? 0;

  return (
    <div className="w-64 bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Power className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-gray-800 text-sm">Tab Manager</span>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">有効なルール</span>
          <span className="font-medium text-gray-800">{activeRules} 件</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">自動クローズ</span>
          <span className="font-medium text-gray-800">
            {autoClose > 0 ? `${autoClose} 分` : "無効"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">クローズ履歴</span>
          <span className="font-medium text-gray-800">{historyCount} 件</span>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-1.5">
        <button
          onClick={() => openOptions("rules")}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          設定を開く
        </button>
        <button
          onClick={() => openOptions("history")}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <History className="w-4 h-4 text-gray-400" />
          履歴を見る
        </button>
      </div>
    </div>
  );
}
