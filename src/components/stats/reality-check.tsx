import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/types";
import { formatMinutes } from "@/lib/time";

export function RealityCheck({ data }: { data: DashboardData }) {
  const target = data.settings?.daily_study_target_minutes ?? 180;
  const actual = data.todayStudyMinutes;
  const delta = actual - target;
  const blockRatio = `${data.productiveBlocks14d}:${data.wastedBlocks14d}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reality Check</CardTitle>
        <CardDescription>Planned work, actual behavior, and the pattern that keeps repeating.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs uppercase text-muted-foreground">Planned vs actual</p>
          <p className="font-mono text-lg">{formatMinutes(actual)} / {formatMinutes(target)}</p>
          <Badge variant={delta >= 0 ? "merit" : "warning"}>{delta >= 0 ? "+" : ""}{formatMinutes(Math.abs(delta))}</Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase text-muted-foreground">Productive vs wasted</p>
          <p className="font-mono text-lg">{blockRatio}</p>
          <Badge variant={data.wastedBlocks14d > data.productiveBlocks14d ? "demerit" : "merit"}>14-day blocks</Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase text-muted-foreground">Top excuse pattern</p>
          <p className="text-sm">{data.worstDistraction}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase text-muted-foreground">Frequent demerit source</p>
          <p className="text-sm">{data.worstDistraction}</p>
        </div>
      </CardContent>
    </Card>
  );
}

