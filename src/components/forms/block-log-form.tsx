"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { activityTypes } from "@/lib/constants";
import { createClient } from "@/lib/supabase/browser";
import type { ActivityBlock, ActivityType, StudySession } from "@/lib/types";
import { minutesBetween } from "@/lib/time";

function inputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function overlapMinutes(session: StudySession, start: Date, end: Date) {
  const sessionStart = new Date(session.start_time);
  const sessionEnd = session.end_time ? new Date(session.end_time) : new Date();
  const overlapStart = Math.max(sessionStart.getTime(), start.getTime());
  const overlapEnd = Math.min(sessionEnd.getTime(), end.getTime());
  return Math.max(0, Math.round((overlapEnd - overlapStart) / 60_000));
}

export function BlockLogForm({
  userId,
  initialStart,
  initialEnd,
  sessions,
  recentBlocks,
}: {
  userId: string;
  initialStart: Date;
  initialEnd: Date;
  sessions: StudySession[];
  recentBlocks: ActivityBlock[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [start, setStart] = useState(inputDate(initialStart));
  const [end, setEnd] = useState(inputDate(initialEnd));
  const [primary, setPrimary] = useState<ActivityType>("studying");
  const [secondary, setSecondary] = useState("");
  const [productivity, setProductivity] = useState("4");
  const [discipline, setDiscipline] = useState("4");
  const [mood, setMood] = useState("");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [wasted, setWasted] = useState("0");
  const [status, setStatus] = useState<string | null>(null);

  const computedStudyMinutes = useMemo(() => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return sessions.reduce((total, session) => total + overlapMinutes(session, startDate, endDate), 0);
  }, [end, sessions, start]);

  async function save() {
    setStatus(null);
    const startDate = new Date(start);
    const endDate = new Date(end);
    const blockMinutes = minutesBetween(startDate, endDate);
    if (blockMinutes <= 0) {
      setStatus("End time must be after start time.");
      return;
    }
    if (wordCount(summary) < 6) {
      setStatus("Write a short reality summary. Aim for 10-15 words.");
      return;
    }

    const { error } = await supabase.from("activity_blocks").upsert(
      {
        user_id: userId,
        block_start_time: startDate.toISOString(),
        block_end_time: endDate.toISOString(),
        primary_activity_type: primary,
        secondary_activity_type: secondary || null,
        productivity_rating: Number(productivity),
        discipline_rating: Number(discipline),
        mood: mood || null,
        short_summary: summary,
        detailed_note: detail || null,
        study_minutes: computedStudyMinutes,
        wasted_minutes: Number(wasted || 0),
      },
      { onConflict: "user_id,block_start_time,block_end_time" },
    );

    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Block logged.");
    window.location.reload();
  }

  const words = wordCount(summary);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Log Previous 3 Hours</CardTitle>
          <CardDescription>Fast entry for what actually happened. Missed logs are allowed inside the 14-day window.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Block start</Label>
              <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Block end</Label>
              <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Main activity</Label>
              <Select value={primary} onChange={(event) => setPrimary(event.target.value as ActivityType)}>
                {activityTypes.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Secondary activity</Label>
              <Input value={secondary} onChange={(event) => setSecondary(event.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Productivity</Label>
              <Select value={productivity} onChange={(event) => setProductivity(event.target.value)}>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}/5</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discipline</Label>
              <Select value={discipline} onChange={(event) => setDiscipline(event.target.value)}>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}/5</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Study minutes</Label>
              <Input value={computedStudyMinutes} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Wasted minutes</Label>
              <Input type="number" min={0} value={wasted} onChange={(event) => setWasted(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>10-15 word summary</Label>
              <Badge variant={words >= 10 && words <= 15 ? "merit" : "warning"}>{words} words</Badge>
            </div>
            <Input
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Revised calculus, got distracted twice, then finished chemistry notes."
            />
          </div>
          <div className="space-y-2">
            <Label>Mood</Label>
            <Input value={mood} onChange={(event) => setMood(event.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label>Detailed note</Label>
            <Textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Optional context, excuses, or correction." />
          </div>
          <Button type="button" onClick={save}>Save block</Button>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Blocks</CardTitle>
          <CardDescription>Latest logged windows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentBlocks.map((block) => (
            <div key={block.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(block.block_start_time), "MMM d HH:mm")} - {format(new Date(block.block_end_time), "HH:mm")}
                </p>
                <Badge variant={block.productivity_rating <= 2 ? "demerit" : "default"}>{block.productivity_rating}/5</Badge>
              </div>
              <p className="mt-2 text-sm">{block.short_summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">{block.study_minutes} study min · {block.wasted_minutes} wasted min</p>
            </div>
          ))}
          {recentBlocks.length === 0 ? <p className="text-sm text-muted-foreground">No block logs yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

