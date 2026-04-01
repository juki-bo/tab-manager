export type PatternType = "glob" | "regex";

export interface SortRule {
  id: string;
  enabled: boolean;
  name: string;
  pattern: string;
  patternType: PatternType;
  priority: number;
  targetWindowId?: number;
  targetGroupName?: string;
  targetGroupColor?: chrome.tabGroups.ColorEnum;
  autoCloseMinutes?: number;
}

export interface GlobalSettings {
  autoCloseMinutes: number;
  maxHistoryEntries: number;
}

export interface ClosedTabRecord {
  id: string;
  url: string;
  title: string;
  faviconUrl?: string;
  closedAt: number;
  closedByRuleId?: string;
}

export interface StorageData {
  rules: SortRule[];
  globalSettings: GlobalSettings;
  closedTabs: ClosedTabRecord[];
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  autoCloseMinutes: 0,
  maxHistoryEntries: 200,
};

export const DEFAULT_STORAGE: StorageData = {
  rules: [],
  globalSettings: DEFAULT_SETTINGS,
  closedTabs: [],
};
