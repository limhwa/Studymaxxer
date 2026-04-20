import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { DailySummary } from "@/lib/types";
import { formatMinutes, last14Days } from "@/lib/time";
import { cn } from "@/lib/utils";

export function CalendarGrid({
  summaries,
  selectedDay,
}: {
  summaries: DailySummary[];
  selectedDay: string;
}) {
  const byDay = new Map(summaries.map((summary) => [summary.day, summary]));

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
      {last14Days().map((day) => {
        const summary = byDay.get(day.iso);
        const productivity = summary?.avg_productivity ?? 0;
        const tone =
          productivity >= 4
            ? "border-[var(--color-merit)]"
            : productivity > 0 && productivity <= 2
              ? "border-[var(--color-demerit)]"
              : "border-border";

        return (
          <Link
            key={day.iso}
            href={`/calendar?day=${day.iso}`}
            className={cn(
              "min-h-36 rounded-lg border bg-card p-4 transition-colors hover:bg-secondary",
              tone,
              selectedDay === day.iso && "ring-2 ring-ring",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{day.label}</p>
              {day.label === "Today" || day.label === "Yesterday" ? <Badge variant="outline">{day.label}</Badge> : null}
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p><span className="font-mono text-foreground">{formatMinutes(summary?.study_minutes ?? 0)}</span> study</p>
              <p><span className="font-mono text-foreground">{summary?.net_points ?? 0}</span> net points</p>
              <p><span className="font-mono text-foreground">{summary?.logged_blocks ?? 0}</span> blocks logged</p>
              {(summary?.wasted_blocks ?? 0) > 0 ? <Badge variant="demerit">{summary?.wasted_blocks} wasted</Badge> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

