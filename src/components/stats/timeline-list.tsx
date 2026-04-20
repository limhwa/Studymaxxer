import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityBlock, BehaviorLog, PointsTransaction, StudySession } from "@/lib/types";
import { formatMinutes } from "@/lib/time";
import { signedPoints } from "@/lib/scoring";

type TimelineListProps = {
  sessions: StudySession[];
  blocks: ActivityBlock[];
  behaviors: BehaviorLog[];
  points?: PointsTransaction[];
};

export function TimelineList({ sessions, blocks, behaviors, points = [] }: TimelineListProps) {
  const items = [
    ...sessions.map((session) => ({
      id: `session-${session.id}`,
      time: session.start_time,
      type: "Study",
      title: session.session_title || session.subject_name || "Study session",
      detail: `${formatMinutes(session.duration_minutes)}${session.focus_rating ? ` · focus ${session.focus_rating}/5` : ""}`,
      color: session.subject_color,
      badge: session.session_mode,
    })),
    ...blocks.map((block) => ({
      id: `block-${block.id}`,
      time: block.block_start_time,
      type: "Block",
      title: block.short_summary,
      detail: `${block.primary_activity_type.replace("_", " ")} · productivity ${block.productivity_rating}/5 · discipline ${block.discipline_rating}/5`,
      color: null,
      badge: block.wasted_minutes >= 120 ? "wasted" : "logged",
    })),
    ...behaviors.map((behavior) => ({
      id: `behavior-${behavior.id}`,
      time: behavior.event_time,
      type: "Behavior",
      title: behavior.behavior_name_snapshot,
      detail: behavior.note || behavior.category_snapshot,
      color: null,
      badge: signedPoints(behavior.points_delta),
    })),
    ...points.map((point) => ({
      id: `point-${point.id}`,
      time: point.created_at,
      type: "Points",
      title: point.reason,
      detail: point.source_type.replace("_", " "),
      color: null,
      badge: signedPoints(point.points_value),
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Timeline</CardTitle>
        <CardDescription>Study sessions, block logs, behavior events, and score changes.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent entries yet. Start with a study timer or log the last block.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 14).map((item) => (
              <div key={item.id} className="grid grid-cols-[84px_1fr_auto] gap-3 rounded-md border p-3">
                <p className="font-mono text-xs text-muted-foreground">{format(new Date(item.time), "MMM d HH:mm")}</p>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {item.color ? (
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    ) : null}
                    <p className="truncate text-sm font-medium">{item.title}</p>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{item.type} · {item.detail}</p>
                </div>
                <Badge variant={String(item.badge).startsWith("-") || item.badge === "wasted" ? "demerit" : "default"}>
                  {item.badge}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

