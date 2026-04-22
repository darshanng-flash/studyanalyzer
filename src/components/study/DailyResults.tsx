import { Progress } from "@/components/ui/progress";
import { AlertCircle, Brain, CheckCircle2, Lightbulb, Target, TrendingUp, Zap } from "lucide-react";
import type { DayRecord } from "@/lib/study-analytics";
import { generateDailyInsights, generateSuggestions, realityCheck } from "@/lib/study-analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props { record: DayRecord; }

export function DailyResults({ record }: Props) {
  const insights = generateDailyInsights(record);
  const suggestions = generateSuggestions(record);
  const reality = realityCheck(record);

  const burnoutColor =
    record.burnoutLevel === "Healthy" ? "success" :
    record.burnoutLevel === "Warning" ? "warning" : "destructive";

  const breakdown = [
    { name: "Productive", value: record.effectiveMinutes, color: "hsl(var(--primary))" },
    { name: "Break", value: record.breakMinutes, color: "hsl(var(--accent))" },
    { name: "Distraction", value: record.distractionMinutes, color: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);

  const effHours = Math.floor(record.effectiveMinutes / 60);
  const effMins = record.effectiveMinutes % 60;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Reality check banner */}
      <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: "hsl(var(--primary))" }}>
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Reality Check</p>
            <p className="text-base md:text-lg font-medium">{reality}</p>
          </div>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Effective Study"
          value={`${effHours}h ${effMins}m`}
          subtitle={`of ${record.studyHours}h logged`}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Efficiency"
          value={`${record.efficiency}%`}
          subtitle={record.efficiencyStatus}
          progress={record.efficiency}
        />
        <BurnoutCard score={record.burnoutScore} level={record.burnoutLevel} color={burnoutColor} />
      </div>

      {/* Breakdown chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" /> Time Breakdown
          </h3>
          {breakdown.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {breakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }}
                    formatter={(v: number) => `${v} min`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Log some study time to see a breakdown.</p>
          )}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {breakdown.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}: {d.value}m</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> Smart Insights
          </h3>
          <ul className="space-y-3">
            {insights.map((ins, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" /> Action Suggestions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((s, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary/50 backdrop-blur text-sm">
              <span className="w-6 h-6 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle, progress }: { icon: React.ReactNode; label: string; value: string; subtitle?: string; progress?: number }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold gradient-text">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      {progress !== undefined && <Progress value={progress} className="h-2 mt-3" />}
    </div>
  );
}

function BurnoutCard({ score, level, color }: { score: number; level: string; color: string }) {
  const pct = (score / 4) * 100;
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
        <AlertCircle className={`h-5 w-5 text-${color}`} />
        Burnout Risk
      </div>
      <div className={`mt-2 text-3xl font-bold text-${color}`}>{level}</div>
      <div className="text-xs text-muted-foreground mt-1">Score: {score} / 4</div>
      <div className="h-2 mt-3 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full bg-${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
