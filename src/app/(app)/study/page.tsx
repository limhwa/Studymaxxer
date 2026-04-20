import { redirect } from "next/navigation";
import { ManualSessionForm } from "@/components/study/manual-session-form";
import { StudyTimer } from "@/components/study/study-timer";
import { SubjectManager } from "@/components/study/subject-manager";
import { TimelineList } from "@/components/stats/timeline-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getStudyPageData } from "@/lib/server/queries";
import { formatMinutes } from "@/lib/time";

export default async function StudyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = await getStudyPageData(user.id);

  const bySubject = new Map<string, number>();
  for (const session of data.sessions) {
    const key = session.subject_name ?? "Unassigned";
    bySubject.set(key, (bySubject.get(key) ?? 0) + session.duration_minutes);
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <Badge variant="outline">YPT-style module</Badge>
        <h1 className="mt-3 text-3xl font-semibold">Study Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Time focused work, recover running sessions, and correct missed entries.</p>
      </div>
      <StudyTimer userId={user.id} subjects={data.subjects} initialRunningSession={data.runningSession} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <ManualSessionForm userId={user.id} subjects={data.subjects} />
        <Card>
          <CardHeader>
            <CardTitle>Recent Subject Totals</CardTitle>
            <CardDescription>Last 14 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...bySubject.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([subject, minutes]) => (
              <div key={subject} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm">{subject}</span>
                <span className="font-mono text-sm">{formatMinutes(minutes)}</span>
              </div>
            ))}
            {bySubject.size === 0 ? <p className="text-sm text-muted-foreground">No sessions yet.</p> : null}
          </CardContent>
        </Card>
      </div>
      <SubjectManager userId={user.id} subjects={data.subjects} />
      <TimelineList sessions={data.sessions.slice(0, 10)} blocks={[]} behaviors={[]} />
    </div>
  );
}

