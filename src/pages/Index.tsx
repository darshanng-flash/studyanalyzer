import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, RotateCcw, Sparkles } from "lucide-react";
import { DailyForm } from "@/components/study/DailyForm";
import { DailyResults } from "@/components/study/DailyResults";
import { WeeklyDashboard } from "@/components/study/WeeklyDashboard";
import { GamificationCard } from "@/components/study/GamificationCard";
import { CalendarHeatmap } from "@/components/study/CalendarHeatmap";
import { GoalCard } from "@/components/study/GoalCard";
import { ThemeToggle } from "@/components/study/ThemeToggle";
import { SmartNotifications } from "@/components/study/SmartNotifications";
import { MicroGoals } from "@/components/study/MicroGoals";
import {
  analyzeDay, clearRecords, computeAchievements, computeLevel, getLast7Days,
  loadRecords, loadWeeklyGoal, saveRecord, saveWeeklyGoal, todayMotivation, totalXP,
  type DayInput, type DayRecord,
} from "@/lib/study-analytics";
import { toast } from "sonner";

const Index = () => {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [today, setToday] = useState<DayRecord | null>(null);
  const [tab, setTab] = useState("today");
  const [weeklyGoal, setWeeklyGoal] = useState<number>(25);
  const motivation = useMemo(() => todayMotivation(), []);

  useEffect(() => {
    const all = loadRecords();
    setRecords(all);
    setWeeklyGoal(loadWeeklyGoal());
    const date = new Date().toISOString().slice(0, 10);
    const existing = all.find((r) => r.date === date);
    if (existing) setToday(existing);
  }, []);

  const handleAnalyze = (input: DayInput) => {
    const date = new Date().toISOString().slice(0, 10);
    const computed = analyzeDay(input);
    const record: DayRecord = { date, ...computed };
    saveRecord(record);
    setToday(record);
    setRecords(loadRecords());
    toast.success("Day analyzed and saved", { description: `+${record.xp} XP · Efficiency ${record.efficiency}%` });
  };

  const handleReset = () => {
    if (!confirm("Clear all logged days? This cannot be undone.")) return;
    clearRecords();
    setRecords([]);
    setToday(null);
    setWeeklyGoal(25);
    toast("All data cleared");
  };

  const handleGoalChange = (n: number) => {
    setWeeklyGoal(n);
    saveWeeklyGoal(n);
    toast.success(`Weekly goal set to ${n}h`);
  };

  const xp = totalXP(records);
  const level = computeLevel(xp);
  const achievements = computeAchievements(records);
  const week = getLast7Days(records);
  const weekHours = week.reduce((s, r) => s + r.studyHours, 0);
  const streak = (() => {
    // light streak read-out (matches engine logic loosely)
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    let s = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if (sorted.find((r) => r.date === k)) s++;
      else if (i === 0) continue;
      else break;
    }
    return s;
  })();
  const dayOfWeek = Math.min(7, new Date().getDay() === 0 ? 7 : new Date().getDay());

  return (
    <main className="min-h-screen px-4 py-8 md:py-12 max-w-6xl mx-auto transition-colors">
      {/* Header */}
      <header className="mb-8 md:mb-12 animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-[var(--shadow-glow)]">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Study <span className="gradient-text">Efficiency</span>
              </h1>
              <p className="text-sm text-muted-foreground">Smart coach · Burnout analytics · Habit builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleReset} className="bg-background/50 backdrop-blur">
              <RotateCcw className="h-4 w-4 mr-2" />Reset
            </Button>
          </div>
        </div>

        <div className="mt-6 glass-card px-5 py-3 flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm italic text-muted-foreground">"{motivation}"</p>
        </div>
      </header>

      {/* Smart notifications */}
      <div className="mb-6">
        <SmartNotifications records={records} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto bg-background/50 backdrop-blur p-1 h-12">
          <TabsTrigger value="today" className="data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground transition-all">
            Today
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground transition-all">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground transition-all">
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 mt-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DailyForm onAnalyze={handleAnalyze} />
              <GoalCard goal={weeklyGoal} current={weekHours} daysElapsed={dayOfWeek} onChange={handleGoalChange} />
            </div>
            <div className="lg:col-span-3 space-y-6">
              {today ? (
                <>
                  <DailyResults record={today} />
                  <MicroGoals record={today} />
                </>
              ) : (
                <div className="glass-card p-10 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                  <Sparkles className="h-12 w-12 text-primary mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold gradient-text">Ready when you are</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">
                    Fill in today's check-in and tap "Analyze My Day" to unlock your personalized study insights.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6 animate-fade-in">
          <WeeklyDashboard records={records} level={level} totalXP={xp} />
        </TabsContent>

        <TabsContent value="progress" className="mt-6 space-y-6 animate-fade-in">
          <GamificationCard totalXP={xp} level={level} streak={streak} achievements={achievements} />
          <CalendarHeatmap records={records} />
        </TabsContent>
      </Tabs>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        Your data stays on this device.
      </footer>
    </main>
  );
};

export default Index;
