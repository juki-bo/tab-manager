import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getGlobalSettings, setGlobalSettings } from "@/shared/storage";
import type { GlobalSettings } from "@/shared/types";
import { DEFAULT_SETTINGS } from "@/shared/types";

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getGlobalSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    await setGlobalSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">グローバル設定</h1>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <SettingRow
          label="自動クローズ時間（分）"
          description="タブが開かれてから自動で閉じるまでの時間。0 で無効。ルールに個別設定がある場合はそちらが優先されます。"
        >
          <input
            type="number"
            min={0}
            value={settings.autoCloseMinutes}
            onChange={(e) =>
              setSettings({ ...settings, autoCloseMinutes: parseInt(e.target.value) || 0 })
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </SettingRow>

        <SettingRow
          label="最大履歴保存件数"
          description="自動クローズ履歴を最大何件保存するか。上限を超えた古い記録から削除されます。"
        >
          <input
            type="number"
            min={1}
            max={1000}
            value={settings.maxHistoryEntries}
            onChange={(e) =>
              setSettings({ ...settings, maxHistoryEntries: parseInt(e.target.value) || 200 })
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </SettingRow>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">保存しました</span>
        )}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5 max-w-sm">{description}</div>
      </div>
      {children}
    </div>
  );
}
