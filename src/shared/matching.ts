import type { SortRule } from "./types";

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "§DOUBLE§")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".")
    .replace(/§DOUBLE§/g, ".*");
  return new RegExp(`^${escaped}$`);
}

export function matchPattern(url: string, rule: SortRule): boolean {
  try {
    const regex =
      rule.patternType === "regex" ? new RegExp(rule.pattern) : globToRegex(rule.pattern);
    return regex.test(url);
  } catch {
    return false;
  }
}

export function findMatchingRule(url: string, rules: SortRule[]): SortRule | null {
  const sorted = [...rules]
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);
  return sorted.find((rule) => matchPattern(url, rule)) ?? null;
}
