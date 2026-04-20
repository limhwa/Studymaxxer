import { Award, Clock3, Flame, Gauge, Target, TimerReset, TriangleAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { NotificationPermission } from "@/components/app/notification-permission";
import { MetricCard } from "@/components/stats/metric-card";
import { RealityCheck } from "@/components/stats/reality-check";
import { TimelineList } from "@/components/stats/timeline-list";
import { TrendLine } from "@/components/stats/trend-line";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardData, getCurrentUser } from "@/lib/server/queries";
import { formatMinutes } from "@/lib/time";
import { getDailyStatus, signedPoints, statusTone } from "@/lib/scoring";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);
  const status = getDailyStatus(data.todayNet, data.settings);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="outline">Last 14 days only</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Study, activity, behavior, and score all in one place.
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs uppercase text-muted-foreground">Daily status</p>
          <p className={`font-mono text-2xl font-semibold ${statusTone(status)}`}>{status}</p>
        </div>
      </div>

      <NotificationPermission settings={data.settings} />

      <section className="grid metric-grid gap-4">
        <MetricCard label="Today study" value={formatMinutes(data.todayStudyMinutes)} detail="Timer and manual sessions" icon={<TimerReset className="h-4 w-4" />} tone="good" />
        <MetricCard label="Net score" value={signedPoints(data.todayNet)} detail={`${signedPoints(data.todayMerits)} merits · ${signedPoints(data.todayDemerits)} demerits`} icon={<Gauge className="h-4 w-4" />} tone={data.todayNet >= 0 ? "good" : "bad"} />
        <MetricCard label="Missed logs" value={String(data.missedBlocksToday)} detail="Expected 3-hour check-ins today" icon={<TriangleAlert className="h-4 w-4" />} tone={data.missedBlocksToday > 0 ? "warning" : "good"} />
        <MetricCard label="7-day study" value={formatMinutes(data.sevenDayStudyMinutes)} detail={`${signedPoints(data.sevenDayNet)} net points`} icon={<Clock3 className="h-4 w-4" />} tone="info" />
        <MetricCard label="Productivity" value={`${data.todayProductivity || 0}/5`} detail="Average logged blocks today" icon={<Target className="h-4 w-4" />} tone="info" />
        <MetricCard label="Discipline" value={`${data.todayDiscipline || 0}/5`} detail="Average logged blocks today" icon={<Award className="h-4 w-4" />} tone="good" />
        <MetricCard label="Completion rate" value={`${data.completionRate14d}%`} detail="Logged blocks over expected blocks" icon={<Flame className="h-4 w-4" />} tone={data.completionRate14d >= 80 ? "good" : "warning"} />
      </section>

      {data.runningSession ? (
        <Card className="border-primary/50">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">Timer running</p>
              <p className="text-sm text-muted-foreground">
                {data.runningSession.subject_name ?? "Unassigned"} started at{" "}
                {new Date(data.runningSession.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <a className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" href="/study">
              Open timer
            </a>
          </CardContent>
        </Card>
      ) : null}

      <RealityCheck data={data} />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>14-Day Trend</CardTitle>
            <CardDescription>Study hours and net accountability score.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendLine data={data.dailySummaries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patterns</CardTitle>
            <CardDescription>Most visible signals in the recent window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Strongest subject</p>
              <p className="mt-1 text-sm">{data.mostUsedSubject}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Most common bad behavior</p>
              <p className="mt-1 text-sm">{data.worstDistraction}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Productive ratio</p>
              <p className="mt-1 font-mono text-sm">{data.productiveBlocks14d} productive / {data.wastedBlocks14d} wasted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TimelineList
        sessions={data.recentSessions}
        blocks={data.recentBlocks}
        behaviors={data.recentBehaviors}
        points={data.recentPoints}
      />
    </div>
  );
}

