export interface DayInput {
  studyHours: number;
  breakMinutes: number;
  distractionMinutes: number;
  focusLevel: number;
  sleepHours: number;
  stressLevel: number;
  motivationLevel: number;
  studyTimeOfDay?: "morning" | "afternoon" | "evening" | "night";
}

export interface DayRecord extends DayInput {
  date: string; // YYYY-MM-DD
  effectiveMinutes: number;
  totalMinutes: number;
  efficiency: number;
  efficiencyStatus: string;
  burnoutScore: number;
  burnoutLevel: "Healthy" | "Warning" | "High Burnout Risk";
  xp: number;
}

export function analyzeDay(input: DayInput): Omit<DayRecord, "date"> {
  const totalMinutes = Math.max(0, input.studyHours * 60);
  const lost = Math.min(totalMinutes, input.breakMinutes + input.distractionMinutes);
  const effectiveMinutes = Math.max(0, totalMinutes - lost);
  const efficiency = totalMinutes > 0 ? Math.round((effectiveMinutes / totalMinutes) * 100) : 0;

  let efficiencyStatus = "Highly distracted";
  if (efficiency >= 80) efficiencyStatus = "Excellent Focus";
  else if (efficiency >= 60) efficiencyStatus = "Good, can improve";
  else if (efficiency >= 40) efficiencyStatus = "Low focus";

  let burnoutScore = 0;
  if (input.sleepHours < 6) burnoutScore++;
  if (input.stressLevel > 7) burnoutScore++;
  if (input.motivationLevel < 4) burnoutScore++;
  if (input.studyHours > 8) burnoutScore++;

  let burnoutLevel: DayRecord["burnoutLevel"] = "Healthy";
  if (burnoutScore === 2) burnoutLevel = "Warning";
  else if (burnoutScore >= 3) burnoutLevel = "High Burnout Risk";

  // XP: efficiency * hours weighting + bonus
  const xp = Math.round(efficiency * input.studyHours * 0.5 + (input.distractionMinutes === 0 ? 25 : 0));

  return { ...input, totalMinutes, effectiveMinutes, efficiency, efficiencyStatus, burnoutScore, burnoutLevel, xp };
}

export function generateDailyInsights(r: Omit<DayRecord, "date">): string[] {
  const insights: string[] = [];
  if (r.studyHours >= 5 && r.efficiency < 60)
    insights.push("You're putting in long hours, but efficiency is low — quality beats quantity.");
  if (r.sleepHours < 6)
    insights.push("Low sleep is quietly draining your focus and recovery.");
  if (r.motivationLevel < 4 && r.studyHours > 4)
    insights.push("High effort with low motivation is an early burnout signal.");
  if (r.distractionMinutes > 60)
    insights.push(`You lost over ${Math.round(r.distractionMinutes / 60 * 10) / 10}h to distractions today.`);
  if (r.focusLevel >= 8 && r.efficiency >= 75)
    insights.push("Strong focus today — this is your repeatable formula.");
  if (r.stressLevel > 7)
    insights.push("Stress levels are elevated — short walks and breath work help.");
  if (insights.length === 0)
    insights.push("A balanced day overall. Keep this rhythm consistent.");
  return insights.slice(0, 3);
}

export function generateSuggestions(r: Omit<DayRecord, "date">): string[] {
  const s: string[] = [];
  if (r.distractionMinutes > 45) s.push("Reduce phone usage — try app blockers during study blocks.");
  if (r.sleepHours < 7) s.push("Aim for 7+ hours of sleep tonight to restore focus.");
  if (r.burnoutScore >= 3) s.push("Take a recovery day — rest is part of the work.");
  if (r.focusLevel < 6) s.push("Try the Pomodoro technique: 25 min focus, 5 min break.");
  if (r.breakMinutes < 15 && r.studyHours > 3) s.push("Add short breaks — your brain consolidates during them.");
  if (r.stressLevel > 6) s.push("Try a 5-minute breathing exercise before the next session.");
  if (s.length === 0) s.push("Maintain your current habits — they're working.");
  return s.slice(0, 4);
}

export function microGoals(r: Omit<DayRecord, "date">): string[] {
  const g: string[] = [];
  if (r.distractionMinutes > 30) g.push(`Reduce distractions by ${Math.min(30, Math.round(r.distractionMinutes / 2))} minutes tomorrow.`);
  if (r.focusLevel < 7) g.push("Try 2 deep-focus sessions of 45 minutes tomorrow.");
  if (r.sleepHours < 7) g.push("Sleep at least 7.5 hours tonight.");
  if (r.studyHours < 3) g.push("Add one extra 30-minute study block tomorrow.");
  if (g.length === 0) g.push("Repeat today's pattern — it's a winning formula.");
  return g.slice(0, 3);
}

export function realityCheck(r: Omit<DayRecord, "date">): string {
  const lostHours = (r.breakMinutes + r.distractionMinutes) / 60;
  if (r.distractionMinutes >= 30) {
    return `You lost ${(r.distractionMinutes / 60).toFixed(1)} hours today to distractions. Reclaim them tomorrow.`;
  }
  if (r.efficiency >= 80) {
    return `You converted ${r.efficiency}% of your time into real progress. That's elite focus.`;
  }
  if (lostHours > 1) {
    return `${lostHours.toFixed(1)} hours slipped away today. Awareness is the first win.`;
  }
  return "A solid, focused day. Small consistent wins compound.";
}

const STORAGE_KEY = "study-records-v1";
const GOAL_KEY = "study-weekly-goal-v1";

export function loadRecords(): DayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as DayRecord[];
    // backfill xp on legacy records
    return arr.map((r) => ({ ...r, xp: r.xp ?? Math.round(r.efficiency * r.studyHours * 0.5) }));
  } catch { return []; }
}

export function saveRecord(record: DayRecord) {
  const all = loadRecords();
  const idx = all.findIndex((r) => r.date === record.date);
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  all.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clearRecords() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(GOAL_KEY);
}

export function loadWeeklyGoal(): number {
  const raw = localStorage.getItem(GOAL_KEY);
  return raw ? Number(raw) || 25 : 25;
}
export function saveWeeklyGoal(hours: number) {
  localStorage.setItem(GOAL_KEY, String(hours));
}

export function getLast7Days(records: DayRecord[]): DayRecord[] {
  const now = new Date();
  const seven = new Date(now);
  seven.setDate(now.getDate() - 6);
  const cutoff = seven.toISOString().slice(0, 10);
  return records.filter((r) => r.date >= cutoff);
}

export interface WeeklyStats {
  avgEfficiency: number;
  avgBurnout: number;
  totalStudyHours: number;
  totalProductiveMinutes: number;
  totalDistractionMinutes: number;
  totalBreakMinutes: number;
  bestDay?: DayRecord;
  worstDay?: DayRecord;
  streak: number;
  performanceLabel: string;
  weeklyInsights: string[];
  weeklySummary: string;
  consistencyScore: number;
  trend: "up" | "down" | "flat";
  personality: string;
  bestTimeWindow: string;
  prediction: string;
  weeklyEncouragement: string;
}

export function computeWeeklyStats(allRecords: DayRecord[]): WeeklyStats | null {
  const week = getLast7Days(allRecords);
  if (week.length === 0) return null;

  const avgEfficiency = Math.round(week.reduce((s, r) => s + r.efficiency, 0) / week.length);
  const avgBurnout = Math.round((week.reduce((s, r) => s + r.burnoutScore, 0) / week.length) * 10) / 10;
  const totalStudyHours = Math.round(week.reduce((s, r) => s + r.studyHours, 0) * 10) / 10;
  const totalProductiveMinutes = week.reduce((s, r) => s + r.effectiveMinutes, 0);
  const totalDistractionMinutes = week.reduce((s, r) => s + r.distractionMinutes, 0);
  const totalBreakMinutes = week.reduce((s, r) => s + r.breakMinutes, 0);

  const bestDay = [...week].sort((a, b) => b.efficiency - a.efficiency)[0];
  const worstDay = [...week].sort((a, b) => a.efficiency - b.efficiency)[0];

  const streak = computeStreak(allRecords);

  let performanceLabel = "Improving";
  const efficiencies = week.map((w) => w.efficiency);
  const variance = stdDev(efficiencies);
  if (avgBurnout >= 2.5) performanceLabel = "Burnout Risk";
  else if (avgEfficiency >= 75 && variance < 10) performanceLabel = "Highly Consistent";
  else if (variance > 20) performanceLabel = "Unstable Routine";

  // Consistency score 0-100 (lower variance + more days logged)
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - variance * 2 + week.length * 3)));

  // Trend: compare first half vs second half
  let trend: "up" | "down" | "flat" = "flat";
  if (week.length >= 4) {
    const mid = Math.floor(week.length / 2);
    const first = week.slice(0, mid).reduce((s, r) => s + r.efficiency, 0) / mid;
    const second = week.slice(mid).reduce((s, r) => s + r.efficiency, 0) / (week.length - mid);
    if (second - first > 5) trend = "up";
    else if (first - second > 5) trend = "down";
  }

  const weeklyInsights: string[] = [];
  if (week.length >= 5) {
    const mid = week.slice(2, 5);
    const midAvg = mid.reduce((s, r) => s + r.efficiency, 0) / mid.length;
    if (midAvg < avgEfficiency - 8) weeklyInsights.push("Your focus tends to drop mid-week — plan lighter sessions on those days.");
  }
  const lowSleepDays = week.filter((d) => d.sleepHours < 7);
  if (lowSleepDays.length >= 2) {
    const lowSleepAvg = lowSleepDays.reduce((s, r) => s + r.efficiency, 0) / lowSleepDays.length;
    if (lowSleepAvg < avgEfficiency - 5) weeklyInsights.push("Lower sleep clearly correlates with lower efficiency this week.");
  }
  const highDistractDay = [...week].sort((a, b) => b.distractionMinutes - a.distractionMinutes)[0];
  if (highDistractDay.distractionMinutes > 60) {
    weeklyInsights.push(`Distractions peaked on ${dayName(highDistractDay.date)} (${Math.round(highDistractDay.distractionMinutes)}m).`);
  }
  if (weeklyInsights.length === 0) weeklyInsights.push("Your week looks balanced — keep refining what's working.");

  const personality = derivePersonality(week);
  const bestTimeWindow = deriveBestTime(week);
  const prediction = predictNextDay(week);
  const weeklyEncouragement = buildEncouragement(avgEfficiency, trend);
  const weeklySummary = buildEnhancedSummary({ avgEfficiency, avgBurnout, totalStudyHours, performanceLabel, week, trend });

  return {
    avgEfficiency, avgBurnout, totalStudyHours,
    totalProductiveMinutes, totalDistractionMinutes, totalBreakMinutes,
    bestDay, worstDay, streak, performanceLabel, weeklyInsights, weeklySummary,
    consistencyScore, trend, personality, bestTimeWindow, prediction, weeklyEncouragement,
  };
}

function computeStreak(allRecords: DayRecord[]): number {
  const sorted = [...allRecords].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (sorted.find((r) => r.date === key)) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

function derivePersonality(week: DayRecord[]): string {
  const eveningHeavy = week.filter((r) => r.studyTimeOfDay === "evening" || r.studyTimeOfDay === "night").length;
  const morningHeavy = week.filter((r) => r.studyTimeOfDay === "morning").length;
  const variance = stdDev(week.map((w) => w.efficiency));
  const avgHrs = week.reduce((s, r) => s + r.studyHours, 0) / week.length;
  if (eveningHeavy >= Math.ceil(week.length / 2)) return "Night Owl Learner";
  if (morningHeavy >= Math.ceil(week.length / 2)) return "Early Bird Achiever";
  if (variance < 10 && week.length >= 4) return "Consistent Performer";
  if (variance > 20 || (avgHrs > 6 && week.length <= 3)) return "Last-Minute Sprinter";
  return "Steady Explorer";
}

function deriveBestTime(week: DayRecord[]): string {
  const buckets: Record<string, { sum: number; n: number }> = {};
  week.forEach((r) => {
    const t = r.studyTimeOfDay || "afternoon";
    buckets[t] = buckets[t] || { sum: 0, n: 0 };
    buckets[t].sum += r.efficiency;
    buckets[t].n++;
  });
  let best = ""; let bestAvg = -1;
  Object.entries(buckets).forEach(([k, v]) => {
    const avg = v.sum / v.n;
    if (avg > bestAvg) { bestAvg = avg; best = k; }
  });
  const map: Record<string, string> = {
    morning: "6 AM – 11 AM",
    afternoon: "12 PM – 5 PM",
    evening: "5 PM – 9 PM",
    night: "9 PM – 1 AM",
  };
  return best ? `${map[best]} (${Math.round(bestAvg)}% avg)` : "Log a few days to discover your peak window";
}

function predictNextDay(week: DayRecord[]): string {
  if (week.length === 0) return "Log today to predict tomorrow.";
  const last = week[week.length - 1];
  if (last.sleepHours < 6) return "Your focus may dip tomorrow — sleep was low last night.";
  if (last.burnoutScore >= 3) return "High burnout risk — tomorrow should be a lighter recovery day.";
  if (last.efficiency >= 75 && last.focusLevel >= 7) return "You're likely to stay highly focused tomorrow.";
  if (last.distractionMinutes > 60) return "Distractions are creeping up — set a 'no phone' block tomorrow.";
  return "You're on a stable track — small wins compound tomorrow.";
}

function buildEncouragement(avg: number, trend: "up" | "down" | "flat"): string {
  if (trend === "up") return "Momentum is building — you're trending upward. Keep the rhythm.";
  if (trend === "down" && avg < 60) return "A reset week ahead. Smaller, focused blocks will rebuild your edge.";
  if (avg >= 75) return "Elite-tier consistency. Few maintain this — protect it.";
  return "Steady effort wins. One focused block at a time.";
}

function stdDev(arr: number[]) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
}

function buildEnhancedSummary(p: { avgEfficiency: number; avgBurnout: number; totalStudyHours: number; performanceLabel: string; week: DayRecord[]; trend: "up" | "down" | "flat" }) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const avgSleep = p.week.reduce((s, r) => s + r.sleepHours, 0) / p.week.length;
  const avgDistract = p.week.reduce((s, r) => s + r.distractionMinutes, 0) / p.week.length;
  const avgFocus = p.week.reduce((s, r) => s + r.focusLevel, 0) / p.week.length;

  if (p.avgEfficiency >= 70) strengths.push("strong focus discipline");
  if (avgSleep >= 7) strengths.push("healthy sleep habits");
  if (avgFocus >= 7) strengths.push("high focus quality");
  if (p.trend === "up") strengths.push("upward momentum");

  if (avgDistract > 45) weaknesses.push("rising distractions");
  if (avgSleep < 7) weaknesses.push("inadequate sleep");
  if (p.avgBurnout >= 2) weaknesses.push("early burnout signals");
  if (p.trend === "down") weaknesses.push("a downward efficiency trend");

  const opener = p.avgEfficiency >= 70
    ? "You showed strong consistency this week"
    : p.avgEfficiency >= 50
      ? "You showed steady effort this week"
      : "This week tested your focus";

  const sPart = strengths.length ? `, with ${strengths.slice(0, 2).join(" and ")}` : "";
  const wPart = weaknesses.length ? ` However, ${weaknesses.slice(0, 2).join(" and ")} held you back.` : "";

  const next = p.avgEfficiency >= 70
    ? "Next week, protect your sleep and morning routine to push even higher."
    : "Next week, focus on one improvement: cut distractions in half and sleep 7+ hours.";

  const forecast = p.trend === "up"
    ? "Forecast: another strong week ahead if you maintain the rhythm."
    : p.trend === "down"
      ? "Forecast: a recovery-first week will bring you back stronger."
      : "Forecast: stable performance with room to break through.";

  return `${opener}${sPart}.${wPart} You logged ${p.totalStudyHours}h across ${p.week.length} days at ${p.avgEfficiency}% average efficiency. ${next} ${forecast}`;
}

export function dayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

// XP / Level system
export interface LevelInfo { level: string; index: number; nextLevel: string | null; current: number; needed: number; progress: number; }
const LEVEL_TIERS = [
  { name: "Beginner", threshold: 0 },
  { name: "Focused", threshold: 500 },
  { name: "Pro", threshold: 1500 },
  { name: "Master", threshold: 3500 },
];

export function totalXP(records: DayRecord[]): number {
  return records.reduce((s, r) => s + (r.xp || 0), 0);
}

export function computeLevel(xp: number): LevelInfo {
  let i = 0;
  for (let k = 0; k < LEVEL_TIERS.length; k++) if (xp >= LEVEL_TIERS[k].threshold) i = k;
  const current = LEVEL_TIERS[i];
  const next = LEVEL_TIERS[i + 1] ?? null;
  const inLevel = xp - current.threshold;
  const needed = next ? next.threshold - current.threshold : 1;
  const progress = next ? Math.min(100, Math.round((inLevel / needed) * 100)) : 100;
  return { level: current.name, index: i, nextLevel: next?.name ?? null, current: inLevel, needed, progress };
}

// Achievements
export interface Achievement { id: string; title: string; description: string; emoji: string; unlocked: boolean; }
export function computeAchievements(records: DayRecord[]): Achievement[] {
  const week = getLast7Days(records);
  const streak = computeStreak(records);
  const noDistractDays = records.filter((r) => r.distractionMinutes === 0 && r.studyHours > 0).length;
  const highFocusWeek = week.length >= 5 && week.every((r) => r.efficiency >= 75);
  const totalHours = records.reduce((s, r) => s + r.studyHours, 0);
  const masterDay = records.some((r) => r.efficiency >= 90 && r.studyHours >= 4);
  return [
    { id: "streak3", title: "3 Day Streak", description: "Studied 3 days in a row", emoji: "🔥", unlocked: streak >= 3 },
    { id: "streak7", title: "Week Warrior", description: "7 day streak", emoji: "⚡", unlocked: streak >= 7 },
    { id: "noDistract", title: "No Distraction Day", description: "A day with zero distractions", emoji: "🧠", unlocked: noDistractDays >= 1 },
    { id: "focusWeek", title: "High Focus Week", description: "5+ days at 75%+ efficiency", emoji: "🎯", unlocked: highFocusWeek },
    { id: "marathon", title: "Marathon Mind", description: "50+ total hours logged", emoji: "🏃", unlocked: totalHours >= 50 },
    { id: "masterDay", title: "Elite Day", description: "90%+ efficiency on a 4h+ day", emoji: "👑", unlocked: masterDay },
  ];
}

export const motivationMessages = [
  "Discipline is choosing what you want most over what you want now.",
  "Small steps every day beat big leaps once a week.",
  "Your future self is watching you right now through memories.",
  "Focus is a muscle. Train it gently, daily.",
  "Done is better than perfect. Start where you are.",
  "The expert in anything was once a beginner who didn't quit.",
];

export function todayMotivation() {
  const idx = new Date().getDate() % motivationMessages.length;
  return motivationMessages[idx];
}

// Heatmap data: last N days
export function buildHeatmap(records: DayRecord[], days = 84): { date: string; efficiency: number; logged: boolean }[] {
  const map = new Map(records.map((r) => [r.date, r]));
  const out: { date: string; efficiency: number; logged: boolean }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const rec = map.get(key);
    out.push({ date: key, efficiency: rec?.efficiency ?? 0, logged: !!rec });
  }
  return out;
}
