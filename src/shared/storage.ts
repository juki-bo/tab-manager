import type { StorageData, SortRule, GlobalSettings, ClosedTabRecord } from "./types";
import { DEFAULT_STORAGE } from "./types";

export async function getStorage(): Promise<StorageData> {
  const data = await chrome.storage.local.get(["rules", "globalSettings", "closedTabs"]);
  return {
    rules: data.rules ?? DEFAULT_STORAGE.rules,
    globalSettings: data.globalSettings ?? DEFAULT_STORAGE.globalSettings,
    closedTabs: data.closedTabs ?? DEFAULT_STORAGE.closedTabs,
  };
}

export async function getRules(): Promise<SortRule[]> {
  const data = await chrome.storage.local.get("rules");
  const rules: SortRule[] = data.rules ?? [];
  // Migrate old rules that have `pattern` (string) instead of `patterns` (string[])
  return rules.map((r) => {
    if (!Array.isArray((r as any).patterns)) {
      const legacy = r as any;
      return { ...r, patterns: legacy.pattern ? [legacy.pattern] : [] };
    }
    return r;
  });
}

export async function setRules(rules: SortRule[]): Promise<void> {
  await chrome.storage.local.set({ rules });
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const data = await chrome.storage.local.get("globalSettings");
  return data.globalSettings ?? DEFAULT_STORAGE.globalSettings;
}

export async function setGlobalSettings(settings: GlobalSettings): Promise<void> {
  await chrome.storage.local.set({ globalSettings: settings });
}

export async function getClosedTabs(): Promise<ClosedTabRecord[]> {
  const data = await chrome.storage.local.get("closedTabs");
  return data.closedTabs ?? [];
}

export async function addClosedTab(record: ClosedTabRecord): Promise<void> {
  const [closedTabs, settings] = await Promise.all([getClosedTabs(), getGlobalSettings()]);
  const updated = [record, ...closedTabs].slice(0, settings.maxHistoryEntries);
  await chrome.storage.local.set({ closedTabs: updated });
}

export async function clearClosedTabs(): Promise<void> {
  await chrome.storage.local.set({ closedTabs: [] });
}

export async function removeClosedTab(id: string): Promise<void> {
  const closedTabs = await getClosedTabs();
  await chrome.storage.local.set({ closedTabs: closedTabs.filter((t) => t.id !== id) });
}
