"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/browser";
import type { UserSettings } from "@/lib/types";

export function SettingsForm({ userId, settings }: { userId: string; settings: UserSettings | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [remindersEnabled, setRemindersEnabled] = useState(settings?.reminders_enabled ?? true);
  const [startHour, setStartHour] = useState(String(settings?.reminder_start_hour ?? 6));
  const [endHour, setEndHour] = useState(String(settings?.reminder_end_hour ?? 21));
  const [interval, setIntervalHours] = useState(String(settings?.reminder_interval_hours ?? 3));
  const [timezone, setTimezone] = useState(settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [meritsEnabled, setMeritsEnabled] = useState(settings?.enable_merit_points ?? true);
  const [target, setTarget] = useState(String(settings?.daily_study_target_minutes ?? 180));
  const [blockTarget, setBlockTarget] = useState(String(settings?.daily_block_target ?? 6));
  const [elite, setElite] = useState(String(settings?.elite_min_score ?? 8));
  const [strong, setStrong] = useState(String(settings?.strong_min_score ?? 4));
  const [acceptable, setAcceptable] = useState(String(settings?.acceptable_min_score ?? 0));
  const [weak, setWeak] = useState(String(settings?.weak_min_score ?? -5));
  const [warning, setWarning] = useState(String(settings?.demerit_warning_threshold ?? 8));
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        reminders_enabled: remindersEnabled,
        reminder_start_hour: Number(startHour),
        reminder_end_hour: Number(endHour),
        reminder_interval_hours: Number(interval),
        timezone,
        enable_merit_points: meritsEnabled,
        daily_study_target_minutes: Number(target),
        daily_block_target: Number(blockTarget),
        elite_min_score: Number(elite),
        strong_min_score: Number(strong),
        acceptable_min_score: Number(acceptable),
        weak_min_score: Number(weak),
        demerit_warning_threshold: Number(warning),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Settings saved.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Reminder Schedule</CardTitle>
          <CardDescription>Default prompts run every 3 hours during waking hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(event) => setRemindersEnabled(event.target.checked)}
              className="h-4 w-4"
            />
            Enable reminders
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Start hour</Label>
              <Input type="number" min={0} max={23} value={startHour} onChange={(event) => setStartHour(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End hour</Label>
              <Input type="number" min={0} max={23} value={endHour} onChange={(event) => setEndHour(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Interval hours</Label>
              <Input type="number" min={1} max={12} value={interval} onChange={(event) => setIntervalHours(event.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Targets</CardTitle>
          <CardDescription>Used by Reality Check and missed-block estimates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Daily study target minutes</Label>
            <Input type="number" min={0} value={target} onChange={(event) => setTarget(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Expected block logs per day</Label>
            <Input type="number" min={1} max={8} value={blockTarget} onChange={(event) => setBlockTarget(event.target.value)} />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={meritsEnabled}
              onChange={(event) => setMeritsEnabled(event.target.checked)}
              className="h-4 w-4"
            />
            Count merit points
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score Thresholds</CardTitle>
          <CardDescription>Configure daily labels: elite, strong, acceptable, weak, failing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label>Elite</Label>
            <Input type="number" value={elite} onChange={(event) => setElite(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Strong</Label>
            <Input type="number" value={strong} onChange={(event) => setStrong(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Acceptable</Label>
            <Input type="number" value={acceptable} onChange={(event) => setAcceptable(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Weak</Label>
            <Input type="number" value={weak} onChange={(event) => setWeak(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Demerit warning</Label>
            <Input type="number" value={warning} onChange={(event) => setWarning(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="xl:col-span-2">
        <Button type="button" onClick={save}>Save settings</Button>
        {status ? <p className="mt-2 text-sm text-muted-foreground">{status}</p> : null}
      </div>
    </div>
  );
}

