export interface DayInput {
  studyHours: number;
  breakMinutes: number;
  distractionMinutes: number;
  focusLevel: number;
  sleepHours: number;
  stressLevel: number;
  motivationLevel: number;
}

export interface DayRecord extends DayInput {
  date: string; // YYYY-MM-DD
  effectiveMinutes: number;
  totalMinutes: number;
  efficiency: number;
  efficiencyStatus: string;
  burnoutScore: number;
  burnoutLevel: "Healthy" | "Warning" | "High Burnout Risk";
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

  return { ...input, totalMinutes, effectiveMinutes, efficiency, efficiencyStatus, burnoutScore, burnoutLevel };
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

export function loadRecords(): DayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
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

  // Streak: consecutive days up to today with a record
  const sorted = [...allRecords].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (sorted.find((r) => r.date === key)) streak++;
    else if (i === 0) continue; // allow today not yet logged
    else break;
  }

  let performanceLabel = "Improving";
  const efficiencies = week.map((w) => w.efficiency);
  const variance = stdDev(efficiencies);
  if (avgBurnout >= 2.5) performanceLabel = "Burnout Risk";
  else if (avgEfficiency >= 75 && variance < 10) performanceLabel = "Highly Consistent";
  else if (variance > 20) performanceLabel = "Unstable Routine";

  const weeklyInsights: string[] = [];
  // Mid-week dip
  if (week.length >= 5) {
    const mid = week.slice(2, 5);
    const midAvg = mid.reduce((s, r) => s + r.efficiency, 0) / mid.length;
    if (midAvg < avgEfficiency - 8) weeklyInsights.push("Your focus tends to drop mid-week — plan lighter sessions on those days.");
  }
  // Sleep correlation
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

  const weeklySummary = buildSummary({ avgEfficiency, avgBurnout, totalStudyHours, performanceLabel, week });

  return {
    avgEfficiency, avgBurnout, totalStudyHours,
    totalProductiveMinutes, totalDistractionMinutes, totalBreakMinutes,
    bestDay, worstDay, streak, performanceLabel, weeklyInsights, weeklySummary,
  };
}

function stdDev(arr: number[]) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
}

function buildSummary(p: { avgEfficiency: number; avgBurnout: number; totalStudyHours: number; performanceLabel: string; week: DayRecord[] }) {
  const tone = p.avgEfficiency >= 70
    ? "You showed strong consistency in your studies"
    : p.avgEfficiency >= 50
      ? "You showed steady effort this week"
      : "This week was challenging for your focus";
  const burn = p.avgBurnout >= 2
    ? ", but rising stress and fatigue affected your output"
    : ", with healthy energy levels overall";
  const next = p.avgEfficiency >= 70
    ? "Maintain your sleep and focus rituals to push even higher next week."
    : "Improving your sleep and reducing distractions can significantly boost your results next week.";
  return `${tone}${burn}. You logged ${p.totalStudyHours}h across ${p.week.length} days at ${p.avgEfficiency}% average efficiency. ${next}`;
}

export function dayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
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
