import type { SortRule } from "./types";

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function matchPattern(url: string, rule: SortRule): boolean {
  const domain = extractDomain(url);
  return rule.patterns.some((p) => p.length > 0 && domain.includes(p));
}

export function findMatchingRule(url: string, rules: SortRule[]): SortRule | null {
  const sorted = [...rules]
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);
  return sorted.find((rule) => matchPattern(url, rule)) ?? null;
}
