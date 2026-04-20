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
import { behaviorCategories, severityLabels } from "@/lib/constants";
import { signedPoints } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/browser";
import type { ActivityBlock, BehaviorCategory, BehaviorLog, BehaviorSeverity, BehaviorType, StudySession } from "@/lib/types";

function inputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function BehaviorLogger({
  userId,
  types,
  logs,
  blocks,
  sessions,
}: {
  userId: string;
  types: BehaviorType[];
  logs: BehaviorLog[];
  blocks: ActivityBlock[];
  sessions: StudySession[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const selectedType = types.find((type) => type.id === typeId) ?? types[0];
  const [eventTime, setEventTime] = useState(inputDate(new Date()));
  const [points, setPoints] = useState(String(selectedType?.default_points ?? 0));
  const [note, setNote] = useState("");
  const [blockId, setBlockId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [manualPoints, setManualPoints] = useState("-1");
  const [manualReason, setManualReason] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [ruleCategory, setRuleCategory] = useState<BehaviorCategory>("discipline");
  const [ruleSeverity, setRuleSeverity] = useState<BehaviorSeverity>("minor");
  const [rulePoints, setRulePoints] = useState("-1");
  const [status, setStatus] = useState<string | null>(null);

  function chooseType(value: string) {
    setTypeId(value);
    const next = types.find((type) => type.id === value);
    if (next) setPoints(String(next.default_points));
  }

  async function logBehavior() {
    if (!selectedType) return;
    setStatus(null);
    const { error } = await supabase.from("behavior_logs").insert({
      user_id: userId,
      event_time: new Date(eventTime).toISOString(),
      behavior_type_id: selectedType.id,
      behavior_name_snapshot: selectedType.name,
      category_snapshot: selectedType.category,
      severity_snapshot: selectedType.severity,
      note: note || null,
      linked_block_id: blockId || null,
      linked_study_session_id: sessionId || null,
      points_delta: Number(points),
    });

    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Behavior logged and points transaction created.");
    window.location.reload();
  }

  async function addManualPoints() {
    if (!manualReason.trim()) {
      setStatus("Manual adjustments require a reason.");
      return;
    }
    const { error } = await supabase.from("points_transactions").insert({
      user_id: userId,
      source_type: "manual_adjustment",
      points_value: Number(manualPoints),
      reason: manualReason.trim(),
    });

    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Manual point adjustment saved.");
    window.location.reload();
  }

  async function createRule() {
    if (!ruleName.trim()) return;
    const value = Number(rulePoints);
    const { error } = await supabase.from("behavior_types").insert({
      user_id: userId,
      name: ruleName.trim(),
      category: ruleCategory,
      severity: ruleSeverity,
      default_points: value,
      is_positive: value > 0,
      is_system: false,
    });

    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Custom behavior rule created.");
    window.location.reload();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Behavior</CardTitle>
            <CardDescription>Rule-based events create point transactions automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_170px]">
              <div className="space-y-2">
                <Label>Behavior</Label>
                <Select value={typeId} onChange={(event) => chooseType(event.target.value)}>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({signedPoints(type.default_points)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" value={points} onChange={(event) => setPoints(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Event time</Label>
                <Input type="datetime-local" value={eventTime} onChange={(event) => setEventTime(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Linked block</Label>
                <Select value={blockId} onChange={(event) => setBlockId(event.target.value)}>
                  <option value="">None</option>
                  {blocks.map((block) => (
                    <option key={block.id} value={block.id}>{format(new Date(block.block_start_time), "MMM d HH:mm")} · {block.short_summary.slice(0, 42)}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Linked study session</Label>
              <Select value={sessionId} onChange={(event) => setSessionId(event.target.value)}>
                <option value="">None</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {format(new Date(session.start_time), "MMM d HH:mm")} · {session.subject_name ?? "Unassigned"}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="What happened, honestly?" />
            </div>
            <Button type="button" onClick={logBehavior}>Log behavior</Button>
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Point Adjustment</CardTitle>
            <CardDescription>Use sparingly, with an audit reason.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[150px_1fr_auto]">
            <div className="space-y-2">
              <Label>Points</Label>
              <Input type="number" value={manualPoints} onChange={(event) => setManualPoints(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={manualReason} onChange={(event) => setManualReason(event.target.value)} placeholder="Manual correction" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" type="button" onClick={addManualPoints}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Rule</CardTitle>
            <CardDescription>Define your own demerit or merit behavior presets.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Rule name</Label>
              <Input value={ruleName} onChange={(event) => setRuleName(event.target.value)} placeholder="Broke no-distraction rule" />
            </div>
            <div className="space-y-2">
              <Label>Default points</Label>
              <Input type="number" value={rulePoints} onChange={(event) => setRulePoints(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={ruleCategory} onChange={(event) => setRuleCategory(event.target.value as BehaviorCategory)}>
                {behaviorCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={ruleSeverity} onChange={(event) => setRuleSeverity(event.target.value as BehaviorSeverity)}>
                {Object.entries(severityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button type="button" onClick={createRule}>Create rule</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Behavior</CardTitle>
          <CardDescription>Audit trail for the last 14 days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{log.behavior_name_snapshot}</p>
                <Badge variant={log.points_delta < 0 ? "demerit" : "merit"}>{signedPoints(log.points_delta)}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(log.event_time), "MMM d HH:mm")} · {log.category_snapshot} · {log.severity_snapshot}
              </p>
              {log.note ? <p className="mt-2 text-sm">{log.note}</p> : null}
            </div>
          ))}
          {logs.length === 0 ? <p className="text-sm text-muted-foreground">No behavior logs yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

