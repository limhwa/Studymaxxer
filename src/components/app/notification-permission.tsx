"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reminderMessages } from "@/lib/constants";
import type { UserSettings } from "@/lib/types";

export function NotificationPermission({ settings }: { settings: UserSettings | null }) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!("Notification" in window)) {
        setPermission("unsupported");
        return;
      }
      setPermission(Notification.permission);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!settings?.reminders_enabled || permission !== "granted") return;

    const interval = window.setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const start = settings.reminder_start_hour;
      const end = settings.reminder_end_hour;
      const step = settings.reminder_interval_hours;

      if (minute !== 0 || hour < start || hour > end || (hour - start) % step !== 0) return;

      const key = `reminder-${now.toISOString().slice(0, 13)}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "sent");

      const message = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
      const notification = new Notification("Reality Ledger", {
        body: message,
        tag: key,
      });
      notification.onclick = () => {
        window.focus();
        window.location.href = "/log-block";
      };
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [permission, settings]);

  async function requestPermission() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  if (permission === "granted") return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium">Browser reminders are off</p>
        <p className="text-xs text-muted-foreground">
          Web reminders work while the browser allows this app to run. Mobile local notifications are more reliable.
        </p>
      </div>
      <Button onClick={requestPermission} disabled={permission === "unsupported"} variant="outline">
        <Bell className="mr-2 h-4 w-4" />
        {permission === "unsupported" ? "Unsupported" : "Enable web reminders"}
      </Button>
    </div>
  );
}
