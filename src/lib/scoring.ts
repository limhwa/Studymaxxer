import type { UserSettings } from "@/lib/types";

export type DailyStatus = "elite" | "strong" | "acceptable" | "weak" | "failing";

export function getDailyStatus(netScore: number, settings?: UserSettings | null): DailyStatus {
  const thresholds = {
    elite: settings?.elite_min_score ?? 8,
    strong: settings?.strong_min_score ?? 4,
    acceptable: settings?.acceptable_min_score ?? 0,
    weak: settings?.weak_min_score ?? -5,
  };

  if (netScore >= thresholds.elite) return "elite";
  if (netScore >= thresholds.strong) return "strong";
  if (netScore >= thresholds.acceptable) return "acceptable";
  if (netScore >= thresholds.weak) return "weak";
  return "failing";
}

export function statusTone(status: DailyStatus) {
  switch (status) {
    case "elite":
      return "text-[var(--color-merit)]";
    case "strong":
      return "text-primary";
    case "acceptable":
      return "text-[var(--color-info)]";
    case "weak":
      return "text-[var(--color-warning)]";
    case "failing":
      return "text-[var(--color-demerit)]";
  }
}

export function signedPoints(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

