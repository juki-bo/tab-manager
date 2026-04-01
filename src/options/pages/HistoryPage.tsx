import { useEffect, useState, useMemo } from "react";
import { ExternalLink, Trash2, RotateCcw, Search, X } from "lucide-react";
import { getClosedTabs, clearClosedTabs, removeClosedTab } from "@/shared/storage";
import type { ClosedTabRecord } from "@/shared/types";

const PAGE_SIZE = 30;

export default function HistoryPage() {
  const [records, setRecords] = useState<ClosedTabRecord[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setRecords(await getClosedTabs());
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return records;
    const q = query.toLowerCase();
    return records.filter(
      (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
    );
  }, [records, query]);

  const paged = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > paged.length;

  const reopen = (url: string) => {
    chrome.tabs.create({ url });
  };

  const reopenAll = () => {
    paged.forEach((r) => chrome.tabs.create({ url: r.url }));
  };

  const remove = async (id: string) => {
    await removeClosedTab(id);
    await load();
  };

  const clearAll = async () => {
    if (!confirm("履歴をすべて削除しますか？")) return;
    await clearClosedTabs();
    await load();
  };

  const fmt = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          履歴
          {records.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">{records.length} 件</span>
          )}
        </h1>
        {records.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            すべて削除
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          自動クローズされたタブはありません。
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="タイトルやURLで検索"
                className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {paged.length > 0 && (
              <button
                onClick={reopenAll}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                表示中を再オープン
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">検索結果がありません。</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50 overflow-hidden">
              {paged.map((record) => (
                <div key={record.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                  {record.faviconUrl ? (
                    <img src={record.faviconUrl} alt="" className="w-4 h-4 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <div className="w-4 h-4 rounded-sm bg-gray-200 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{record.title}</div>
                    <div className="text-xs text-gray-400 truncate">{record.url}</div>
                  </div>

                  <div className="text-xs text-gray-300 shrink-0">{fmt(record.closedAt)}</div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => reopen(record.url)}
                      title="再オープン"
                      className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(record.id)}
                      title="削除"
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                もっと見る ({filtered.length - paged.length} 件)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
