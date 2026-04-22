import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, RotateCcw, Sparkles } from "lucide-react";
import { DailyForm } from "@/components/study/DailyForm";
import { DailyResults } from "@/components/study/DailyResults";
import { WeeklyDashboard } from "@/components/study/WeeklyDashboard";
import {
  analyzeDay, clearRecords, loadRecords, saveRecord, todayMotivation,
  type DayInput, type DayRecord,
} from "@/lib/study-analytics";
import { toast } from "sonner";

const Index = () => {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [today, setToday] = useState<DayRecord | null>(null);
  const [tab, setTab] = useState("today");
  const motivation = useMemo(() => todayMotivation(), []);

  useEffect(() => {
    const all = loadRecords();
    setRecords(all);
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
    toast.success("Day analyzed and saved", { description: `Efficiency: ${record.efficiency}% · Burnout: ${record.burnoutLevel}` });
  };

  const handleReset = () => {
    if (!confirm("Clear all logged days? This cannot be undone.")) return;
    clearRecords();
    setRecords([]);
    setToday(null);
    toast("All data cleared");
  };

  return (
    <main className="min-h-screen px-4 py-8 md:py-12 max-w-6xl mx-auto">
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
              <p className="text-sm text-muted-foreground">Burnout analytics & smart coaching</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="bg-background/50 backdrop-blur">
            <RotateCcw className="h-4 w-4 mr-2" />Reset
          </Button>
        </div>

        <div className="mt-6 glass-card px-5 py-3 flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm italic text-muted-foreground">"{motivation}"</p>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-background/50 backdrop-blur p-1 h-12">
          <TabsTrigger value="today" className="data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground transition-all">
            Today
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground transition-all">
            Weekly Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <DailyForm onAnalyze={handleAnalyze} />
            </div>
            <div className="lg:col-span-3">
              {today ? (
                <DailyResults record={today} />
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

        <TabsContent value="weekly" className="mt-6">
          <WeeklyDashboard records={records} />
        </TabsContent>
      </Tabs>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        Your data stays on this device.
      </footer>
    </main>
  );
};

export default Index;
