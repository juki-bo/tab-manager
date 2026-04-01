import { findMatchingRule } from "@/shared/matching";
import {
  getRules,
  getGlobalSettings,
  addClosedTab,
} from "@/shared/storage";
import { DEFAULT_STORAGE } from "@/shared/types";
import type { SortRule } from "@/shared/types";

const ALARM_PREFIX = "autoclose_";
const SWEEP_ALARM = "periodic_sweep";

// ─── Initialization ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(["rules", "globalSettings", "closedTabs"]);
  const toSet: Record<string, unknown> = {};
  if (!data.rules) toSet.rules = DEFAULT_STORAGE.rules;
  if (!data.globalSettings) toSet.globalSettings = DEFAULT_STORAGE.globalSettings;
  if (!data.closedTabs) toSet.closedTabs = DEFAULT_STORAGE.closedTabs;
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }
  await chrome.alarms.create(SWEEP_ALARM, { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(async () => {
  const existing = await chrome.alarms.get(SWEEP_ALARM);
  if (!existing) {
    await chrome.alarms.create(SWEEP_ALARM, { periodInMinutes: 1 });
  }
});

// ─── Tab event handlers ────────────────────────────────────────────────────

chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.url && tab.id != null) {
    await processTab(tab.id, tab.url);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.url) {
    await chrome.alarms.clear(`${ALARM_PREFIX}${tabId}`);
    await processTab(tabId, tab.url);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await chrome.alarms.clear(`${ALARM_PREFIX}${tabId}`);
});

// ─── Alarm handler ─────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SWEEP_ALARM) {
    await periodicSweep();
    return;
  }
  if (alarm.name.startsWith(ALARM_PREFIX)) {
    const tabId = parseInt(alarm.name.slice(ALARM_PREFIX.length), 10);
    await handleAutoClose(tabId);
  }
});

// ─── Core logic ────────────────────────────────────────────────────────────

async function processTab(tabId: number, url: string): Promise<void> {
  if (!url || url.startsWith("chrome://") || url.startsWith("chrome-extension://")) return;

  const [rules, globalSettings] = await Promise.all([getRules(), getGlobalSettings()]);
  const rule = findMatchingRule(url, rules);

  if (rule) {
    await applyRule(tabId, rule);
  }

  const closeMinutes = rule?.autoCloseMinutes ?? globalSettings.autoCloseMinutes;
  if (closeMinutes > 0) {
    await chrome.alarms.create(`${ALARM_PREFIX}${tabId}`, {
      delayInMinutes: closeMinutes,
    });
  }
}

async function applyRule(tabId: number, rule: SortRule): Promise<void> {
  if (rule.targetWindowId != null) {
    try {
      await chrome.tabs.move(tabId, { windowId: rule.targetWindowId, index: -1 });
    } catch {
      // window may no longer exist
    }
  }

  if (rule.targetGroupName) {
    try {
      // 全ウィンドウから同名グループを探す（重複グループを作らないため）
      const allGroups = await chrome.tabGroups.query({ title: rule.targetGroupName });

      let groupId: number;
      if (allGroups.length > 0) {
        // 既存グループが見つかったらそのウィンドウにタブを移動してから追加
        const existingGroup = allGroups[0];
        if (rule.targetWindowId == null) {
          // windowId 指定がない場合のみ、グループのあるウィンドウへ追従
          await chrome.tabs.move(tabId, { windowId: existingGroup.windowId, index: -1 });
        }
        groupId = existingGroup.id;
      } else {
        // どのウィンドウにも存在しない場合は現在のウィンドウに新規作成
        const tab = await chrome.tabs.get(tabId);
        groupId = await chrome.tabs.group({ tabIds: tabId, createProperties: { windowId: tab.windowId } });
        await chrome.tabGroups.update(groupId, {
          title: rule.targetGroupName,
          color: rule.targetGroupColor ?? "grey",
        });
      }
      await chrome.tabs.group({ tabIds: tabId, groupId });
    } catch {
      // group operation may fail if tab moved to different window
    }
  }
}

async function handleAutoClose(tabId: number): Promise<void> {
  let tab: chrome.tabs.Tab;
  try {
    tab = await chrome.tabs.get(tabId);
  } catch {
    return; // tab already closed
  }

  if (!tab.url || !tab.id) return;

  const rules = await getRules();
  const rule = findMatchingRule(tab.url, rules);

  await addClosedTab({
    id: crypto.randomUUID(),
    url: tab.url,
    title: tab.title ?? tab.url,
    faviconUrl: tab.favIconUrl,
    closedAt: Date.now(),
    closedByRuleId: rule?.id,
  });

  await chrome.tabs.remove(tabId);
}

async function periodicSweep(): Promise<void> {
  const alarms = await chrome.alarms.getAll();
  const autoCloseAlarms = alarms.filter((a) => a.name.startsWith(ALARM_PREFIX));

  for (const alarm of autoCloseAlarms) {
    const tabId = parseInt(alarm.name.slice(ALARM_PREFIX.length), 10);
    try {
      await chrome.tabs.get(tabId);
    } catch {
      await chrome.alarms.clear(alarm.name);
    }
  }
}
