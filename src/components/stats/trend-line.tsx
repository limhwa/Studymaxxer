"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailySummary } from "@/lib/types";

export function TrendLine({ data }: { data: DailySummary[] }) {
  const chartData = data.map((day) => ({
    day: day.day.slice(5),
    study: Math.round(day.study_minutes / 60),
    net: day.net_points,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="study"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.16}
            name="Study hours"
          />
          <Area
            type="monotone"
            dataKey="net"
            stroke="var(--color-info)"
            fill="var(--color-info)"
            fillOpacity={0.12}
            name="Net points"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

