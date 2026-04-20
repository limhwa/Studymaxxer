import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityBlock, BehaviorLog, DailySummary, StudySession } from "@/lib/types";
import { formatMinutes } from "@/lib/time";
import { signedPoints } from "@/lib/scoring";

export function DaySummary({
  summary,
  sessions,
  blocks,
  behaviors,
}: {
  summary?: DailySummary;
  sessions: StudySession[];
  blocks: ActivityBlock[];
  behaviors: BehaviorLog[];
}) {
  const topSubject = sessions.reduce<Record<string, number>>((acc, session) => {
    const key = session.subject_name ?? "Unassigned";
    acc[key] = (acc[key] ?? 0) + session.duration_minutes;
    return acc;
  }, {});
  const topSubjectName = Object.entries(topSubject).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No study";
  const topDistraction = behaviors
    .filter((behavior) => behavior.points_delta < 0)
    .reduce<Record<string, number>>((acc, behavior) => {
      acc[behavior.behavior_name_snapshot] = (acc[behavior.behavior_name_snapshot] ?? 0) + 1;
      return acc;
    }, {});
  const topDistractionName = Object.entries(topDistraction).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No demerits";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
        <CardDescription>Study, quality, points, subjects, and recurring friction.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Study</p>
          <p className="mt-1 font-mono text-xl">{formatMinutes(summary?.study_minutes ?? 0)}</p>
          <p className="text-xs text-muted-foreground">{topSubjectName}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Quality</p>
          <p className="mt-1 font-mono text-xl">{summary?.avg_productivity ?? 0}/5</p>
          <p className="text-xs text-muted-foreground">discipline {summary?.avg_discipline ?? 0}/5 · {blocks.length} blocks</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Points</p>
          <p className="mt-1 font-mono text-xl">{signedPoints(summary?.net_points ?? 0)}</p>
          <p className="text-xs text-muted-foreground">{signedPoints(summary?.merits ?? 0)} merits · {signedPoints(summary?.demerits ?? 0)} demerits</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Friction</p>
          <p className="mt-1 text-sm">{topDistractionName}</p>
          {(summary?.wasted_blocks ?? 0) > 0 ? <Badge className="mt-2" variant="demerit">{summary?.wasted_blocks} wasted blocks</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}
