export interface SortRule {
  id: string;
  enabled: boolean;
  name: string;
  patterns: string[];
  priority: number;
  targetWindowId?: number;
  targetGroupName?: string;
  targetGroupColor?: chrome.tabGroups.ColorEnum;
  autoCloseHours?: number;
}

export interface GlobalSettings {
  autoCloseHours: number;
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
  autoCloseHours: 0,
  maxHistoryEntries: 200,
};

export const DEFAULT_STORAGE: StorageData = {
  rules: [],
  globalSettings: DEFAULT_SETTINGS,
  closedTabs: [],
};
