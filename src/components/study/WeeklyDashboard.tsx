import type { DayRecord } from "@/lib/study-analytics";
import { computeWeeklyStats, dayName, getLast7Days } from "@/lib/study-analytics";
import { Award, Calendar, Flame, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeeklyDashboard({ records }: { records: DayRecord[] }) {
  const stats = computeWeeklyStats(records);
  const week = getLast7Days(records);

  if (!stats) {
    return (
      <div className="glass-card p-10 text-center animate-fade-in">
        <Calendar className="h-12 w-12 mx-auto text-primary mb-3" />
        <h3 className="text-xl font-semibold">No data yet</h3>
        <p className="text-muted-foreground mt-2">Log a few days to unlock your weekly analytics.</p>
      </div>
    );
  }

  const lineData = week.map((r) => ({ day: dayName(r.date), efficiency: r.efficiency }));
  const barData = week.map((r) => ({ day: dayName(r.date), hours: r.studyHours }));
  const pieData = [
    { name: "Productive", value: stats.totalProductiveMinutes, color: "hsl(var(--primary))" },
    { name: "Break", value: stats.totalBreakMinutes, color: "hsl(var(--accent))" },
    { name: "Distraction", value: stats.totalDistractionMinutes, color: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);

  const tooltipStyle = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Performance label + streak */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">This Week</p>
          <h2 className="text-3xl font-bold gradient-text mt-1">{stats.performanceLabel}</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 backdrop-blur">
          <Flame className="h-5 w-5 text-warning" />
          <span className="font-semibold">{stats.streak}-day streak</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Avg Efficiency" value={`${stats.avgEfficiency}%`} />
        <Stat label="Avg Burnout" value={stats.avgBurnout.toFixed(1)} />
        <Stat label="Study Hours" value={`${stats.totalStudyHours}h`} />
        <Stat label="Productive" value={`${Math.round(stats.totalProductiveMinutes / 60)}h`} />
        <Stat label="Distraction" value={`${Math.round(stats.totalDistractionMinutes / 60)}h`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Efficiency Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="efficiency" stroke="url(#lineGrad)" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Daily Study Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Weekly Time Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${Math.round(v)} min`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best / Worst */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.bestDay && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-success font-medium text-sm">
              <Award className="h-4 w-4" /> Best Day
            </div>
            <div className="mt-2 text-2xl font-semibold">{dayName(stats.bestDay.date)} — {stats.bestDay.efficiency}%</div>
            <p className="text-sm text-muted-foreground mt-1">{stats.bestDay.studyHours}h studied · focus {stats.bestDay.focusLevel}/10</p>
          </div>
        )}
        {stats.worstDay && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-destructive font-medium text-sm">
              <TrendingDown className="h-4 w-4" /> Learning Opportunity
            </div>
            <div className="mt-2 text-2xl font-semibold">{dayName(stats.worstDay.date)} — {stats.worstDay.efficiency}%</div>
            <p className="text-sm text-muted-foreground mt-1">{stats.worstDay.distractionMinutes}m distractions · sleep {stats.worstDay.sleepHours}h</p>
          </div>
        )}
      </div>

      {/* Weekly insights + summary */}
      <div className="glass-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-primary" /> Weekly Insights
        </h3>
        <ul className="space-y-2">
          {stats.weeklyInsights.map((ins, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-primary">•</span>{ins}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" /> AI Weekly Summary
        </h3>
        <p className="text-base leading-relaxed">{stats.weeklySummary}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl font-bold gradient-text">{value}</div>
    </div>
  );
}
