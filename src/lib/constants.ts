import type { ActivityType, BehaviorCategory, BehaviorSeverity } from "@/lib/types";

export const activityTypes: { value: ActivityType; label: string }[] = [
  { value: "studying", label: "Studying" },
  { value: "classes", label: "Classes" },
  { value: "homework", label: "Homework" },
  { value: "revision", label: "Revision" },
  { value: "reading", label: "Reading" },
  { value: "exercise", label: "Exercise" },
  { value: "chores", label: "Chores" },
  { value: "leisure", label: "Leisure" },
  { value: "social", label: "Social" },
  { value: "sleep", label: "Sleep" },
  { value: "commute", label: "Commute" },
  { value: "screen_time", label: "Screen time" },
  { value: "procrastination", label: "Procrastination" },
  { value: "mixed", label: "Mixed" },
  { value: "other", label: "Other" },
];

export const behaviorCategories: BehaviorCategory[] = [
  "distraction",
  "discipline",
  "consistency",
  "focus",
  "health",
  "sleep",
  "planning",
  "productivity",
  "conduct",
  "other",
];

export const severityLabels: Record<BehaviorSeverity, string> = {
  minor: "Minor",
  moderate: "Moderate",
  major: "Major",
};

export const reminderMessages = [
  "Log the last 3 hours. What did you actually do?",
  "Time to record your previous 3 hours.",
  "Quick check-in: how were the last 3 hours spent?",
  "Log study, activity, and behavior for the last 3 hours.",
];

export const defaultSubjectColors = [
  "#14b8a6",
  "#22c55e",
  "#38bdf8",
  "#f59e0b",
  "#ef4444",
  "#a3e635",
];

