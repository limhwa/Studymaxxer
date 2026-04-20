"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/browser";
import type { StudySession, Subject } from "@/lib/types";
import { formatMinutes, minutesBetween } from "@/lib/time";

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":");
}

export function StudyTimer({
  userId,
  subjects,
  initialRunningSession,
}: {
  userId: string;
  subjects: Subject[];
  initialRunningSession: StudySession | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [runningSession, setRunningSession] = useState(initialRunningSession);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [focusRating, setFocusRating] = useState("4");
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    initialRunningSession
      ? Math.floor((Date.now() - new Date(initialRunningSession.start_time).getTime()) / 1000)
      : 0,
  );
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!runningSession || isPaused) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(runningSession.start_time).getTime()) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [runningSession, isPaused]);

  async function startTimer() {
    setStatus(null);
    const subject = subjects.find((item) => item.id === subjectId);
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        user_id: userId,
        subject_id: subject?.id ?? null,
        subject_name: subject?.name ?? null,
        subject_color: subject?.color ?? null,
        session_title: title || null,
        start_time: new Date().toISOString(),
        session_mode: "timer",
        duration_minutes: 0,
      })
      .select()
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }

    setRunningSession(data as StudySession);
    setElapsedSeconds(0);
  }

  async function stopTimer() {
    if (!runningSession) return;
    const endTime = new Date();
    const duration = minutesBetween(runningSession.start_time, endTime);
    const { error } = await supabase
      .from("study_sessions")
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: duration,
        focus_rating: Number(focusRating),
        note: note || runningSession.note,
      })
      .eq("id", runningSession.id)
      .eq("user_id", userId);

    if (error) {
      setStatus(error.message);
      return;
    }

    setRunningSession(null);
    setElapsedSeconds(0);
    setNote("");
    setStatus(`Logged ${formatMinutes(duration)}.`);
    window.location.reload();
  }

  return (
    <Card className={runningSession ? "border-primary/60" : undefined}>
      <CardHeader>
        <CardTitle>Live Study Timer</CardTitle>
        <CardDescription>
          Start a YPT-style focused session. A running timer recovers after refresh.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-background p-5 text-center">
          <p className="text-sm text-muted-foreground">
            {runningSession ? runningSession.subject_name ?? "Unassigned subject" : "Ready"}
          </p>
          <p className="mt-2 font-mono text-5xl font-semibold">{formatElapsed(elapsedSeconds)}</p>
          {runningSession ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Started {new Date(runningSession.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          ) : null}
        </div>

        {runningSession ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="focusRating">Focus rating</Label>
                <Select id="focusRating" value={focusRating} onChange={(event) => setFocusRating(event.target.value)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>{value}/5</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timerNote">Session note</Label>
                <Input id="timerNote" value={note} onChange={(event) => setNote(event.target.value)} placeholder="What did you work on?" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" type="button" onClick={() => setIsPaused((value) => !value)}>
                <Pause className="mr-2 h-4 w-4" />
                {isPaused ? "Resume display" : "Pause display"}
              </Button>
              <Button variant="destructive" type="button" onClick={stopTimer}>
                <Square className="mr-2 h-4 w-4" />
                Stop and save
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select id="subject" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
                {subjects.length === 0 ? <option value="">Unassigned</option> : null}
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Session title</Label>
              <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Chemistry revision" />
            </div>
            <div className="flex items-end">
              <Button type="button" className="w-full" onClick={startTimer}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            </div>
          </div>
        )}

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
