import {
  addDays,
  differenceInCalendarDays,
  differenceInMinutes,
  endOfDay,
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
  subDays,
  subHours,
} from "date-fns";

export function minutesBetween(start: string | Date, end: string | Date) {
  return Math.max(0, differenceInMinutes(new Date(end), new Date(start)));
}

export function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function todayRange() {
  const now = new Date();
  return {
    start: startOfDay(now).toISOString(),
    end: endOfDay(now).toISOString(),
  };
}

export function recentRange(days = 14) {
  return {
    start: startOfDay(subDays(new Date(), days - 1)).toISOString(),
    end: endOfDay(new Date()).toISOString(),
  };
}

export function sevenDayRange() {
  return {
    start: startOfDay(subDays(new Date(), 6)).toISOString(),
    end: endOfDay(new Date()).toISOString(),
  };
}

export function previousThreeHourWindow(now = new Date()) {
  const endHour = Math.floor(now.getHours() / 3) * 3;
  const end = new Date(now);
  end.setHours(endHour, 0, 0, 0);
  const normalizedEnd = end > now ? subHours(end, 3) : end;
  const blockEnd = normalizedEnd.getTime() === now.getTime() ? now : normalizedEnd;
  return {
    start: subHours(blockEnd, 3),
    end: blockEnd,
  };
}

export function last14Days() {
  return Array.from({ length: 14 }, (_, index) => {
    const date = startOfDay(subDays(new Date(), 13 - index));
    return {
      date,
      iso: format(date, "yyyy-MM-dd"),
      label: isToday(date)
        ? "Today"
        : isYesterday(date)
          ? "Yesterday"
          : format(date, "EEE d"),
    };
  });
}

export function isWithinLast14Days(date: string | Date) {
  const delta = differenceInCalendarDays(startOfDay(new Date()), startOfDay(new Date(date)));
  return delta >= 0 && delta <= 13;
}

export function parseDayParam(day?: string) {
  if (!day) return format(new Date(), "yyyy-MM-dd");
  const parsed = parseISO(day);
  if (!isWithinLast14Days(parsed)) return format(new Date(), "yyyy-MM-dd");
  return format(parsed, "yyyy-MM-dd");
}

export function dayBounds(day: string) {
  const parsed = parseISO(day);
  return {
    start: startOfDay(parsed).toISOString(),
    end: endOfDay(parsed).toISOString(),
    next: addDays(startOfDay(parsed), 1).toISOString(),
  };
}

