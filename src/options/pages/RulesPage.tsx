import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight } from "lucide-react";
import { getRules, setRules } from "@/shared/storage";
import { matchPattern } from "@/shared/matching";
import type { SortRule, PatternType } from "@/shared/types";

const GROUP_COLORS: chrome.tabGroups.ColorEnum[] = [
  "grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange",
];

const COLOR_LABELS: Record<string, string> = {
  grey: "グレー", blue: "青", red: "赤", yellow: "黄", green: "緑",
  pink: "ピンク", purple: "紫", cyan: "シアン", orange: "オレンジ",
};

const COLOR_BG: Record<string, string> = {
  grey: "bg-gray-400", blue: "bg-blue-500", red: "bg-red-500", yellow: "bg-yellow-400",
  green: "bg-green-500", pink: "bg-pink-400", purple: "bg-purple-500",
  cyan: "bg-cyan-400", orange: "bg-orange-400",
};

type WindowInfo = { id: number; label: string };

const BLANK_RULE: Omit<SortRule, "id" | "priority"> = {
  enabled: true,
  name: "",
  pattern: "",
  patternType: "glob",
  targetWindowId: undefined,
  targetGroupName: "",
  targetGroupColor: "grey",
  autoCloseMinutes: undefined,
};

export default function RulesPage() {
  const [rules, setRulesState] = useState<SortRule[]>([]);
  const [editing, setEditing] = useState<SortRule | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [windows, setWindows] = useState<WindowInfo[]>([]);
  const [testUrl, setTestUrl] = useState("");

  useEffect(() => {
    getRules().then((r) => setRulesState(r.sort((a, b) => a.priority - b.priority)));
    chrome.windows.getAll().then((ws) =>
      setWindows(ws.map((w) => ({ id: w.id!, label: `ウィンドウ ${w.id}` })))
    );
  }, []);

  const save = async (updated: SortRule[]) => {
    const reindexed = updated.map((r, i) => ({ ...r, priority: i }));
    await setRules(reindexed);
    setRulesState(reindexed);
  };

  const openNew = () => {
    setEditing({ ...BLANK_RULE, id: crypto.randomUUID(), priority: rules.length });
    setIsNew(true);
  };

  const openEdit = (rule: SortRule) => {
    setEditing({ ...rule });
    setIsNew(false);
  };

  const closeEditor = () => {
    setEditing(null);
    setTestUrl("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const updated = isNew
      ? [...rules, editing]
      : rules.map((r) => (r.id === editing.id ? editing : r));
    await save(updated);
    closeEditor();
  };

  const deleteRule = async (id: string) => {
    await save(rules.filter((r) => r.id !== id));
  };

  const toggleEnabled = async (id: string) => {
    await save(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...rules];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    await save(next);
  };

  const testMatch = editing
    ? matchPattern(testUrl, editing)
    : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">ルール管理</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          ルールを追加
        </button>
      </div>

      {rules.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          ルールがありません。「ルールを追加」から作成してください。
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule, i) => (
          <div
            key={rule.id}
            className={`bg-white rounded-lg border px-4 py-3 flex items-start gap-3 ${
              rule.enabled ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            <div className="flex flex-col gap-0.5 mt-0.5">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === rules.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{rule.name || "無名ルール"}</span>
                <code className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded truncate max-w-xs">
                  {rule.pattern}
                </code>
                <span className="text-xs text-gray-400">{rule.patternType}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                {rule.targetGroupName && (
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${COLOR_BG[rule.targetGroupColor ?? "grey"]}`} />
                    グループ: {rule.targetGroupName}
                  </span>
                )}
                {rule.targetWindowId != null && (
                  <span>ウィンドウ: {rule.targetWindowId}</span>
                )}
                {(rule.autoCloseMinutes ?? 0) > 0 && (
                  <span>自動クローズ: {rule.autoCloseMinutes} 分</span>
                )}
                {(rule.autoCloseMinutes ?? 0) === 0 && !rule.targetGroupName && !rule.targetWindowId && (
                  <span className="text-gray-300">振り分け先なし</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleEnabled(rule.id)} className="text-gray-400 hover:text-blue-500 transition-colors">
                {rule.enabled
                  ? <ToggleRight className="w-5 h-5 text-blue-500" />
                  : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => openEdit(rule)} className="text-gray-400 hover:text-gray-600">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteRule(rule.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {isNew ? "ルールを追加" : "ルールを編集"}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <Field label="ルール名">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="例: GitHub"
                  className={INPUT}
                />
              </Field>

              <Field label="パターン">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editing.pattern}
                    onChange={(e) => setEditing({ ...editing, pattern: e.target.value })}
                    placeholder="例: *://github.com/**"
                    className={`${INPUT} flex-1`}
                  />
                  <select
                    value={editing.patternType}
                    onChange={(e) => setEditing({ ...editing, patternType: e.target.value as PatternType })}
                    className={`${INPUT} w-28`}
                  >
                    <option value="glob">glob</option>
                    <option value="regex">regex</option>
                  </select>
                </div>
              </Field>

              <Field label="テスト URL">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className={`${INPUT} flex-1`}
                  />
                  {testUrl && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${testMatch ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {testMatch ? "マッチ" : "不一致"}
                    </span>
                  )}
                </div>
              </Field>

              <Field label="移動先ウィンドウ（任意）">
                <select
                  value={editing.targetWindowId ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      targetWindowId: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className={INPUT}
                >
                  <option value="">なし</option>
                  {windows.map((w) => (
                    <option key={w.id} value={w.id}>{w.label}</option>
                  ))}
                </select>
                {editing.targetWindowId != null && !windows.some((w) => w.id === editing.targetWindowId) && (
                  <p className="text-xs text-amber-600 mt-1">
                    このウィンドウは現在開いていません。ブラウザ再起動後に無効になる可能性があります。
                  </p>
                )}
              </Field>

              <Field label="タブグループ名（任意）">
                <input
                  type="text"
                  value={editing.targetGroupName ?? ""}
                  onChange={(e) => setEditing({ ...editing, targetGroupName: e.target.value })}
                  placeholder="例: dev"
                  className={INPUT}
                />
              </Field>

              {editing.targetGroupName && (
                <Field label="グループカラー">
                  <div className="flex gap-2 flex-wrap">
                    {GROUP_COLORS.map((c) => (
                      <button
                        key={c}
                        title={COLOR_LABELS[c]}
                        onClick={() => setEditing({ ...editing, targetGroupColor: c })}
                        className={`w-6 h-6 rounded-full ${COLOR_BG[c]} transition-transform ${editing.targetGroupColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                      />
                    ))}
                  </div>
                </Field>
              )}

              <Field label="自動クローズ（分、0で無効）">
                <input
                  type="number"
                  min={0}
                  value={editing.autoCloseMinutes ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      autoCloseMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="グローバル設定を使用"
                  className={INPUT}
                />
              </Field>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={closeEditor} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                キャンセル
              </button>
              <button
                onClick={saveEdit}
                disabled={!editing.pattern}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
