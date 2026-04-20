export type ActivityType =
  | "studying"
  | "classes"
  | "homework"
  | "revision"
  | "reading"
  | "exercise"
  | "chores"
  | "leisure"
  | "social"
  | "sleep"
  | "commute"
  | "screen_time"
  | "procrastination"
  | "mixed"
  | "other";

export type BehaviorCategory =
  | "distraction"
  | "discipline"
  | "consistency"
  | "focus"
  | "health"
  | "sleep"
  | "planning"
  | "productivity"
  | "conduct"
  | "other";

export type BehaviorSeverity = "minor" | "moderate" | "major";
export type SessionMode = "timer" | "manual";
export type SourceType =
  | "behavior"
  | "manual_adjustment"
  | "activity_block"
  | "study_session"
  | "system_rule";

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_archived: boolean;
  created_at: string;
};

export type StudySession = {
  id: string;
  user_id: string;
  subject_id: string | null;
  subject_name: string | null;
  subject_color: string | null;
  session_title: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  session_mode: SessionMode;
  focus_rating: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityBlock = {
  id: string;
  user_id: string;
  block_start_time: string;
  block_end_time: string;
  primary_activity_type: ActivityType;
  secondary_activity_type: string | null;
  productivity_rating: number;
  discipline_rating: number;
  mood: string | null;
  short_summary: string;
  detailed_note: string | null;
  study_minutes: number;
  wasted_minutes: number;
  created_at: string;
  updated_at: string;
};

export type BehaviorType = {
  id: string;
  user_id: string | null;
  name: string;
  category: BehaviorCategory;
  severity: BehaviorSeverity;
  default_points: number;
  is_positive: boolean;
  is_system: boolean;
  created_at: string;
};

export type BehaviorLog = {
  id: string;
  user_id: string;
  event_time: string;
  behavior_type_id: string;
  behavior_name_snapshot: string;
  category_snapshot: BehaviorCategory;
  severity_snapshot: BehaviorSeverity;
  note: string | null;
  linked_block_id: string | null;
  linked_study_session_id: string | null;
  points_delta: number;
  created_at: string;
};

export type PointsTransaction = {
  id: string;
  user_id: string;
  source_type: SourceType;
  source_id: string | null;
  points_value: number;
  reason: string;
  created_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  reminders_enabled: boolean;
  reminder_start_hour: number;
  reminder_end_hour: number;
  reminder_interval_hours: number;
  timezone: string;
  enable_merit_points: boolean;
  daily_study_target_minutes: number;
  daily_block_target: number;
  elite_min_score: number;
  strong_min_score: number;
  acceptable_min_score: number;
  weak_min_score: number;
  demerit_warning_threshold: number;
  created_at: string;
  updated_at: string;
};

export type DailySummary = {
  day: string;
  study_minutes: number;
  logged_blocks: number;
  avg_productivity: number;
  avg_discipline: number;
  productive_blocks: number;
  wasted_blocks: number;
  demerits: number;
  merits: number;
  net_points: number;
};

export type DashboardData = {
  settings: UserSettings | null;
  subjects: Subject[];
  runningSession: StudySession | null;
  todayStudyMinutes: number;
  todayProductivity: number;
  todayDiscipline: number;
  todayDemerits: number;
  todayMerits: number;
  todayNet: number;
  sevenDayStudyMinutes: number;
  sevenDayNet: number;
  missedBlocksToday: number;
  completionRate14d: number;
  productiveBlocks14d: number;
  wastedBlocks14d: number;
  worstDistraction: string;
  mostUsedSubject: string;
  recentSessions: StudySession[];
  recentBlocks: ActivityBlock[];
  recentBehaviors: BehaviorLog[];
  recentPoints: PointsTransaction[];
  dailySummaries: DailySummary[];
};

