import { CalendarDays } from "lucide-react";
import { buildHeatmap, type DayRecord } from "@/lib/study-analytics";

export function CalendarHeatmap({ records }: { records: DayRecord[] }) {
  const cells = buildHeatmap(records, 84); // ~12 weeks
  // Group into weeks (columns of 7)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" /> 12-Week Heatmap
        </h3>
        <Legend />
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {w.map((c) => (
                <div
                  key={c.date}
                  title={`${c.date} — ${c.logged ? c.efficiency + "% efficiency" : "no entry"}`}
                  className="w-3.5 h-3.5 rounded-sm transition-transform hover:scale-150 cursor-pointer"
                  style={{ background: cellColor(c.efficiency, c.logged) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function cellColor(eff: number, logged: boolean) {
  if (!logged) return "hsl(var(--muted))";
  if (eff >= 80) return "hsl(var(--primary))";
  if (eff >= 60) return "hsl(var(--primary) / 0.75)";
  if (eff >= 40) return "hsl(var(--primary) / 0.5)";
  if (eff >= 20) return "hsl(var(--primary) / 0.3)";
  return "hsl(var(--primary) / 0.15)";
}

function Legend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Less</span>
      <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--muted))" }} />
      <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--primary) / 0.3)" }} />
      <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--primary) / 0.5)" }} />
      <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--primary) / 0.75)" }} />
      <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--primary))" }} />
      <span>More</span>
    </div>
  );
}
