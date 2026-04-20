import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type {
  ActivityBlock,
  BehaviorLog,
  BehaviorType,
  DailySummary,
  DashboardData,
  PointsTransaction,
  StudySession,
  Subject,
  UserSettings,
} from "@/lib/types";
import { dayBounds, recentRange, sevenDayRange, todayRange } from "@/lib/time";

function asArray<T>(value: T[] | null) {
  return value ?? [];
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Number((sum(values) / values.length).toFixed(1));
}

function mostFrequent(values: string[], fallback: string) {
  if (values.length === 0) return fallback;
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function expectedBlocksElapsed(settings: UserSettings | null) {
  const now = new Date();
  const start = settings?.reminder_start_hour ?? 6;
  const end = settings?.reminder_end_hour ?? 21;
  const interval = settings?.reminder_interval_hours ?? 3;
  let count = 0;
  for (let hour = start; hour <= end; hour += interval) {
    if (now.getHours() >= hour) count += 1;
  }
  return Math.max(1, count);
}

function buildDailySummaries(
  sessions: StudySession[],
  blocks: ActivityBlock[],
  points: PointsTransaction[],
) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    return format(date, "yyyy-MM-dd");
  });

  return days.map<DailySummary>((day) => {
    const daySessions = sessions.filter((session) => session.start_time.slice(0, 10) === day);
    const dayBlocks = blocks.filter((block) => block.block_start_time.slice(0, 10) === day);
    const dayPoints = points.filter((point) => point.created_at.slice(0, 10) === day);
    const merits = sum(dayPoints.filter((point) => point.points_value > 0).map((point) => point.points_value));
    const demerits = sum(dayPoints.filter((point) => point.points_value < 0).map((point) => point.points_value));

    return {
      day,
      study_minutes: sum(daySessions.map((session) => session.duration_minutes)),
      logged_blocks: dayBlocks.length,
      avg_productivity: average(dayBlocks.map((block) => block.productivity_rating)),
      avg_discipline: average(dayBlocks.map((block) => block.discipline_rating)),
      productive_blocks: dayBlocks.filter((block) => block.productivity_rating >= 4).length,
      wasted_blocks: dayBlocks.filter(
        (block) => block.productivity_rating <= 2 || block.wasted_minutes >= 120,
      ).length,
      merits,
      demerits,
      net_points: merits + demerits,
    };
  });
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();
  const today = todayRange();
  const recent = recentRange(14);
  const seven = sevenDayRange();

  const [
    settingsResult,
    subjectsResult,
    runningResult,
    sessionsResult,
    blocksResult,
    behaviorsResult,
    pointsResult,
  ] = await Promise.all([
    supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("subjects").select("*").eq("user_id", userId).order("created_at"),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .is("end_time", null)
      .maybeSingle(),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", recent.start)
      .lte("start_time", recent.end)
      .order("start_time", { ascending: false }),
    supabase
      .from("activity_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("block_end_time", recent.start)
      .lte("block_start_time", recent.end)
      .order("block_start_time", { ascending: false }),
    supabase
      .from("behavior_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("event_time", recent.start)
      .lte("event_time", recent.end)
      .order("event_time", { ascending: false }),
    supabase
      .from("points_transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", recent.start)
      .lte("created_at", recent.end)
      .order("created_at", { ascending: false }),
  ]);

  const settings = (settingsResult.data as UserSettings | null) ?? null;
  const subjects = asArray(subjectsResult.data as Subject[] | null);
  const runningSession = (runningResult.data as StudySession | null) ?? null;
  const sessions = asArray(sessionsResult.data as StudySession[] | null);
  const blocks = asArray(blocksResult.data as ActivityBlock[] | null);
  const behaviors = asArray(behaviorsResult.data as BehaviorLog[] | null);
  const points = asArray(pointsResult.data as PointsTransaction[] | null);

  const todaySessions = sessions.filter((session) => session.start_time >= today.start && session.start_time <= today.end);
  const todayBlocks = blocks.filter((block) => block.block_start_time >= today.start && block.block_start_time <= today.end);
  const todayPoints = points.filter((point) => point.created_at >= today.start && point.created_at <= today.end);
  const sevenDaySessions = sessions.filter((session) => session.start_time >= seven.start);
  const sevenDayPoints = points.filter((point) => point.created_at >= seven.start);

  const todayMerits = sum(todayPoints.filter((point) => point.points_value > 0).map((point) => point.points_value));
  const todayDemerits = sum(todayPoints.filter((point) => point.points_value < 0).map((point) => point.points_value));

  const expected14 = (settings?.daily_block_target ?? 6) * 14;
  const completionRate14d = Math.round((blocks.length / Math.max(1, expected14)) * 100);
  const missedBlocksToday = Math.max(0, expectedBlocksElapsed(settings) - todayBlocks.length);
  const productiveBlocks14d = blocks.filter((block) => block.productivity_rating >= 4).length;
  const wastedBlocks14d = blocks.filter((block) => block.productivity_rating <= 2 || block.wasted_minutes >= 120).length;

  return {
    settings,
    subjects,
    runningSession,
    todayStudyMinutes: sum(todaySessions.map((session) => session.duration_minutes)),
    todayProductivity: average(todayBlocks.map((block) => block.productivity_rating)),
    todayDiscipline: average(todayBlocks.map((block) => block.discipline_rating)),
    todayDemerits,
    todayMerits,
    todayNet: todayMerits + todayDemerits,
    sevenDayStudyMinutes: sum(sevenDaySessions.map((session) => session.duration_minutes)),
    sevenDayNet: sum(sevenDayPoints.map((point) => point.points_value)),
    missedBlocksToday,
    completionRate14d,
    productiveBlocks14d,
    wastedBlocks14d,
    worstDistraction: mostFrequent(
      behaviors
        .filter((behavior) => behavior.category_snapshot === "distraction" || behavior.points_delta < 0)
        .map((behavior) => behavior.behavior_name_snapshot),
      "No recurring issue yet",
    ),
    mostUsedSubject: mostFrequent(
      sessions.map((session) => session.subject_name ?? "Unassigned"),
      "No study sessions yet",
    ),
    recentSessions: sessions.slice(0, 8),
    recentBlocks: blocks.slice(0, 8),
    recentBehaviors: behaviors.slice(0, 8),
    recentPoints: points.slice(0, 10),
    dailySummaries: buildDailySummaries(sessions, blocks, points),
  };
}

export async function getBehaviorPageData(userId: string) {
  const supabase = await createClient();
  const recent = recentRange(14);

  const [typesResult, logsResult, blocksResult, sessionsResult] = await Promise.all([
    supabase
      .from("behavior_types")
      .select("*")
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .order("is_positive", { ascending: true })
      .order("name"),
    supabase
      .from("behavior_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("event_time", recent.start)
      .order("event_time", { ascending: false })
      .limit(30),
    supabase
      .from("activity_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("block_end_time", recent.start)
      .order("block_start_time", { ascending: false })
      .limit(20),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", recent.start)
      .order("start_time", { ascending: false })
      .limit(20),
  ]);

  return {
    types: asArray(typesResult.data as BehaviorType[] | null),
    logs: asArray(logsResult.data as BehaviorLog[] | null),
    blocks: asArray(blocksResult.data as ActivityBlock[] | null),
    sessions: asArray(sessionsResult.data as StudySession[] | null),
  };
}

export async function getStudyPageData(userId: string) {
  const supabase = await createClient();
  const recent = recentRange(14);

  const [subjectsResult, runningResult, sessionsResult] = await Promise.all([
    supabase.from("subjects").select("*").eq("user_id", userId).eq("is_archived", false).order("name"),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .is("end_time", null)
      .maybeSingle(),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", recent.start)
      .order("start_time", { ascending: false })
      .limit(40),
  ]);

  return {
    subjects: asArray(subjectsResult.data as Subject[] | null),
    runningSession: (runningResult.data as StudySession | null) ?? null,
    sessions: asArray(sessionsResult.data as StudySession[] | null),
  };
}

export async function getBlockPageData(userId: string) {
  const supabase = await createClient();
  const recent = recentRange(14);

  const [blocksResult, sessionsResult] = await Promise.all([
    supabase
      .from("activity_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("block_end_time", recent.start)
      .order("block_start_time", { ascending: false })
      .limit(24),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", recent.start)
      .order("start_time", { ascending: false })
      .limit(40),
  ]);

  return {
    blocks: asArray(blocksResult.data as ActivityBlock[] | null),
    sessions: asArray(sessionsResult.data as StudySession[] | null),
  };
}

export async function getCalendarPageData(userId: string, selectedDay: string) {
  const supabase = await createClient();
  const recent = recentRange(14);
  const selected = dayBounds(selectedDay);

  const [sessionsResult, blocksResult, behaviorsResult, pointsResult] = await Promise.all([
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", recent.start)
      .lte("start_time", recent.end)
      .order("start_time", { ascending: false }),
    supabase
      .from("activity_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("block_end_time", recent.start)
      .lte("block_start_time", recent.end)
      .order("block_start_time", { ascending: false }),
    supabase
      .from("behavior_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("event_time", recent.start)
      .lte("event_time", recent.end)
      .order("event_time", { ascending: false }),
    supabase
      .from("points_transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", recent.start)
      .lte("created_at", recent.end)
      .order("created_at", { ascending: false }),
  ]);

  const sessions = asArray(sessionsResult.data as StudySession[] | null);
  const blocks = asArray(blocksResult.data as ActivityBlock[] | null);
  const behaviors = asArray(behaviorsResult.data as BehaviorLog[] | null);
  const points = asArray(pointsResult.data as PointsTransaction[] | null);

  return {
    selectedDay: format(parseISO(selectedDay), "yyyy-MM-dd"),
    dailySummaries: buildDailySummaries(sessions, blocks, points),
    sessions: sessions.filter((item) => item.start_time >= selected.start && item.start_time < selected.next),
    blocks: blocks.filter((item) => item.block_start_time >= selected.start && item.block_start_time < selected.next),
    behaviors: behaviors.filter((item) => item.event_time >= selected.start && item.event_time < selected.next),
    points: points.filter((item) => item.created_at >= selected.start && item.created_at < selected.next),
  };
}

