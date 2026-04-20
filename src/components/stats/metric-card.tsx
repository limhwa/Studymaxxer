import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "good" | "bad" | "warning" | "info";
  icon?: ReactNode;
};

const tones = {
  default: "text-foreground",
  good: "text-[var(--color-merit)]",
  bad: "text-[var(--color-demerit)]",
  warning: "text-[var(--color-warning)]",
  info: "text-[var(--color-info)]",
};

export function MetricCard({ label, value, detail, tone = "default", icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-32 flex-col justify-between p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <div>
          <p className={cn("font-mono text-3xl font-semibold", tones[tone])}>{value}</p>
          {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

