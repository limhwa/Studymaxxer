import { redirect } from "next/navigation";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DaySummary } from "@/components/calendar/day-summary";
import { TimelineList } from "@/components/stats/timeline-list";
import { Badge } from "@/components/ui/badge";
import { getCalendarPageData, getCurrentUser } from "@/lib/server/queries";
import { parseDayParam } from "@/lib/time";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const selectedDay = parseDayParam(params.day);
  const data = await getCalendarPageData(user.id, selectedDay);
  const summary = data.dailySummaries.find((item) => item.day === selectedDay);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <Badge variant="outline">14-day review</Badge>
        <h1 className="mt-3 text-3xl font-semibold">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Older dates are intentionally hidden by UI and RLS.</p>
      </div>
      <CalendarGrid summaries={data.dailySummaries} selectedDay={data.selectedDay} />
      <DaySummary summary={summary} sessions={data.sessions} blocks={data.blocks} behaviors={data.behaviors} />
      <TimelineList sessions={data.sessions} blocks={data.blocks} behaviors={data.behaviors} points={data.points} />
    </div>
  );
}

