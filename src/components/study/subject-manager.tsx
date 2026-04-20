"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultSubjectColors } from "@/lib/constants";
import { createClient } from "@/lib/supabase/browser";
import type { Subject } from "@/lib/types";

export function SubjectManager({ userId, subjects }: { userId: string; subjects: Subject[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultSubjectColors[0]);
  const [status, setStatus] = useState<string | null>(null);

  async function addSubject() {
    if (!name.trim()) return;
    const { error } = await supabase.from("subjects").insert({
      user_id: userId,
      name: name.trim(),
      color,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setName("");
    setStatus("Subject added.");
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subjects</CardTitle>
        <CardDescription>Colors are snapshotted onto study sessions for stable history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <span key={subject.id} className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
              {subject.name}
            </span>
          ))}
          {subjects.length === 0 ? <p className="text-sm text-muted-foreground">No subjects yet.</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
          <div className="space-y-2">
            <Label>New subject</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Physics" />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addSubject}>Add</Button>
          </div>
        </div>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  );
}

