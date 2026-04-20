"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/browser";
import type { Subject } from "@/lib/types";
import { minutesBetween } from "@/lib/time";

function inputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function ManualSessionForm({ userId, subjects }: { userId: string; subjects: Subject[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [start, setStart] = useState(() => inputDate(new Date(Date.now() - 60 * 60_000)));
  const [end, setEnd] = useState(() => inputDate(new Date()));
  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState("4");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setStatus(null);
    const subject = subjects.find((item) => item.id === subjectId);
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = minutesBetween(startDate, endDate);
    if (duration <= 0) {
      setStatus("End time must be after start time.");
      return;
    }

    const { error } = await supabase.from("study_sessions").insert({
      user_id: userId,
      subject_id: subject?.id ?? null,
      subject_name: subject?.name ?? null,
      subject_color: subject?.color ?? null,
      session_title: title || null,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      duration_minutes: duration,
      session_mode: "manual",
      focus_rating: Number(focus),
      note: note || null,
    });

    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Manual session saved.");
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Study Entry</CardTitle>
        <CardDescription>Use this when the timer was forgotten or needs correction.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
            {subjects.length === 0 ? <option value="">Unassigned</option> : null}
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Question practice" />
        </div>
        <div className="space-y-2">
          <Label>Start</Label>
          <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End</Label>
          <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Focus</Label>
          <Select value={focus} onChange={(event) => setFocus(event.target.value)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>{value}/5</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Note</Label>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional correction note" />
        </div>
        <div className="md:col-span-2">
          <Button type="button" onClick={save}>Save manual session</Button>
          {status ? <p className="mt-2 text-sm text-muted-foreground">{status}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
